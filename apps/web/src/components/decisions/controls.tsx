import { Button } from "@IvO/ui/components/button";
import { Checkbox } from "@IvO/ui/components/checkbox";
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@IvO/ui/components/field";
import { Input } from "@IvO/ui/components/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@IvO/ui/components/select";
import { type ReactNode, useEffect, useId, useState } from "react";
import { TEAM } from "./model";

export function Picker({
	value,
	onChange,
	options,
	label,
	disabled = false,
}: {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	label: string;
	disabled?: boolean;
}) {
	return (
		<Select
			value={value}
			onValueChange={(v) => {
				if (v !== null) onChange(v);
			}}
			disabled={disabled}
		>
			<SelectTrigger aria-label={label} className="w-full">
				<SelectValue>
					{options.find((o) => o.value === value)?.label || "Choose…"}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{options.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
export function Property({
	label,
	value,
	onSave,
	type = "text",
	disabled = false,
	hint,
}: {
	label: string;
	value: string;
	onSave?: (v: string) => void;
	type?: string;
	disabled?: boolean;
	hint?: ReactNode;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const id = useId();
	useEffect(() => setDraft(value), [value]);
	return (
		<Field
			orientation="horizontal"
			className="grid grid-cols-[144px_minmax(0,1fr)] items-start gap-2"
		>
			<FieldLabel htmlFor={id} className="w-36 shrink-0">
				{label}
			</FieldLabel>
			<div className="min-w-0 flex-1">
				{editing ? (
					<Input
						id={id}
						aria-label={label}
						type={type}
						value={draft}
						autoFocus
						min={type === "number" ? 1 : undefined}
						onChange={(e) => setDraft(e.target.value)}
						onBlur={() => {
							onSave?.(draft);
							setEditing(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") e.currentTarget.blur();
							if (e.key === "Escape") {
								setDraft(value);
								setEditing(false);
							}
						}}
					/>
				) : (
					<Button
						id={id}
						variant="ghost"
						className="h-auto min-h-8 w-full justify-start whitespace-normal text-left"
						disabled={disabled || !onSave}
						onClick={() => setEditing(true)}
					>
						{value || "Not set"}
					</Button>
				)}
				{hint}
			</div>
		</Field>
	);
}
export function PeopleProperty({
	label,
	ids,
	onChange,
	disabled,
}: {
	label: string;
	ids: string[];
	onChange: (ids: string[]) => void;
	disabled: boolean;
}) {
	// Keep each role selection in the shared Field composition.
	return (
		<FieldSet>
			<FieldLegend variant="label">{label}</FieldLegend>
			<FieldGroup className="gap-2">
				{TEAM.map((p) => (
					<Field orientation="horizontal" key={p.id}>
						<Checkbox
							id={`${label}-${p.id}`}
							checked={ids.includes(p.id)}
							disabled={disabled}
							onCheckedChange={(checked) =>
								onChange(
									checked ? [...ids, p.id] : ids.filter((id) => id !== p.id),
								)
							}
						/>
						<FieldLabel htmlFor={`${label}-${p.id}`}>
							{p.name} · {p.role}
						</FieldLabel>
					</Field>
				))}
			</FieldGroup>
		</FieldSet>
	);
}
