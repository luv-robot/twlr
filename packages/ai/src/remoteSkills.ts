import { stateProposalJsonSchema, type StateProposal } from "@twlr/schema";
import type { ProductionSkillContext, ProductionSkillId } from "./skills";

interface RemoteStateProposalSkillDefinition {
  skillId: ProductionSkillId;
  skillLabel: string;
  proposalIdSuffix: string;
  systemFocus: string;
  task: string;
  outputRules: string[];
}

export interface CreateRemoteStateProposalSkillRequestOptions {
  createdAt?: string;
  proposalId?: string;
}

export interface RemoteStateProposalSkillRequest {
  skillId: ProductionSkillId;
  skillLabel: string;
  proposalId: string;
  createdAt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  systemPrompt: string;
  prompt: string;
}

const remoteStateProposalSkillDefinitions: Partial<Record<ProductionSkillId, RemoteStateProposalSkillDefinition>> = {
  character_sheet: {
    skillId: "character_sheet",
    skillLabel: "Character Sheet",
    proposalIdSuffix: "remote_character",
    systemFocus: "Focus on observed character state, motivation signals, secrets, arc stage, and reader-facing function.",
    task: "Create a concise Character Sheet state proposal from the context packet.",
    outputRules: [
      "Summary must be one short state update, 18 to 28 English words when possible.",
      "Summary must not start with Create, Analyze, Review, or Suggest.",
      "Summary should describe the story-state change, not the skill action.",
      "Evidence should contain 1 or 2 short quotes or paraphrased observations from the selected text.",
      "Prefer character_state_changed for observed character status, motivation, fear, desire, secret, or arc-stage changes.",
      "Always include at least one proposed event with target_type character.",
      "If the text implies a secret, cover-up, unexplained motive, altered record, hidden identity, missing cause, or suspicious silence, include one open_loop_created proposal.",
      "If you propose an open loop, include its id in affected.open_loops.",
      "Do not produce broad literary critique or scene advice.",
    ],
  },
  outline_builder: {
    skillId: "outline_builder",
    skillLabel: "Outline Builder",
    proposalIdSuffix: "remote_outline",
    systemFocus: "Focus on chapter outline beats, scene purpose, turning point, and transition into the next beat.",
    task: "Create a concise Outline Builder chapter-state proposal from the context packet.",
    outputRules: [
      "Summary must be one short chapter outline update, 18 to 28 English words when possible.",
      "Evidence should contain 1 or 2 short observations from the selected text.",
      "Always include at least one proposed event with event_type chapter_metadata_changed and target_type chapter.",
      "Use field outline_beats for the primary chapter outline update.",
      "Do not create rewrite prose or broad craft advice.",
      "Do not mutate character, timeline, or open-loop state unless the selected text directly requires it.",
    ],
  },
  timeline_compiler: {
    skillId: "timeline_compiler",
    skillLabel: "Timeline Compiler",
    proposalIdSuffix: "remote_timeline",
    systemFocus: "Focus on concrete story events, sequence, story time, certainty, and chapter-local chronology.",
    task: "Create a concise Timeline Compiler state proposal from the context packet.",
    outputRules: [
      "Summary must be one short event update, 18 to 28 English words when possible.",
      "Evidence should contain 1 or 2 short observations from the selected text.",
      "Always include at least one proposed event with target_type timeline_event.",
      "Prefer timeline_event_created with field label, followed by timeline_event_changed with field summary when useful.",
      "If characters are involved, include their ids in affected.characters.",
      "Do not create broad outline advice or rewrite suggestions.",
    ],
  },
  foreshadow_tracker: {
    skillId: "foreshadow_tracker",
    skillLabel: "Foreshadow Tracker",
    proposalIdSuffix: "remote_foreshadow",
    systemFocus: "Focus on setups, unresolved questions, suspicious details, delayed payoffs, and reader-facing open loops.",
    task: "Create a concise Foreshadow Tracker state proposal from the context packet.",
    outputRules: [
      "Summary must be one short setup or payoff update, 18 to 28 English words when possible.",
      "Evidence should contain 1 or 2 short observations from the selected text.",
      "Always include at least one proposed event with target_type open_loop.",
      "Prefer open_loop_created for a new setup and open_loop_changed for an existing unresolved thread.",
      "If a likely payoff direction exists, use field expected_payoff.",
      "Do not create broad literary critique or scene advice.",
    ],
  },
};

export function createRemoteStateProposalSkillRequest(
  skillId: ProductionSkillId,
  context: ProductionSkillContext,
  options: CreateRemoteStateProposalSkillRequestOptions = {},
): RemoteStateProposalSkillRequest | null {
  const definition = remoteStateProposalSkillDefinitions[skillId];

  if (!definition) {
    return null;
  }

  const createdAt = options.createdAt ?? new Date().toISOString();
  const proposalId = options.proposalId ?? `proposal_${Date.now()}_${definition.proposalIdSuffix}`;

  return {
    skillId,
    skillLabel: definition.skillLabel,
    proposalId,
    createdAt,
    schemaName: "twlr_state_proposal",
    jsonSchema: stateProposalJsonSchema,
    systemPrompt: createStateProposalSystemPrompt(definition),
    prompt: createStateProposalPrompt({ definition, context, proposalId, createdAt }),
  };
}

