# pi-ephemeral

Pi extension for ephemeral (temporary, unsaved) conversations.

## Commands

- `/ephemeral` — Mark current session as ephemeral (deleted on exit)
- `/save` — Convert ephemeral session to permanent

## Flags

- `--ephemeral` — Start pi in ephemeral mode

## Development

```bash
# Test locally
pi -e ./src/index.ts

# Install globally
pi install /Users/mitchfultz/Projects/AI/pi-ephemeral
```
