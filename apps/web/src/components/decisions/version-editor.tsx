import { Badge } from "@IvO/ui/components/badge";
import { Button } from "@IvO/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@IvO/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@IvO/ui/components/collapsible";
import { Field, FieldGroup, FieldLabel } from "@IvO/ui/components/field";
import { Input } from "@IvO/ui/components/input";
import { Textarea } from "@IvO/ui/components/textarea";
import { ArrowDown, ArrowUp, Eye, Plus, Trash2 } from "lucide-react";
import type { Version } from "./model";
import { copy, uid } from "./model";
import { putAsset } from "./storage";
import { useResolvedVersion } from "./use-decision";

export function VersionEditor({
	version,
	onChange,
	onOpen,
	opened,
	editable,
	onError,
	busy,
	onUploadBusy,
}: {
	version: Version;
	onChange: (v: Version) => void;
	onOpen: () => void;
	opened: boolean;
	editable: boolean;
	onError: (message: string) => void;
	busy: boolean;
	onUploadBusy: (busy: boolean) => void;
}) {
	const { resolved } = useResolvedVersion(version);
	const update = (edit: (v: Version) => void) => {
		const next = copy(version);
		edit(next);
		onChange(next);
	};
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<Badge variant="outline">
						{version.id === "version-a" ? "A" : "B"}
					</Badge>
					{version.frozenAt && (
						<Badge variant="secondary">Frozen snapshot</Badge>
					)}
				</div>
				<CardTitle>{version.name}</CardTitle>
				<CardDescription>{version.description}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-center gap-2">
					{(resolved?.screens || version.screens).slice(0, 3).map((screen) => (
						<div
							key={screen.id}
							className="flex h-16 w-11 items-center justify-center overflow-hidden rounded border bg-muted"
						>
							{screen.imageUrl ? (
								<img
									src={screen.imageUrl}
									alt={screen.title}
									className="size-full object-cover object-top"
								/>
							) : (
								<span className="px-1 text-center text-[9px] text-muted-foreground">
									{screen.title}
								</span>
							)}
						</div>
					))}
					<span className="text-muted-foreground text-xs">
						{version.screens.length} screens
					</span>
				</div>
				<Collapsible>
					<CollapsibleTrigger
						render={
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-start"
							/>
						}
					>
						{editable ? "Edit version and screens" : "Inspect screen list"}
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-3 flex flex-col gap-4">
						{editable && (
							<FieldGroup>
								<Field data-invalid={!version.name.trim()}>
									<FieldLabel htmlFor={`${version.id}-name`}>
										Version name
									</FieldLabel>
									<Input
										id={`${version.id}-name`}
										aria-invalid={!version.name.trim()}
										defaultValue={version.name}
										key={version.name}
										onBlur={(e) => {
											if (e.target.value !== version.name)
												update((v) => {
													v.name = e.target.value;
												});
										}}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${version.id}-description`}>
										Description
									</FieldLabel>
									<Textarea
										id={`${version.id}-description`}
										defaultValue={version.description}
										key={version.description}
										onBlur={(e) => {
											if (e.target.value !== version.description)
												update((v) => {
													v.description = e.target.value;
												});
										}}
									/>
								</Field>
							</FieldGroup>
						)}
						<ol className="flex flex-col gap-3">
							{version.screens.map((screen, index) => (
								<li
									key={screen.id}
									className="flex flex-col gap-2 rounded-md border p-3"
								>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">{index + 1}</Badge>
										{editable ? (
											<Input
												aria-label={`Screen ${index + 1} title in ${version.name}`}
												defaultValue={screen.title}
												key={screen.title}
												onBlur={(e) => {
													if (e.target.value !== screen.title)
														update((v) => {
															v.screens[index].title = e.target.value;
														});
												}}
											/>
										) : (
											<span className="text-sm">{screen.title}</span>
										)}
									</div>
									{editable && (
										<div className="flex flex-wrap items-center gap-1">
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Move screen ${index + 1} up`}
												disabled={index === 0}
												onClick={() =>
													update((v) => {
														[v.screens[index - 1], v.screens[index]] = [
															v.screens[index],
															v.screens[index - 1],
														];
													})
												}
											>
												<ArrowUp />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Move screen ${index + 1} down`}
												disabled={index === version.screens.length - 1}
												onClick={() =>
													update((v) => {
														[v.screens[index + 1], v.screens[index]] = [
															v.screens[index],
															v.screens[index + 1],
														];
													})
												}
											>
												<ArrowDown />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label={`Remove screen ${index + 1}`}
												disabled={version.screens.length <= 1}
												onClick={() =>
													update((v) => {
														v.screens.splice(index, 1);
													})
												}
											>
												<Trash2 />
											</Button>
											<Field className="min-w-0 flex-1">
												<FieldLabel
													className="sr-only"
													htmlFor={`${version.id}-${screen.id}-image`}
												>
													Replace screen image
												</FieldLabel>
												<Input
													id={`${version.id}-${screen.id}-image`}
													type="file"
													accept="image/png,image/jpeg,image/webp"
													disabled={busy}
													onChange={async (e) => {
														const file = e.target.files?.[0];
														e.target.value = "";
														if (!file) return;
														onUploadBusy(true);
														try {
															if (file.size > 10 * 1024 * 1024)
																throw new Error(
																	"Choose an image smaller than 10 MB.",
																);
															if (
																![
																	"image/png",
																	"image/jpeg",
																	"image/webp",
																].includes(file.type)
															)
																throw new Error("Choose PNG, JPEG, or WebP.");
															const assetId = await putAsset(file);
															update((v) => {
																v.screens[index].assetId = assetId;
																delete v.screens[index].imageUrl;
															});
														} catch (error) {
															onError(
																error instanceof Error
																	? error.message
																	: "Image upload failed.",
															);
														} finally {
															onUploadBusy(false);
														}
													}}
												/>
											</Field>
										</div>
									)}
								</li>
							))}
						</ol>
						{editable && (
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									update((v) => {
										v.screens.push({
											id: uid(),
											title: "New screen",
											screenType: "generic-wireframe",
											wireframeDetails: {
												headlineText: "New screen",
												buttonText: "Continue",
											},
										});
									})
								}
							>
								<Plus data-icon="inline-start" />
								Add screen
							</Button>
						)}
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
			<CardFooter>
				<Button
					className="w-full"
					variant="outline"
					onClick={onOpen}
					disabled={busy}
				>
					<Eye data-icon="inline-start" />
					{opened ? "Opened · View again" : "Open version"}
				</Button>
			</CardFooter>
		</Card>
	);
}
