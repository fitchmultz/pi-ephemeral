# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-16

### Added
- Initial `pi-ephemeral` release with toggle, flag, status indicator, and switch safety.
- `--ephemeral` CLI flag to start a fresh ephemeral session.
- `/ephemeral` command to toggle ephemeral mode on/off, with `/ephemeral on` and `/ephemeral off` subcommands.
- `⚡ ephemeral` status bar indicator (visible only when enabled).
- Confirmation dialog before switching away from an unsaved ephemeral session.
- Ephemeral state persisted as a custom session entry to survive `/reload` and `/resume`.
