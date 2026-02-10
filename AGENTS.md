# Quran.com Frontend Agent Standards

This repository uses a single source of truth for AI agent standards and workflows.

## Canonical Source

- Primary entrypoint: `AGENTS.md`
- Canonical content root: `.agents/quran/`
- Reusable shared skills remain in `.agents/skills/`

Do not edit compatibility paths directly. Edit canonical files under `.agents/quran/` and then run:

- `yarn ai:sync` to repair/create required symlinks
- `yarn ai:check` to validate symlinks and canonical markdown links

## Canonical Layout

- Standards: `.agents/quran/standards/`
  - Single source of standards body: `.agents/quran/standards/core-standards.md`
  - Compatibility aliases in standards (`quran-frontend.md`, `copilot-instructions.md`, and
    `instructions/*.instructions.md`) are symlinks to `core-standards.md`
- Commands: `.agents/quran/commands/`
- Prompts: `.agents/quran/prompts/`
- Workflows: `.agents/quran/workflows/`
- Repo-specific skills: `.agents/quran/skills/`
- Compatibility map: `.agents/quran/symlink-map.json`

## Compatibility Contract

Legacy entrypoints are preserved via symlinks, including:

- `CLAUDE.md`
- `.claude/commands/*`
- `.github/copilot-instructions.md`
- `.github/instructions/*`
- `.github/prompts/*`
- `.agent/workflows/*`
- `.agent/skills/*`
- `.windsurf/rules/prompts.md`
- `.cursor/rules/prompts.md`
- `.cursor/prompts/review.prompt.md`

## Repository Context

See `.agents/quran/standards/repo-context.md` for project architecture, commands, and git workflow
notes formerly in `CLAUDE.md`.
