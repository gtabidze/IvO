import { cn } from "@IvO/ui/lib/utils";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type * as React from "react";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
	return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
	return (
		<ol
			data-slot="breadcrumb-list"
			className={cn(
				"flex flex-wrap items-center gap-1.5 break-words text-neutral-500 text-xs sm:gap-2 sm:text-[13px] dark:text-neutral-400",
				className,
			)}
			{...props}
		/>
	);
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="breadcrumb-item"
			className={cn("inline-flex items-center gap-1.5", className)}
			{...props}
		/>
	);
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<"a">) {
	return (
		<a
			data-slot="breadcrumb-link"
			className={cn(
				"transition-colors hover:text-neutral-900 dark:hover:text-white",
				className,
			)}
			{...props}
		/>
	);
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="breadcrumb-page"
			aria-disabled="true"
			aria-current="page"
			className={cn("font-medium text-neutral-900 dark:text-white", className)}
			{...props}
		/>
	);
}

function BreadcrumbSeparator({
	children,
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="breadcrumb-separator"
			role="presentation"
			aria-hidden="true"
			className={cn(
				"text-neutral-400 dark:text-neutral-600 [&>svg]:size-3.5",
				className,
			)}
			{...props}
		>
			{children ?? <ChevronRight className="cn-rtl-flip h-3.5 w-3.5" />}
		</li>
	);
}

function BreadcrumbEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="breadcrumb-ellipsis"
			role="presentation"
			aria-hidden="true"
			className={cn(
				"flex size-5 items-center justify-center text-neutral-400 dark:text-neutral-500",
				className,
			)}
			{...props}
		>
			<MoreHorizontal className="h-3.5 w-3.5" />
			<span className="sr-only">More</span>
		</span>
	);
}

export {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
};
