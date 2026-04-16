/**
 * pi-ephemeral — Temporary unsaved conversations with pi.
 *
 * Purpose: Allow users to have throwaway conversations that are automatically
 * cleaned up on exit, with a seamless toggle to persist them later.
 *
 * Responsibilities:
 * - Track ephemeral state per session
 * - Delete session file on shutdown when ephemeral
 * - Provide /ephemeral toggle command
 * - Show visual indicator in status bar when enabled (hidden when disabled)
 * - Warn before navigating away from unsaved ephemeral sessions
 *
 * Usage:
 *   pi --ephemeral          Start a fresh ephemeral session
 *   /ephemeral              Toggle ephemeral on/off
 *   /ephemeral on           Enable ephemeral (no-op if already on)
 *   /ephemeral off          Disable ephemeral (no-op if already off)
 *
 * Invariants:
 * - Ephemeral state is stored as a custom entry so it survives /reload
 * - Session file is only deleted on clean shutdown (crashes leave it for recovery)
 * - Status bar indicator only visible when ephemeral is enabled
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

	function setEphemeral(value: boolean, ctx: ExtensionContext) {
		isEphemeral = value;
		pi.appendEntry(CUSTOM_TYPE, { ephemeral: value });
		updateStatus(ctx);
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
			pi.appendEntry(CUSTOM_TYPE, { ephemeral: true });
		}
		updateStatus(ctx);
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
	// Command
	// ---------------------------------------------------------------------------

	pi.registerCommand("ephemeral", {
		description: "Toggle ephemeral mode (deleted on exit). Use: /ephemeral, /ephemeral on, /ephemeral off",
		handler: async (args, ctx) => {
			const subcommand = args?.trim().toLowerCase();

			if (subcommand === "on") {
				if (isEphemeral) {
					ctx.ui.notify("Already ephemeral", "info");
					return;
				}
				setEphemeral(true, ctx);
				ctx.ui.notify("Session is now ephemeral — it will be deleted on exit", "info");
			} else if (subcommand === "off") {
				if (!isEphemeral) {
					ctx.ui.notify("Ephemeral is not enabled", "info");
					return;
				}
				setEphemeral(false, ctx);
				ctx.ui.notify("Ephemeral disabled — session will be kept", "info");
			} else {
				// Toggle
				setEphemeral(!isEphemeral, ctx);
				ctx.ui.notify(
					isEphemeral
						? "Session is now ephemeral — it will be deleted on exit"
						: "Ephemeral disabled — session will be kept",
					"info",
				);
			}
		},
	});
}
