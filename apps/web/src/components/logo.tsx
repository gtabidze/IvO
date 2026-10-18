/**
 * Alignment brand logo mark (Mobbin geometric mark).
 */
export function LogoMark({ className = "h-5 w-auto" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 139 64"
			fill="currentColor"
			role="img"
			aria-label="Alignment logo"
			xmlns="http://www.w3.org/2000/svg"
			className={`shrink-0 ${className}`}
		>
			<path d="M84.3504 64H48.1695V47.315L32.569 63.9989L0 63.9841V29.9515L28.31 0H67.4439V15.9214L82.6881 0H116.593V26.1874H139V64H99.1163V48.208L84.3504 64Z" />
		</svg>
	);
}
