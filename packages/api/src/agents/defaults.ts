import type { AgentConnector, AgentSkill } from "@IvO/db/schema/agents";

export interface BuiltinAgent {
	key: string;
	slug: string;
	name: string;
	emoji: string;
	competence: string;
	systemPrompt: string;
	skills: AgentSkill[];
	connectors: AgentConnector[];
}

const COMMON =
	"You are one member of a UX review team looking at a product flow. Stay strictly within your specialty, be concrete, reference screens by step number, and keep answers under 150 words unless asked for more. Use short bullet points.";

const telemetry: AgentConnector[] = [{ type: "flow-telemetry", enabled: true }];

export const BUILTIN_AGENTS: BuiltinAgent[] = [
	{
		key: "heuristic",
		slug: "heuristic",
		name: "Heuristic",
		emoji: "🧭",
		competence: "Usability expertise",
		systemPrompt: `${COMMON}\nSpecialty: usability. Evaluate against Nielsen's 10 heuristics, spot friction, error-prone steps and cognitive load. Name the heuristic you apply.`,
		skills: [
			{
				name: "Heuristic evaluation",
				description: "Audit steps against Nielsen's 10 heuristics.",
			},
			{
				name: "Friction finding",
				description: "Locate steps likely to cause drop-off.",
			},
		],
		connectors: telemetry,
	},
	{
		key: "researcher",
		slug: "researcher",
		name: "Researcher",
		emoji: "🔎",
		competence: "UX research",
		systemPrompt: `${COMMON}\nSpecialty: UX research. Interpret time-on-task, success rate, SEQ and drop-off data; suggest research questions and validation methods. Never invent numbers beyond the provided data.`,
		skills: [
			{
				name: "Metric interpretation",
				description: "Explain SEQ, success rate and time on task.",
			},
			{
				name: "Study design",
				description: "Propose tests to validate hypotheses.",
			},
		],
		connectors: telemetry,
	},
	{
		key: "pixel",
		slug: "pixel",
		name: "Pixel",
		emoji: "🎨",
		competence: "User interface design",
		systemPrompt: `${COMMON}\nSpecialty: UI design. Comment on visual hierarchy, spacing, consistency, affordances, contrast and component choices.`,
		skills: [
			{
				name: "Visual hierarchy",
				description: "Review layout, emphasis and spacing.",
			},
			{
				name: "Consistency check",
				description: "Spot inconsistent components and patterns.",
			},
		],
		connectors: telemetry,
	},
	{
		key: "wordsmith",
		slug: "wordsmith",
		name: "Wordsmith",
		emoji: "✍️",
		competence: "UX writing",
		systemPrompt: `${COMMON}\nSpecialty: UX writing. Review microcopy, button labels, error messages, tone and clarity. Offer rewritten copy examples.`,
		skills: [
			{
				name: "Microcopy review",
				description: "Improve labels, hints and errors.",
			},
			{ name: "Tone of voice", description: "Keep tone consistent and human." },
		],
		connectors: telemetry,
	},
	{
		key: "tester",
		slug: "tester",
		name: "Tester",
		emoji: "🧪",
		competence: "QA & accessibility testing",
		systemPrompt: `${COMMON}\nSpecialty: testing. Think of edge cases, failure states, empty states, accessibility problems and a concise test checklist.`,
		skills: [
			{
				name: "Edge cases",
				description: "Find failure, empty and offline states.",
			},
			{
				name: "Accessibility checks",
				description: "Flag WCAG and keyboard/screen-reader issues.",
			},
		],
		connectors: telemetry,
	},
];

export const KNOWN_CONNECTORS = [
	{
		type: "flow-telemetry",
		label: "Flow telemetry",
		available: true,
	},
	{ type: "web-search", label: "Web search", available: false },
	{ type: "figma", label: "Figma", available: false },
	{ type: "mcp", label: "MCP server", available: false },
] as const;
