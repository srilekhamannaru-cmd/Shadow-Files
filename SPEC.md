# SHADOW FILES --- Project Specification

**Product type:** AI-powered mystery investigation web application\
**Project deadline:** November 2, 2026, 11:59 PM\
**Primary goal:** Deliver a complete, responsive, deployed mystery game
with a secure backend, Gemini-generated cases, persistent case progress,
and a distinctive investigation experience.

## 1. Product Overview

SHADOW FILES is an interactive AI mystery room where players investigate
fictional cases using evidence, suspect statements, timelines, and
branching discoveries. The experience blends cinematic detective
fiction, psychological suspense, and futuristic forensic analysis.

Players provide a premise, select a difficulty, and receive a structured
mystery generated with Gemini. They inspect suspects, discover clues,
ask for limited hints, question suspects through controlled prompts,
connect evidence on an investigation board, and accuse a suspect. The
server calculates the final score and reveals the solution only after
the accusation is submitted.

### Problem statement

Many simple mystery games are linear stories that ask players to guess a
culprit without meaningful investigation. SHADOW FILES aims to make the
player feel like an investigator by connecting clues to suspect
statements and a case timeline, while keeping the experience feasible
for a student project.

### Target users

-   Students and casual players who enjoy detective stories, puzzles,
    and interactive fiction.
-   Users who want to create a mystery from their own premise.
-   Demonstrators evaluating a complete AI-powered web application.

### Core experience principles

1.  Every case must have one fixed culprit and a logically supported
    solution.
2.  The culprit and private solution must remain on the server until an
    accusation is submitted.
3.  Players should be able to finish a case without using hints.
4.  AI output must be validated before it becomes playable.
5.  The interface must work on desktop and mobile.
6.  The project should prioritize a complete, reliable core game over
    unfinished advanced features.

## 2. Scope and Priorities

### Must-have (submission-critical)

-   Home page and start action.
-   Create Mystery page with premise input and Easy, Medium, Hard
    selection.
-   Gemini-generated structured mystery.
-   Investigation Room with story, suspects, clue discovery, hints, and
    progress.
-   Accusation flow and Results page.
-   Backend-only culprit and solution.
-   Backend scoring and validation.
-   MongoDB persistence through Mongoose.
-   Loading, empty, validation, and API error states.
-   Responsive design.
-   Deployed frontend and backend, with a complete live mystery solved
    during final testing.

### Signature features (implement after the core loop works)

1.  **Evidence Board:** Players can select discovered clues and connect
    them to suspects or timeline events. Connections are stored as
    player reasoning; they do not change the canonical solution.
2.  **Case Timeline:** Show known events in chronological order. Some
    events become visible only after their associated clue is
    discovered.
3.  **Contradiction Alerts:** A deterministic backend rule checks
    predefined contradiction links included in validated case data. The
    UI highlights a mismatch but does not reveal the culprit.
4.  **Suspect Interrogation:** Players select from curated question
    categories (alibi, motive, evidence, timeline). Gemini or prepared
    case-specific responses may be used, but responses must not change
    the fixed facts, culprit, or solution.
5.  **Branching Evidence:** Discovering selected clues unlocks optional
    follow-up details or another clue. All paths must preserve the same
    logically valid solution.
6.  **Detective Rank:** Results can show a rank based on score, but the
    required numeric score remains authoritative.

### Optional only if time permits

-   Sound effects or background audio (off by default).
-   More elaborate animations.
-   Player accounts and global leaderboards.
-   User-created custom case templates beyond the premise input.
-   Multiplayer mode.

Do not delay core requirements to implement optional features.

## 3. Technology Stack

-   **Frontend:** React, Vite, React Router, Tailwind CSS, Axios.
-   **Backend:** Node.js, Express.
-   **Database:** MongoDB Atlas, Mongoose.
-   **AI:** Gemini API through the official `@google/genai` SDK, called
    only by the backend.
-   **Validation:** Zod for request and generated-data validation.
-   **Deployment:** Vercel for the frontend and a suitable Node.js
    hosting provider for the backend.
-   **Secrets:** Environment variables on local development and the
    hosting provider. Never commit `.env` or expose Gemini credentials
    in frontend code.

Suggested repository structure:

``` text
shadow-files/
  SPEC.md
  client/
    src/
      components/
      pages/
      services/
      App.jsx
      main.jsx
  server/
    src/
      config/
      models/
      routes/
      controllers/
      services/
      validators/
      app.js
      server.js
    .env.example
  .gitignore
  README.md
```

