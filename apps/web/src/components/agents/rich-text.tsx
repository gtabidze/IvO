import type { ReactNode } from "react";

interface MentionAgent {
	slug: string;
}

function inline(text: string, agents: MentionAgent[], keyPrefix: string) {
	const out: ReactNode[] = [];
	// **bold** and @mentions
	const parts = text.split(/(\*\*[^*]+\*\*|@[a-z0-9_-]+)/gi);
	parts.forEach((part, i) => {
		const key = `${keyPrefix}-${i}`;
		if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
			out.push(<strong key={key}>{part.slice(2, -2)}</strong>);
		} else if (
			part.startsWith("@") &&
			agents.some((a) => a.slug === part.slice(1).toLowerCase())
		) {
			out.push(
				<span
					key={key}
					className="rounded bg-blue-100 px-1 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
				>
					{part}
				</span>,
			);
		} else if (part) {
			out.push(part);
		}
	});
	return out;
}

/** Minimal renderer: paragraphs, "-"/"*" bullets, **bold**, @mentions. */
export function RichText({
	text,
	agents = [],
}: {
	text: string;
	agents?: MentionAgent[];
}) {
	const lines = text.split("\n");
	return (
		<div className="space-y-1">
			{lines.map((line, i) => {
				const key = `l${i}`;
				const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
				if (bullet) {
					return (
						<div key={key} className="flex gap-1.5">
							<span aria-hidden>•</span>
							<span>{inline(bullet[1] ?? "", agents, key)}</span>
						</div>
					);
				}
				if (!line.trim()) return null;
				return <p key={key}>{inline(line, agents, key)}</p>;
			})}
		</div>
	);
}
