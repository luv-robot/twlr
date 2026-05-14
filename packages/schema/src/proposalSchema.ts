export const stateProposalJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "proposal_id",
    "created_at",
    "status",
    "source",
    "scope",
    "affected",
    "summary",
    "evidence",
    "proposed_events",
    "review",
  ],
  properties: {
    proposal_id: { type: "string" },
    created_at: { type: "string" },
    status: { type: "string", enum: ["pending", "accepted", "edited", "rejected"] },
    source: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "name", "llm_provider"],
      properties: {
        kind: { type: "string", enum: ["skill", "writers_room", "studio_coordinator", "mock"] },
        name: { type: "string" },
        llm_provider: { type: "string", enum: ["remote", "mock"] },
      },
    },
    scope: {
      type: "object",
      additionalProperties: false,
      required: ["chapters", "selected_text_range"],
      properties: {
        chapters: { type: "array", items: { type: "string" } },
        selected_text_range: {
          anyOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: ["chapter_id", "start", "end"],
              properties: {
                chapter_id: { type: "string" },
                start: { type: "number" },
                end: { type: "number" },
              },
            },
          ],
        },
      },
    },
    affected: {
      type: "object",
      additionalProperties: false,
      required: ["chapters", "characters", "open_loops", "timeline_events"],
      properties: {
        chapters: { type: "array", items: { type: "string" } },
        characters: { type: "array", items: { type: "string" } },
        open_loops: { type: "array", items: { type: "string" } },
        timeline_events: { type: "array", items: { type: "string" } },
      },
    },
    summary: { type: "string" },
    evidence: { type: "array", items: { type: "string" } },
    proposed_events: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["event_type", "payload"],
        properties: {
          event_type: {
            type: "string",
            enum: [
              "character_created",
              "character_state_changed",
              "relationship_state_changed",
              "timeline_event_created",
              "timeline_event_changed",
              "open_loop_created",
              "open_loop_changed",
              "open_loop_paid_off",
              "theme_changed",
              "world_rule_changed",
              "chapter_metadata_changed",
            ],
          },
          payload: {
            type: "object",
            additionalProperties: false,
            required: ["target_type", "target_id", "field", "old_value", "new_value"],
            properties: {
              target_type: {
                type: "string",
                enum: [
                  "work",
                  "chapter",
                  "character",
                  "relationship",
                  "timeline_event",
                  "open_loop",
                  "theme",
                  "world_rule",
                ],
              },
              target_id: { type: "string" },
              field: { type: ["string", "null"] },
              old_value: { type: ["string", "null"] },
              new_value: { type: ["string", "null"] },
            },
          },
        },
      },
    },
    review: {
      type: "object",
      additionalProperties: false,
      required: ["reviewed_at", "reviewed_by", "decision", "edited_summary"],
      properties: {
        reviewed_at: { type: ["string", "null"] },
        reviewed_by: { type: ["string", "null"] },
        decision: { type: ["string", "null"], enum: ["pending", "accepted", "edited", "rejected", null] },
        edited_summary: { type: ["string", "null"] },
      },
    },
  },
} as const;
