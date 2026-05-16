# Short Drama Confirmation Queue

These items should wait for product confirmation.

## P0 Product Decisions

1. ASR path

   Current direction:

   - P0: Groq Whisper API for low-cost remote transcription.
   - P1: Deepgram as likely production ASR default.
   - Fallback / premium: OpenAI transcription.
   - Manual subtitle import remains supported for cases that already have SRT/VTT.

   Need confirmation later:

   - whether Deepgram should become the default before trial users.
   - whether the UI should expose provider choice or keep it hidden behind workspace settings.

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

6. AI short-drama production script format adapter

   Reserve an interface for importing / exporting the future AI short-drama workflow script format.

   Current status:

   - product owner will provide the format document later.
   - do not implement the adapter before the format is confirmed.
   - avoid treating `reconstructed_script.json` as the only long-term script representation.

   Reminder:

   - add a script-format adapter layer before connecting this analysis module to any AI short-drama production pipeline.

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

5. Confirm whether Groq transcription quality is sufficient for the first formal `xianzun` diagnosis, or whether the same episode should be retranscribed with Deepgram for comparison.