The actual structure may be adjusted during implementation, but frontend
and backend must remain clearly separated.

## 4. User Journey

1.  User opens the SHADOW FILES home page and selects **Open a Case**.
2.  User enters a short premise or chooses a suggested premise, then
    selects Easy, Medium, or Hard.
3.  Frontend submits the request to `POST /api/cases`.
4.  Backend validates input, calls Gemini, validates the structured
    output, checks consistency, and stores the case in MongoDB.
5.  Frontend opens the Investigation Room with the public case summary,
    suspects, and available actions.
6.  Player discovers clues. The backend records each discovery once and
    returns public clue details.
7.  Player requests a hint. The backend returns the next available hint
    and records the hint usage.
8.  Player uses the Evidence Board and Timeline to organize discovered
    information. Optional interrogation questions can be asked without
    changing fixed case facts.
9.  Player selects a suspect and submits an accusation.
10. Backend evaluates the accusation, computes score, marks the case
    complete, and only then returns the culprit and explanation.
11. Results page shows verdict, explanation, score breakdown, clues
    found, hints used, and detective rank.
12. Player can start a new case.

## 5. Pages and UI Requirements

### Home

-   SHADOW FILES title and concise introduction.
-   Featured case teaser.
-   Primary **Open a Case** button.
-   Short explanation of the investigation process.
-   Responsive navigation and consistent visual identity.

### Create Mystery

-   Premise text area with length limits.
-   Suggested premise chips.
-   Difficulty selector: Easy, Medium, Hard.
-   Generate button, disabled while submitting.
-   Input validation and recoverable error message.

### Investigation Room

-   Case title, story, difficulty, and progress.
-   Suspect dossier cards with public profiles, motives or known facts;
    do not expose the hidden culprit field.
-   Clue list with locked/discovered states.
-   Discover clue action.
-   Hint action and remaining hint count.
-   Case timeline.
-   Evidence Board with clue-to-suspect/event connections.
-   Optional interrogation panel with a limited set of question
    categories.
-   Accuse Suspect action.
-   Confirmation step before the final accusation.

### Accusation

-   List only suspects included in the public case.
-   Require a suspect selection.
-   Clearly warn that submitting ends the investigation.
-   Prevent repeated or conflicting submissions.

### Results

-   Verdict and correct culprit.
-   Explanation of how the evidence supports the solution.
-   Correct/incorrect accusation status.
-   Score breakdown: base points, clue points, hint deductions, final
    score.
-   Detective rank.
-   Start Another Case button.

### Shared UI states

-   Loading skeleton or progress indicator during generation.
-   Friendly empty state where no case is active.
-   Clear error and retry messages.
-   Mobile-friendly layout and keyboard-accessible controls.
-   Never display raw server stack traces or secret AI output.

## 6. Difficulty and Scoring Rules

The following values are required by the supplied project guide.

  Difficulty     Suspects   Clues   Hints   Correct accusation base
  ------------ ---------- ------- ------- -------------------------
  Easy                  3       5       2                       100
  Medium                4       7       3                       150
  Hard                  5       9       3                       200

Scoring formula:

`finalScore = max(0, (correctAccusation ? basePoints : 0) + (uniqueCluesDiscovered * 5) - (hintsUsed * 10))`

-   Correct accusation: base points for selected difficulty.
-   Incorrect accusation: zero base points, but clue points are still
    counted and hint deductions still apply.
-   Each unique discovered clue: +5 points, awarded once.
-   Each hint used: −10 points.
-   Minimum score: 0.
-   Backend computes the score from persisted case state. Ignore any
    client-supplied score or progress totals.
-   Store a score snapshot when the case is completed to prevent
    repeated submissions from changing it.

## 7. Mystery Data and AI Contract

Gemini must return structured JSON matching a server-defined schema. The
server validates all required fields, counts, unique IDs, and references
before saving. Do not trust free-form AI output or assume valid JSON.

### Private case document

The MongoDB case document contains both public game data and private
solution data. The API must never serialize the entire document to the
client.

Recommended fields:

-   `title`, `premise`, `story`, `difficulty`, `status`
-   `suspects`: stable ID, name, public profile, public motive, public
    alibi
-   `clues`: stable ID, title, public description, discovery condition,
    optional unlock dependency, related suspect/event IDs
