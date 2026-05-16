# Short Drama Confirmation Queue

These items should wait for product confirmation.

## P0 Product Decisions

1. ASR path

   Options:

   - external manual subtitle tools only
   - MacWhisper as recommended local tool
   - remote API transcription
   - support all later, but pick one default now

2. Visual-only report status

   Decide whether `visual_only_observation_report.md` is:

   - an internal diagnostic artifact only
   - a user-facing interim report
   - a hidden fallback when transcript is missing

3. Case storage policy

   Current assumption: local videos, audio, keyframes, and case folders are ignored by Git.

   Need confirmation:

   - Do we need a redacted export format?
   - Should reports be exportable without media?
   - Should case indexes be commit-safe?

4. First real benchmark set

   Need 3-5 short-drama episodes with permission or acceptable internal use.

   The set should include:

   - one power-reversal / cultivation-modern setting
   - one romance / misunderstanding-heavy episode
   - one family-ethics or revenge episode

5. Report quality bar

   Confirm whether the current lint rules are enough for P0:

   - no obvious film-critic drift
   - time/scene evidence present
   - revision or confirmation language present
   - visual-only reports mark uncertainty

## Current `xianzun` Confirmation Needs

1. Confirm whether the 4 visual scene segments are acceptable as a first scene map.

2. Confirm whether the visual-only report should be treated as:

   - useful internal observation
   - too speculative without dialogue
   - acceptable as a user-visible interim artifact

3. Confirm which dialogue ranges should be transcribed first:

   - `00:01:50-00:09:50` street / food-stall conflict
   - `00:10:30-00:13:50` private-room hierarchy conflict
   - full episode

4. Confirm character names after transcript import.

5. Confirm whether the project should prioritize ASR automation next or continue improving visual / report tooling.

