# Changelog

All notable changes to this project will be documented in this file.

## [0.1.4] - 2026-04-21

### Changed
- updated the local pi development baseline to `@mariozechner/pi-coding-agent` `0.68.0`
- regenerated the npm lockfile against the current stable dependency graph
- reviewed the pi `0.68.0` changelog and confirmed the extension does not depend on removed cwd-bound tool exports or implicit cwd helper fallbacks

## [0.1.3] - 2026-04-18

### Changed
- bumped the local pi development baseline to `@mariozechner/pi-coding-agent` `0.67.68` and `typescript` `6.0.3`
- started tracking `package-lock.json` so future dependency refreshes stay reproducible and reviewable from git

## [0.1.2] - 2026-04-17

### Changed
- published a packaging-only follow-up release to keep the scoped npm package version sequence aligned

## [0.1.1] - 2026-04-16

### Changed
- renamed the package to `@fitchmultz/pi-ephemeral` for scoped npm publishing

## [0.1.0] - 2026-04-16

### Added
- Initial `pi-ephemeral` release with toggle, flag, status indicator, and switch safety.
- `--ephemeral` CLI flag to start a fresh ephemeral session.
- `/ephemeral` command to toggle ephemeral mode on/off, with `/ephemeral on` and `/ephemeral off` subcommands.
- `⚡ ephemeral` status bar indicator (visible only when enabled).
- Confirmation dialog before switching away from an unsaved ephemeral session.
- Ephemeral state persisted as a custom session entry to survive `/reload` and `/resume`.