export function normalizeRemoteStateProposalSkillResult(
  proposal: StateProposal,
  request: RemoteStateProposalSkillRequest,
  context: ProductionSkillContext,
): StateProposal {
  const rawProposedEvents = normalizeProposedEvents(proposal.proposed_events ?? []);
  const affectedCharacters = proposal.affected?.characters?.length
    ? proposal.affected.characters
    : inferTargetIds(rawProposedEvents, "character");
  const affectedOpenLoops = proposal.affected?.open_loops?.length
    ? proposal.affected.open_loops
    : inferTargetIds(rawProposedEvents, "open_loop");
  const affectedTimelineEvents = proposal.affected?.timeline_events?.length
    ? proposal.affected.timeline_events
    : inferTargetIds(rawProposedEvents, "timeline_event");
  const summary = normalizeProposalSummary(
    typeof proposal.summary === "string" ? proposal.summary : "Review character state update.",
  );
  const proposedEvents = ensureSkillEvents({
    affectedCharacters,
    affectedOpenLoops,
    affectedTimelineEvents,
    chapterId: context.chapter_id,
    events: rawProposedEvents,
    skillId: request.skillId,
    summary,
  });

  return {
    ...proposal,
    proposal_id: proposal.proposal_id || request.proposalId,
    created_at: proposal.created_at || request.createdAt,
    status: "pending",
    source: {
      kind: "skill",
      name: request.skillLabel,
      llm_provider: "remote",
    },
    scope: {
      chapters: proposal.scope?.chapters?.length ? proposal.scope.chapters : [context.chapter_id],
      selected_text_range: proposal.scope?.selected_text_range ?? null,
    },
    affected: {
      chapters: proposal.affected?.chapters?.length ? proposal.affected.chapters : [context.chapter_id],
      characters: affectedCharacters.length ? affectedCharacters : inferTargetIds(proposedEvents, "character"),
      open_loops: affectedOpenLoops.length ? affectedOpenLoops : inferTargetIds(proposedEvents, "open_loop"),
      timeline_events: affectedTimelineEvents.length
        ? affectedTimelineEvents
        : inferTargetIds(proposedEvents, "timeline_event"),
    },
    summary,
    evidence: normalizeEvidence(proposal.evidence ?? []),
    proposed_events: proposedEvents,
    review: {
      reviewed_at: null,
      reviewed_by: null,
      decision: null,
      edited_summary: null,
    },
  };
}

function createStateProposalSystemPrompt(definition: RemoteStateProposalSkillDefinition): string {
  return [
    `You are TWLR's ${definition.skillLabel} production skill.`,
    "Return exactly one StateProposal JSON object.",
    "Do not mutate project state directly.",
    "Only propose durable story-state changes that the author can review.",
    "Represent proposed event old_value and new_value as concise strings or null.",
    "Use low-emotion, professional language.",
    definition.systemFocus,
    ...definition.outputRules,
  ].join(" ");
}

function createStateProposalPrompt(input: {
  definition: RemoteStateProposalSkillDefinition;
  context: ProductionSkillContext;
  proposalId: string;
  createdAt: string;
}): string {
  return JSON.stringify(
    {
      task: input.definition.task,
      required_values: {
        proposal_id: input.proposalId,
        created_at: input.createdAt,
        status: "pending",
        source: {
          kind: "skill",
          name: input.definition.skillLabel,
          llm_provider: "remote",
        },
        review: {
          reviewed_at: null,
          reviewed_by: null,
          decision: null,
          edited_summary: null,
        },
      },
      context_packet: input.context.context_packet,
      selected_text: input.context.selected_text ?? null,
      output_contract: {
        summary: "One short state update, not an explanation paragraph.",
        evidence: "1 or 2 short entries.",
        state_event_policy: stateEventPolicyForSkill(input.definition.skillId),
        open_loop_policy:
          "Create an open loop when the selected text suggests a secret, cover-up, unexplained motive, suspicious silence, or altered record.",
        proposal_card_reader: "The author should be able to decide accept/reject from the card without reading a long essay.",
      },
    },
    null,
    2,
  );
}

function stateEventPolicyForSkill(skillId: ProductionSkillId): string {
  if (skillId === "character_sheet") {
    return "Character Sheet must include at least one proposed event with event_type character_state_changed and target_type character.";
  }

  if (skillId === "outline_builder") {
    return "Outline Builder must include at least one proposed event with event_type chapter_metadata_changed and target_type chapter.";
  }

  if (skillId === "timeline_compiler") {
    return "Timeline Compiler must include at least one proposed event with event_type timeline_event_created or timeline_event_changed and target_type timeline_event.";
  }

  if (skillId === "foreshadow_tracker") {
    return "Foreshadow Tracker must include at least one proposed event with event_type open_loop_created, open_loop_changed, or open_loop_paid_off and target_type open_loop.";
  }

  return "Include only durable story-state events relevant to the selected production skill.";
}

