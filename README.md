# pi-ephemeral

Temporary, unsaved conversations with [pi](https://github.com/badlogic/pi-mono).

When you want a quick throwaway conversation — testing an idea, asking a question you don't need to keep — start an ephemeral session. The session file is automatically deleted when you exit. If you change your mind, `/save` makes it permanent.

## Install

```bash
pi install git:github.com/mitchfultz/pi-ephemeral
# or
pi install npm:pi-ephemeral
```

## Usage

### Start a fresh ephemeral session

```bash
pi --ephemeral
```

### Mark current session as ephemeral

```
/ephemeral
```

Mid-conversation, realize you don't want this saved? Run `/ephemeral` and the session will be cleaned up on exit.

### Save an ephemeral session

```
/save                  # just save it
/save Refactor auth    # save and name it
```

Converts the ephemeral session to a normal permanent one. The session will appear in `/resume` and persist across restarts.

## How It Works

- Ephemeral sessions work normally during the conversation — pi reads and writes the session file as usual
- On clean exit (`Ctrl+C`, `Ctrl+D`), the session file is deleted
- If pi crashes, the file remains — you can recover it via `/resume` (it will still be marked ephemeral) or let it get cleaned up next time
- Ephemeral state survives `/reload` and session restoration
- You'll see a `⚡ ephemeral` indicator in the status bar
- You'll be warned before switching away from an unsaved ephemeral session

## vs `--no-session`

Pi has a built-in `--no-session` flag that runs sessions entirely in-memory with no file. pi-ephemeral is different:

| | `--no-session` | pi-ephemeral |
|---|---|---|
| No file on disk | ✅ In-memory only | File exists during session, deleted on exit |
| Toggle mid-conversation | ❌ | ✅ `/ephemeral` |
| Save for later | ❌ | ✅ `/save` |
| Visual indicator | ❌ | ✅ Status bar |
| Warn before leaving | ❌ | ✅ |
| Crash recovery | ❌ Lost forever | ✅ File remains for `/resume` |

Use `--no-session` for truly disposable chats. Use pi-ephemeral when you *might* want to keep it.

## License

MIT
