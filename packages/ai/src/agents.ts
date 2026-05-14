export type OfficialAgentId =
  | "development_editor"
  | "reader_agent"
  | "character_editor"
  | "theme_analyst"
  | "continuity_editor";

export interface OfficialAgentDefinition {
  agent_id: OfficialAgentId;
  label: string;
  focus: string[];
  mode: "writers_room_perspective";
}

export const officialAgents: OfficialAgentDefinition[] = [
  {
    agent_id: "development_editor",
    label: "Development Editor",
    mode: "writers_room_perspective",
    focus: ["plot structure", "main conflict", "payoff", "pacing", "arc integrity"],
  },
  {
    agent_id: "reader_agent",
    label: "Reader Agent",
    mode: "writers_room_perspective",
    focus: ["emotional reading experience", "suspense", "confusion", "expectation"],
  },
  {
    agent_id: "character_editor",
    label: "Character Editor",
    mode: "writers_room_perspective",
    focus: ["motivation", "consistency", "character arc", "psychological plausibility"],
  },
  {
    agent_id: "theme_analyst",
    label: "Theme Analyst",
    mode: "writers_room_perspective",
    focus: ["theme", "motif", "author intent", "repeated emotional patterns"],
  },
  {
    agent_id: "continuity_editor",
    label: "Continuity Editor",
    mode: "writers_room_perspective",
    focus: ["world consistency", "timeline", "setting conflicts", "foreshadowing"],
  },
];

export function getOfficialAgent(agentId: OfficialAgentId): OfficialAgentDefinition {
  const agent = officialAgents.find((item) => item.agent_id === agentId);
  if (!agent) {
    throw new Error(`Unknown official agent: ${agentId}`);
  }

  return agent;
}
