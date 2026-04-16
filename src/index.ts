/**
 * pi-ephemeral — Temporary unsaved conversations with pi.
 *
 * Purpose: Allow users to have throwaway conversations that are automatically
 * cleaned up on exit, with a seamless escape hatch to persist them later.
 *
 * Responsibilities:
 * - Track ephemeral state per session
 * - Delete session file on shutdown when ephemeral
 * - Provide /ephemeral and /save commands
 * - Show visual indicator in status bar
 * - Warn before navigating away from unsaved ephemeral sessions
 *
 * Usage:
 *   pi --ephemeral          Start a fresh ephemeral session
 *   /ephemeral              Mark current session as ephemeral
 *   /save [name]            Convert ephemeral session to permanent
 *
 * Invariants:
 * - Ephemeral state is stored as a custom entry so it survives /reload
 * - Session file is only deleted on clean shutdown (crashes leave it for recovery)
 * - /save is idempotent on non-ephemeral sessions (just names them)
 */

import type { ExtensionAPI, ExtensionContext, SessionBeforeSwitchEvent } from "@mariozechner/pi-coding-agent";
import { existsSync, unlinkSync } from "node:fs";

const CUSTOM_TYPE = "pi-ephemeral";

export default function ephemeralExtension(pi: ExtensionAPI) {
	let isEphemeral = false;

	// ---------------------------------------------------------------------------
	// CLI Flag
	// ---------------------------------------------------------------------------

	pi.registerFlag("ephemeral", {
		description: "Start in ephemeral mode (session deleted on exit)",
		type: "boolean",
		default: false,
	});

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

	function updateStatus(ctx: ExtensionContext) {
		if (isEphemeral) {
			ctx.ui.setStatus("ephemeral", ctx.ui.theme.fg("warning", "⚡ ephemeral"));
		} else {
			ctx.ui.setStatus("ephemeral", undefined);
		}
	}

	/**
	 * Scan session entries for the most recent ephemeral marker.
	 * The last marker wins — if it says ephemeral=false, the session is permanent.
	 */
	function readEphemeralState(entries: Array<{ type: string; customType?: string; data?: unknown }>): boolean {
		for (let i = entries.length - 1; i >= 0; i--) {
			const entry = entries[i];
			if (entry.type === "custom" && entry.customType === CUSTOM_TYPE) {
				const data = entry.data as { ephemeral?: boolean } | undefined;
				return data?.ephemeral !== false;
			}
		}
		return false;
	}

	// ---------------------------------------------------------------------------
	// Session Lifecycle
	// ---------------------------------------------------------------------------

	pi.on("session_start", async (_event, ctx) => {
		// Check CLI flag first
		const flag = pi.getFlag("--ephemeral");
		if (flag) {
			isEphemeral = true;
		} else {
			// Restore from session entries (survives /reload and /resume)
			isEphemeral = readEphemeralState(ctx.sessionManager.getEntries());
		}

		if (isEphemeral) {
			// Ensure the marker is present (in case it was set by flag)
			pi.appendEntry(CUSTOM_TYPE, { ephemeral: true });
			updateStatus(ctx);
		}
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		if (!isEphemeral) return;

		const sessionFile = ctx.sessionManager.getSessionFile();
		if (sessionFile && existsSync(sessionFile)) {
			try {
				unlinkSync(sessionFile);
			} catch {
				// Best-effort cleanup; file may be locked on some platforms
			}
		}
	});

	// ---------------------------------------------------------------------------
	// Safety: Warn Before Leaving Unsaved Ephemeral Session
	// ---------------------------------------------------------------------------

	pi.on("session_before_switch", async (event: SessionBeforeSwitchEvent, ctx) => {
		if (!isEphemeral || !ctx.hasUI) return;

		const action = event.reason === "new" ? "clearing" : "switching from";
		const confirmed = await ctx.ui.confirm(
			"Ephemeral session",
			`This session is ephemeral and will be lost. ${action.charAt(0).toUpperCase() + action.slice(1)} anyway?`,
		);

		if (!confirmed) {
			ctx.ui.notify("Cancelled", "info");
			return { cancel: true };
		}
	});

	// ---------------------------------------------------------------------------
	// Commands
	// ---------------------------------------------------------------------------

	pi.registerCommand("ephemeral", {
		description: "Mark current session as ephemeral (deleted on exit)",
		handler: async (_args, ctx) => {
			if (isEphemeral) {
				ctx.ui.notify("Already ephemeral", "info");
				return;
			}

			isEphemeral = true;
			pi.appendEntry(CUSTOM_TYPE, { ephemeral: true });
			updateStatus(ctx);
			ctx.ui.notify("Session is now ephemeral — it will be deleted on exit", "info");
		},
	});

	pi.registerCommand("save", {
		description: "Save ephemeral session (convert to permanent, optionally name it)",
		handler: async (args, ctx) => {
			if (!isEphemeral) {
				// Idempotent: just name it if they pass a name
				const name = args?.trim();
				if (name) {
					pi.setSessionName(name);
					ctx.ui.notify(`Session named: ${name}`, "info");
				} else {
					ctx.ui.notify("Session is already permanent", "info");
				}
				return;
			}

			// Exit ephemeral mode
			isEphemeral = false;
			pi.appendEntry(CUSTOM_TYPE, { ephemeral: false });
			updateStatus(ctx);

			// Optionally name the session
			const name = args?.trim();
			if (name) {
				pi.setSessionName(name);
				ctx.ui.notify(`Session saved as "${name}"`, "info");
			} else {
				ctx.ui.notify("Session saved!", "info");
			}
		},
	});
}
