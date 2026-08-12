# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This repository is a documentation vault (Obsidian) for the "Curmate" project — it contains no application source code, build scripts, or tests. There is nothing to build, lint, or run. Work in this repo consists of reading, writing, and reorganizing Markdown notes.

## Structure and content flow

Docs live under `docs/`, organized as a numbered pipeline where each stage feeds the next:

```
01-requirements/01-spec    → what the system must do (source of truth)
01-requirements/02-plan    → roadmap/phases derived from spec
01-requirements/03-task    → concrete task breakdown derived from plan
02-design/01-prototypes    → UI/UX mockups, referencing 01-spec
02-design/02-technical     → architecture/DB/API design, referencing 01-prototypes
03-testing/01-test-plan    → test cases, referencing 02-technical and 01-spec
03-testing/02-test-result  → pass/fail results and bugs, referencing 01-test-plan
04-retrospectives          → lessons learned, referencing 02-test-result and 05-log
05-log                     → chronological changelog/decision log
00-archived                → superseded/cancelled docs (see rule below)
```

Each folder has an `index.md` describing its purpose and linking forward/backward along this pipeline via Obsidian wikilinks (`[[../relative/path/index|label]]`). When adding a new document, place it in the stage-appropriate folder and link it into the existing chain rather than leaving it orphaned.

## Conventions

- All doc content is written in Thai.
- Never delete a document that is no longer relevant — move it into `docs/00-archived/` instead, to preserve decision history.
- Cross-references use Obsidian-style relative wikilinks (`[[../02-design/index|02-design]]`), not plain Markdown links — keep this style consistent when adding links.
- `.obsidian/` holds vault UI state (not project content); `.obsidian/workspace.json` is gitignored since it churns on every vault open.