function normalizeProposalSummary(summary: string): string {
  const trimmed = summary.trim();
  const sentences = trimmed.match(/[^.!?]+[.!?]?/g) ?? [trimmed];
  const firstSentence = sentences[0]?.trim() ?? trimmed;
  const words = firstSentence.split(/\s+/).filter(Boolean);

  if (words.length <= 32) {
    return firstSentence;
  }

  return `${words.slice(0, 28).join(" ")}...`;
}

function normalizeEvidence(evidence: string[]): string[] {
  return evidence
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function normalizeProposedEvents(events: StateProposal["proposed_events"]): StateProposal["proposed_events"] {
  return events.map((event) => ({
    ...event,
    payload: {
      ...event.payload,
      field: event.payload.field ?? "summary",
      old_value: event.payload.old_value ?? null,
      new_value: event.payload.new_value ?? null,
    },
  }));
}

function inferTargetIds(
  events: StateProposal["proposed_events"],
  targetType: StateProposal["proposed_events"][number]["payload"]["target_type"],
): string[] {
  const ids = events
    .filter((event) => event.payload.target_type === targetType)
    .map((event) => event.payload.target_id)
    .filter(Boolean);

  return [...new Set(ids)];
}

function ensureSkillEvents(input: {
  affectedCharacters: string[];
  affectedOpenLoops: string[];
  affectedTimelineEvents: string[];
  chapterId: string;
  events: StateProposal["proposed_events"];
  skillId: ProductionSkillId;
  summary: string;
}): StateProposal["proposed_events"] {
  if (input.skillId === "character_sheet") {
    return ensureCharacterStateEvent(input.events, input.affectedCharacters, input.summary);
  }

  if (input.skillId === "timeline_compiler") {
    return ensureTimelineEvent(input.events, input.affectedTimelineEvents, input.summary);
  }

  if (input.skillId === "outline_builder") {
    return ensureChapterOutlineEvent(input.events, input.chapterId, input.summary);
  }

  if (input.skillId === "foreshadow_tracker") {
    return ensureOpenLoopEvent(input.events, input.affectedOpenLoops, input.summary);
  }

  return input.events;
}

function ensureCharacterStateEvent(
  events: StateProposal["proposed_events"],
  affectedCharacters: string[],
  summary: string,
): StateProposal["proposed_events"] {
  if (hasCharacterCurrentStatusEvent(events)) {
    return events;
  }

  const characterId = affectedCharacters[0] ?? inferTargetIds(events, "character")[0];
  if (!characterId) {
    return events;
  }

  return [
    {
      event_type: "character_state_changed",
      payload: {
        target_type: "character",
        target_id: characterId,
        field: "current_status",
        old_value: null,
        new_value: summary,
      },
    },
    ...events,
  ];
}

function hasCharacterCurrentStatusEvent(events: StateProposal["proposed_events"]): boolean {
  return events.some(
    (event) => event.payload.target_type === "character" && event.payload.field === "current_status",
  );
}

function ensureTimelineEvent(
  events: StateProposal["proposed_events"],
  affectedTimelineEvents: string[],
  summary: string,
): StateProposal["proposed_events"] {
  if (events.some((event) => event.payload.target_type === "timeline_event")) {
    return events;
  }

  const timelineEventId = affectedTimelineEvents[0] ?? makeStateId("timeline", summary);

  return [
    {
      event_type: "timeline_event_created",
      payload: {
        target_type: "timeline_event",
        target_id: timelineEventId,
        field: "label",
        old_value: null,
        new_value: summary,
      },
    },
    ...events,
  ];
}

function ensureChapterOutlineEvent(
  events: StateProposal["proposed_events"],
  chapterId: string,
  summary: string,
): StateProposal["proposed_events"] {
  if (
    events.some(
      (event) => event.payload.target_type === "chapter" && event.payload.field === "outline_beats",
    )
  ) {
    return events;
  }

  const targetChapterId =
    events.find((event) => event.payload.target_type === "chapter")?.payload.target_id ?? chapterId;

  return [
    {
      event_type: "chapter_metadata_changed",
      payload: {
        target_type: "chapter",
        target_id: targetChapterId,
        field: "outline_beats",
        old_value: null,
        new_value: summary,
      },
    },
    ...events,
  ];
}

function ensureOpenLoopEvent(
  events: StateProposal["proposed_events"],
  affectedOpenLoops: string[],
  summary: string,
): StateProposal["proposed_events"] {
  if (events.some((event) => event.payload.target_type === "open_loop")) {
    return events;
  }

  const openLoopId = affectedOpenLoops[0] ?? makeStateId("loop", summary);

  return [
    {
      event_type: "open_loop_created",
      payload: {
        target_type: "open_loop",
        target_id: openLoopId,
        field: "title",
        old_value: null,
        new_value: summary,
      },
    },
    ...events,
  ];
}

function makeStateId(prefix: string, value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .split("_")
    .filter(Boolean)
    .slice(0, 6)
    .join("_");

  return `${prefix}_${slug || "item"}`;
}