-   `hints`: ordered hint text
-   `timeline`: events and unlock conditions
-   `contradictions`: references to two or more evidence/suspect facts
    and a non-spoiling alert message
-   `solution` (private): culprit suspect ID, explanation, decisive clue
    IDs, internal consistency notes
-   `playerProgress`: discovered clue IDs, hints used, evidence board
    connections, interrogation count if applicable
-   `accusation`: submitted suspect ID and timestamp
-   `score`: final score and breakdown
-   timestamps and schema version

Never return `solution`, private consistency notes, hidden clue
payloads, or private prompt content in a pre-accusation response. Use
explicit public response DTOs/serializers rather than removing a few
fields from a whole database object.

### Generation requirements

-   Easy: exactly 3 suspects, 5 clues, 2 hints.
-   Medium: exactly 4 suspects, 7 clues, 3 hints.
-   Hard: exactly 5 suspects, 9 clues, 3 hints.
-   Exactly one valid culprit ID that references an existing suspect.
-   The decisive evidence must support the solution.
-   Red herrings may be plausible but must not make another suspect
    equally guilty.
-   Every clue, suspect, and timeline reference must point to an
    existing ID.
-   Clue dependencies must not form a deadlock or cycle.
-   The solution must remain consistent across interrogation responses
    and branching paths.
-   Use a bounded retry if generation or validation fails; then return a
    friendly error rather than saving invalid data.
-   Prefer a deterministic, pre-authored fallback case if practical, so
    a temporary Gemini outage does not make all testing impossible.
    Clearly mark fallback cases internally.

## 8. API Design

All endpoints use JSON and return consistent errors such as
`{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }`. Do not
expose stack traces or secrets.

### `POST /api/cases`

Request:

``` json
{
  "premise": "A rare artifact disappears from a sealed archive.",
  "difficulty": "medium"
}
```

Behavior: validate input; generate and validate the case; save it;
return a public case DTO and case ID. Never return private solution
fields.

### `GET /api/cases/:id`

Return public case details and the current player's progress. Never
return the culprit or solution while the case is active.

### `POST /api/cases/:id/clues/:clueId/discover`

Mark a valid clue discovered if its unlock conditions are satisfied.
Award clue points only once. Return the public clue details and updated
progress.

### `POST /api/cases/:id/hints`

Return the next unused hint, if available. Persist hint usage once. If
no hints remain, return a clear conflict/limit response. Never reveal
the full solution.

### `POST /api/cases/:id/accuse`

Request:

``` json
{
  "suspectId": "suspect-id"
}
```

Behavior: validate suspect ID and active case state; accept one final
accusation; compute score on the server; mark the case complete; then
return the verdict, culprit, explanation, and score breakdown. Repeated
submissions must not recalculate or overwrite the result.

### `GET /api/cases/:id/result`

Return results only when the case is completed. Before completion,
return a conflict response without solution details.

### Additional endpoints (only as needed)

-   `GET /api/health` for deployment health checks.
-   `POST /api/cases/:id/interrogate` for bounded suspect questions.
-   `POST /api/cases/:id/connections` to save evidence-board
    connections.
-   `GET /api/cases/:id/timeline` if timeline data should be fetched
    separately.

Validate MongoDB IDs, request body size, premise length, difficulty
enum, clue IDs, suspect IDs, and active/completed state. Use appropriate
HTTP status codes and centralized error handling.

## 9. Security and Integrity

-   Gemini API key exists only in the backend environment.
-   MongoDB URI exists only in the backend environment.
-   Frontend uses a configurable backend base URL; never hardcode
    production secrets.
-   Add CORS allowlisting using the configured client URL.
-   Validate all input on the server.
-   Limit premise length and interrogation input length.
-   Apply basic rate limiting to mystery generation and AI interrogation
    routes.
-   Do not execute or render generated HTML. Render AI-generated content
    as text.
-   Do not trust client-supplied points, discovered-clue counts,
    hints-used counts, or culprit guesses as scoring facts.
-   Use public DTOs that exclude private fields.
-   Store and check case status before allowing clue discovery, hints,
    accusations, or result retrieval.
-   Never reveal the solution through errors, logs sent to the client,
    HTML payloads, or frontend source.
-   Keep `.env` out of Git; provide `.env.example` with placeholder
    values only.

## 10. Visual Design System

### Art direction

