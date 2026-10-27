/**
 * Frame Splitter Utility for Figma multi-frame paste & uploads
 * Detects side-by-side frames pasted from Figma and slices them into individual screens.
 */

export interface FrameSlice {
	url: string;
	width: number;
	height: number;
}

export interface SplitResult {
	isMultiFrame: boolean;
	frames: FrameSlice[];
	detectedCount: number;
	reason?: "gutter" | "aspect-ratio" | "manual";
}

/**
 * Checks if an image aspect ratio suggests multiple mobile or desktop screens side-by-side
 */
export function isLikelyMultiFrame(
	width: number,
	height: number,
	platform: "ios" | "web" = "ios",
): boolean {
	if (!width || !height) return false;
	const ratio = width / height;

	if (platform === "ios") {
		// Single mobile screen is ~0.45 - 0.58
		// Two or more mobile screens side-by-side is >= 0.75
		return ratio >= 0.75;
	}

	// Desktop screen is ~1.6 - 1.8. Two desktop screens side-by-side is >= 3.0
	return ratio >= 3.0;
}

/**
 * Analyzes an image data URL or image element to detect and slice multiple frames
 */
export async function detectAndSplitFrames(
	imageUrl: string,
	options?: {
		platform?: "ios" | "web";
		forceSplitCount?: number;
	},
): Promise<SplitResult> {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => {
			const width = img.naturalWidth || img.width;
			const height = img.naturalHeight || img.height;

			if (!width || !height) {
				resolve({
					isMultiFrame: false,
					frames: [{ url: imageUrl, width, height }],
					detectedCount: 1,
				});
				return;
			}

			// 1. Manual Force Split
			if (options?.forceSplitCount && options.forceSplitCount > 1) {
				const count = Math.min(8, Math.max(2, options.forceSplitCount));
				const sliceWidth = Math.floor(width / count);
				const frames: FrameSlice[] = [];

				for (let i = 0; i < count; i++) {
					const canvas = document.createElement("canvas");
					canvas.width = sliceWidth;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					if (ctx) {
						ctx.drawImage(
							img,
							i * sliceWidth,
							0,
							sliceWidth,
							height,
							0,
							0,
							sliceWidth,
							height,
						);
						frames.push({
							url: canvas.toDataURL("image/png"),
							width: sliceWidth,
							height,
						});
					}
				}

				resolve({
					isMultiFrame: true,
					frames,
					detectedCount: count,
					reason: "manual",
				});
				return;
			}

			// Offscreen Canvas for pixel inspection
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) {
				resolve({
					isMultiFrame: false,
					frames: [{ url: imageUrl, width, height }],
					detectedCount: 1,
				});
				return;
			}

			ctx.drawImage(img, 0, 0);

			let imageData: ImageData;
			try {
				imageData = ctx.getImageData(0, 0, width, height);
			} catch {
				// CORS or security error fallback
				resolve({
					isMultiFrame: false,
					frames: [{ url: imageUrl, width, height }],
					detectedCount: 1,
				});
				return;
			}

			const data = imageData.data;

			// 2. Gutter / Seam Detection across vertical columns
			// Check if columns are transparent or uniform divider colors
			const isGutterColumn = new Uint8Array(width);
			const sampleStep = Math.max(1, Math.floor(height / 80));

			for (let x = 0; x < width; x++) {
				let isTransparent = true;
				let isUniform = true;

				const firstYIdx = x * 4;
				const cR = data[firstYIdx];
				const cG = data[firstYIdx + 1];
				const cB = data[firstYIdx + 2];
				const cA = data[firstYIdx + 3];

				for (let y = 0; y < height; y += sampleStep) {
					const idx = (y * width + x) * 4;
					const a = data[idx + 3];
					if (a > 15) {
						isTransparent = false;
					}

					const r = data[idx];
					const g = data[idx + 1];
					const b = data[idx + 2];

					if (
						Math.abs(r - cR) > 12 ||
						Math.abs(g - cG) > 12 ||
						Math.abs(b - cB) > 12 ||
						Math.abs(a - cA) > 15
					) {
						isUniform = false;
					}
				}

				if (isTransparent || isUniform) {
					isGutterColumn[x] = 1;
				}
			}

			// Find internal gutters that divide the image
			// A true gutter between frames should be separated by substantial content on both sides
			const minContentWidth = Math.max(60, Math.floor(width * 0.15));
			const contentSegments: Array<{ start: number; end: number }> = [];

			let inContent = false;
			let segStart = 0;

			for (let x = 0; x < width; x++) {
				const isContent = isGutterColumn[x] === 0;
				if (isContent && !inContent) {
					inContent = true;
					segStart = x;
				} else if (!isContent && inContent) {
					inContent = false;
					if (x - segStart >= minContentWidth) {
						contentSegments.push({ start: segStart, end: x });
					}
				}
			}
			if (inContent && width - segStart >= minContentWidth) {
				contentSegments.push({ start: segStart, end: width });
			}

			// If 2 to 6 content segments separated by detected gutters:
			if (contentSegments.length >= 2 && contentSegments.length <= 6) {
				const frames: FrameSlice[] = [];
				for (const seg of contentSegments) {
					const segWidth = seg.end - seg.start;
					const fCanvas = document.createElement("canvas");
					fCanvas.width = segWidth;
					fCanvas.height = height;
					const fCtx = fCanvas.getContext("2d");
					if (fCtx) {
						fCtx.drawImage(
							canvas,
							seg.start,
							0,
							segWidth,
							height,
							0,
							0,
							segWidth,
							height,
						);
						frames.push({
							url: fCanvas.toDataURL("image/png"),
							width: segWidth,
							height,
						});
					}
				}

				resolve({
					isMultiFrame: true,
					frames,
					detectedCount: frames.length,
					reason: "gutter",
				});
				return;
			}

			// 3. Aspect Ratio Heuristic for touching frames (e.g. 2 adjacent mobile screens)
			const platform = options?.platform || "ios";
			const ratio = width / height;

			let candidateCount = 0;
			if (platform === "ios") {
				if (ratio >= 0.75 && ratio <= 1.25) {
					// 2 mobile frames side-by-side (~0.9 - 1.1)
					candidateCount = 2;
				} else if (ratio > 1.25 && ratio <= 1.8) {
					// 3 mobile frames side-by-side (~1.4 - 1.6)
					candidateCount = 3;
				} else if (ratio > 1.8 && ratio <= 2.4) {
					// 4 mobile frames side-by-side (~1.9 - 2.2)
					candidateCount = 4;
				}
			} else {
				// Web/Desktop side-by-side
				if (ratio >= 3.0 && ratio <= 3.8) {
					candidateCount = 2;
				}
			}

			if (candidateCount >= 2) {
				const sliceWidth = Math.floor(width / candidateCount);
				const frames: FrameSlice[] = [];

				for (let i = 0; i < candidateCount; i++) {
					const fCanvas = document.createElement("canvas");
					fCanvas.width = sliceWidth;
					fCanvas.height = height;
					const fCtx = fCanvas.getContext("2d");
					if (fCtx) {
						fCtx.drawImage(
							canvas,
							i * sliceWidth,
							0,
							sliceWidth,
							height,
							0,
							0,
							sliceWidth,
							height,
						);
						frames.push({
							url: fCanvas.toDataURL("image/png"),
							width: sliceWidth,
							height,
						});
					}
				}

				resolve({
					isMultiFrame: true,
					frames,
					detectedCount: candidateCount,
					reason: "aspect-ratio",
				});
				return;
			}

			// Single frame
			resolve({
				isMultiFrame: false,
				frames: [{ url: imageUrl, width, height }],
				detectedCount: 1,
			});
		};

		img.onerror = () => {
			resolve({
				isMultiFrame: false,
				frames: [{ url: imageUrl, width: 0, height: 0 }],
				detectedCount: 1,
			});
		};
	});
}
