# TWLR Internationalization Strategy

TWLR should be designed as a multilingual product from the beginning.

The MVP should not assume that all authors write in English, and it should not require a separate Chinese fork of the product.

## Product Principle

The author's project language and the app interface language are different settings.

Examples:

- a Chinese UI for an English-language novel
- an English UI for a Chinese web novel
- a bilingual creator working with mixed notes
- a translation or adaptation project

## P0 Scope

P0 should support the architecture for multiple languages, not full localization polish.

Required:

- avoid hard-coding user-facing strings deep inside business logic
- add a stable locale key model for UI copy
- keep project language in `twlr.project.json`
- keep manuscript content untouched
- let AI prompts receive the project language as context
- keep built-in agent and skill definitions localizable

Deferred:

- complete translation QA
- runtime language switcher
- community translation packs
- per-agent language style tuning

## Language Concepts

| Concept | Meaning |
| --- | --- |
| App locale | UI language used by TWLR controls |
| Project language | primary language of the manuscript |
| Prompt language | language requested for AI reasoning output |
| Source language | language of imported source material |
| Target language | language for adaptation or translation work |

For most P0 projects, project language and prompt language should match by default.

## Implementation Direction

Suggested repository shape:

```text
packages/ui/src/i18n/
├── keys.ts
├── en.ts
└── zh-CN.ts
```

Recommended interface:

```ts
type Locale = "en" | "zh-CN";
type MessageKey = "studioCoordinator.title" | "writersRoom.title";

function t(key: MessageKey, locale: Locale): string;
```

The first implementation can be small. The important part is not to spread permanent English-only copy through state engines, providers, prompts, or schema logic.

## AI Prompt Rule

Provider adapters should not decide output language by themselves.

Production skills and Writers' Room services should pass explicit language context:

```json
{
  "project_language": "zh-CN",
  "response_language": "zh-CN"
}
```

This keeps provider logic generic and prevents language behavior from becoming vendor-specific.
