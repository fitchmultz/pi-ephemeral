# pi-ephemeral

Temporary, unsaved conversations with [pi](https://github.com/badlogic/pi-mono).

When you want a quick throwaway conversation — testing an idea, asking a question you don't need to keep — start an ephemeral session. The session file is automatically deleted when you exit. If you change your mind, toggle it off or use `/export`.

## Install

```bash
pi install git:github.com/mitchfultz/pi-ephemeral
# or
pi install npm:pi-ephemeral
```

## Usage

### Start in ephemeral mode

```bash
pi --ephemeral
```

### Toggle ephemeral mid-conversation

```
/ephemeral           # toggle on/off
/ephemeral on        # enable (no-op if already on)
/ephemeral off       # disable (no-op if already off)
```

Mid-conversation, realize you don't want this saved? Run `/ephemeral` to toggle it on. Change your mind? `/ephemeral` again to toggle it off. Need to export the conversation? Use pi's built-in `/export`.

### Visual feedback

- `⚡ ephemeral` appears in the status bar when enabled
- No indicator when disabled

## How It Works

- Ephemeral sessions work normally during the conversation — pi reads and writes the session file as usual
- On clean exit (`Ctrl+C`, `Ctrl+D`), the session file is deleted
- If pi crashes, the file remains — you can recover it via `/resume` (it will still be marked ephemeral) or let it get cleaned up next time
- Ephemeral state survives `/reload` and session restoration
- You'll be warned before switching away from an unsaved ephemeral session

## vs `--no-session`

Pi has a built-in `--no-session` flag that runs sessions entirely in-memory with no file. pi-ephemeral is different:

| | `--no-session` | pi-ephemeral |
|---|---|---|
| No file on disk | ✅ In-memory only | File exists during session, deleted on exit |
| Toggle mid-conversation | ❌ | ✅ `/ephemeral` |
| Crash recovery | ❌ Lost forever | ✅ File remains for `/resume` |
| Visual indicator | ❌ | ✅ Status bar |
| Warn before leaving | ❌ | ✅ |

Use `--no-session` for truly disposable chats. Use pi-ephemeral when you *might* want to keep it.

## License

MIT