Cinematic noir mixed with a forensic interface: charcoal and near-black
surfaces, burgundy accents, aged-paper cream, and antique gold
highlights. Avoid a generic neon-blue AI dashboard.

### Components

-   Classified case-file headers and stamps.
-   Suspect dossier cards.
-   Evidence cards with discovered/locked states.
-   Timeline event markers.
-   Contradiction alert panel.
-   Evidence Board with selectable clue cards and connections.
-   Clear progress and score indicators.
-   Subtle transitions; honor reduced-motion preferences.

### Accessibility

-   Maintain readable contrast.
-   Use semantic headings and labelled controls.
-   Ensure keyboard navigation and visible focus.
-   Do not use color alone to indicate evidence state.
-   Support mobile viewport widths.

## 11. Error Handling and Reliability

-   Invalid premise or difficulty: return validation error and explain
    how to fix it.
-   Gemini timeout, quota, or invalid response: bounded retry, then
    friendly error or a validated fallback case.
-   MongoDB unavailable: return service-unavailable error without
    leaking connection details.
-   Unknown case, clue, or suspect ID: return not-found or validation
    response.
-   Locked clue: explain the required discovery without exposing hidden
    content.
-   No hints left: explain that the hint allowance has been used.
-   Completed case: prevent further changes.
-   Network failure: show retry action and preserve the current page
    where possible.

## 12. Acceptance Criteria

The project is considered complete when all of the following are true:

1.  Easy, Medium, and Hard mysteries can be generated with the specified
    suspect, clue, and hint counts.
2.  Generated output is validated before saving.
3.  Players can open and retrieve a case.
4.  Players can discover clues and request hints within the allowed
    limit.
5.  Evidence Board and timeline support the investigation; any optional
    advanced feature that is not finished is omitted cleanly.
6.  Players can submit an accusation and see a final verdict, culprit,
    explanation, and score.
7.  Scoring is performed on the backend with the required formula and
    minimum of zero.
8.  The culprit and solution are absent from all active-case API
    responses.
9.  Completed results cannot be overwritten by repeated accusation
    requests.
10. Invalid inputs, AI failures, and database failures are handled
    gracefully.
11. Layout works on desktop and mobile.
12. Secrets are not committed to GitHub.
13. The deployed frontend can reach the deployed backend and database.
14. A complete mystery can be created and solved on the deployed
    website.
15. GitHub repository URL and live website URL are ready for submission.

## 13. Test Plan

-   Generate one case at each difficulty and verify exact counts.
-   Verify invalid premise, difficulty, and IDs are rejected.
-   Inspect every active-case API response to ensure the culprit and
    solution are absent.
-   Discover the same clue twice and confirm it earns points only once.
-   Use all hints and verify the hint limit and score deductions.
-   Test correct and incorrect accusations.
-   Verify score never falls below zero.
-   Attempt a second accusation and confirm the stored result does not
    change.
-   Request results before accusation and confirm no solution is
    disclosed.
-   Simulate AI failure and verify graceful recovery.
-   Test mobile navigation, loading states, and error states.
-   Repeat the full flow against the deployed website.

## 14. Build and Deployment Order

1.  Finalize this `SPEC.md`.
2.  Create the React/Vite client and Express server.
3.  Configure environment variables and connect MongoDB Atlas.
4.  Implement Mongoose models, public DTOs, and API error handling.
5.  Implement case generation, schema validation, and private solution
    handling.
6.  Test API routes and scoring before building the full UI.
7.  Build Home and Create Mystery.
8.  Build Investigation Room, clues, hints, and progress.
9.  Build Accusation and Results.
10. Add Evidence Board, timeline, and contradiction alerts.
11. Run acceptance tests and fix critical defects.
12. Deploy backend and configure production environment variables.
13. Deploy frontend to Vercel and configure its backend URL.
14. Test a complete mystery on the production website.
15. Push final source code and submit repository and live URL before the
    deadline.

## 15. Final Deliverables

-   Complete source code in a GitHub repository.
-   This `SPEC.md` file.
-   Deployed frontend URL.
-   Deployed backend API with environment variables configured securely.
-   MongoDB Atlas database configuration.
-   Evidence of a full mystery being generated and solved on the live
    website.
-   Submission through the project guide's specified submission form.

**Definition of success:** SHADOW FILES feels like a distinctive
investigation experience while remaining a secure, tested, fully
deployed application that satisfies every required project criterion.
