import { cn } from "@IvO/ui/lib/utils";
import type * as React from "react";

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	...props
}: React.ComponentProps<"div"> & {
	orientation?: "horizontal" | "vertical";
	decorative?: boolean;
}) {
	return (
		<div
			data-slot="separator"
			{...(decorative
				? { role: "none" }
				: { role: "separator", "aria-orientation": orientation })}
			className={cn(
				"shrink-0 bg-border",
				orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
