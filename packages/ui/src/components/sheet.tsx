"use client";

import { cn } from "@IvO/ui/lib/utils";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetBackdrop({
	className,
	...props
}: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="sheet-backdrop"
			className={cn(
				"fixed inset-0 z-50 bg-black/60 backdrop-blur-xs duration-300 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

const SheetOverlay = SheetBackdrop;

interface SheetContentProps extends DialogPrimitive.Popup.Props {
	side?: "top" | "bottom" | "left" | "right";
	showClose?: boolean;
}

function SheetContent({
	side = "right",
	className,
	children,
	showClose = true,
	...props
}: SheetContentProps) {
	const sideClasses = {
		top: "inset-x-0 top-0 border-b data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
		bottom:
			"inset-x-0 bottom-0 border-t data-starting-style:translate-y-full data-ending-style:translate-y-full",
		left: "inset-y-0 left-0 h-full w-full sm:max-w-md border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
		right:
			"inset-y-0 right-0 h-full w-full sm:max-w-md border-l data-starting-style:translate-x-full data-ending-style:translate-x-full",
	};

	return (
		<SheetPortal>
			<SheetBackdrop />
			<DialogPrimitive.Popup
				data-slot="sheet-content"
				className={cn(
					"fixed z-50 flex flex-col gap-4 border-neutral-200/80 bg-white p-6 shadow-2xl transition duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-900",
					sideClasses[side],
					className,
				)}
				{...props}
			>
				{children}
				{showClose && (
					<DialogPrimitive.Close
						data-slot="sheet-close"
						className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 active:scale-95 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
						aria-label="Close"
					>
						<XIcon className="h-4 w-4" />
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Popup>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("flex flex-col gap-1.5 text-left", className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn(
				"mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="sheet-title"
			className={cn(
				"font-semibold text-lg text-neutral-900 tracking-tight dark:text-neutral-100",
				className,
			)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="sheet-description"
			className={cn(
				"text-neutral-500 text-xs sm:text-sm dark:text-neutral-400",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetBackdrop,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetOverlay,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
};
