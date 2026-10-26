import { Button } from "@IvO/ui/components/button";
import { cn } from "@IvO/ui/lib/utils";
import type * as React from "react";

function Suggestions({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="suggestions"
			className={cn(
				"scrollbar-none flex w-full items-center gap-2 overflow-x-auto py-1",
				className,
			)}
			{...props}
		/>
	);
}

function Suggestion({
	className,
	suggestion,
	children,
	onClick,
	...props
}: React.ComponentProps<typeof Button> & {
	suggestion?: string;
}) {
	return (
		<Button
			data-slot="suggestion"
			type="button"
			variant="outline"
			size="sm"
			className={cn(
				"h-7 shrink-0 cursor-pointer rounded-full px-3 font-medium text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
				className,
			)}
			onClick={(e) => {
				onClick?.(e);
			}}
			{...props}
		>
			{children ?? suggestion}
		</Button>
	);
}

export { Suggestion, Suggestions };
