# Theme Analyst P0 Cost Analysis

This document evaluates whether Theme Analyst should be included in P0.

## Potential Value

Theme Analyst helps with:

- motif repetition
- emotional pattern tracking
- author intent consistency
- genre promise alignment
- symbolic setup and payoff

It may be valuable for web novel, light novel, and script authors when a project has strong recurring motifs or a theme-led premise.

## P0 Cost

Including Theme Analyst in P0 adds cost in four places.

### 1. Product Clarity

P0 is already introducing:

- Studio Coordinator
- Production Skills
- Writers' Room
- proposal cards
- narrative state
- timeline and open-loop tracking

Theme Analyst is more abstract than Development Editor, Reader Agent, Character Editor, and Continuity Editor. It may make the first experience feel broader but less concrete.

### 2. State Model Surface

Theme Analyst needs reliable theme state:

- theme records
- related chapters
- related motifs
- relation to open loops
- change history

The repository has `themes.json`, but P0 does not yet have theme projection, theme proposal cards, or theme-specific review UI.

### 3. Prompt and Evaluation Quality

Theme observations are easy to make vague.

Bad P0 output risk:

```text
The chapter explores trust and identity.
```

Useful output needs stronger structure:

```text
Motif: replaced name
Theme pressure: identity can be administratively rewritten
Affected payoff: later identity reveal may need stronger contrast
```

That requires prompt design and test examples.

### 4. UI Attention

Writers' Room meetings with too many perspectives can feel noisy.

For P0, four voices may already be enough:

- Development Editor
- Reader Agent
- Character Editor
- Continuity Editor

Theme Analyst should not compete with concrete continuity and pacing feedback unless the author explicitly needs that lens.

## Recommendation

Do not make Theme Analyst a default P0 participant.

Recommended P0 compromise:

- keep Theme Analyst in the official agent registry
- hide it from the default Writers' Room selection
- allow it in developer/debug or later advanced meeting type
- do not build theme state projection until the core state loop is stable

This keeps the product thesis intact without adding abstract noise too early.

## Revisit Criteria

Reconsider Theme Analyst for P0 only if:

- Writers' Room selection UI supports optional perspectives cleanly
- theme proposal cards have a concrete schema
- at least one demo project shows theme tracking as operationally useful
- user testing shows authors ask for motif/theme review early
