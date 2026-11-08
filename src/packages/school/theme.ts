import type { CSSProperties } from "react";
import type { SchoolConfig } from "#/types/school.ts";

/**
 * Turns school config branding into CSS custom properties.
 *
 * The root shell spreads this onto `<html style="...">` during SSR, so a
 * rebrand is a config edit instead of a component edit. Values that are absent
 * fall back to the token defaults in `styles.css`.
 */
export function schoolThemeStyle(config: SchoolConfig): CSSProperties {
	const variables: Record<string, string> = {};

	if (config.theme.primary) variables["--primary"] = config.theme.primary;
	if (config.theme.accent) variables["--accent"] = config.theme.accent;
	if (config.theme.background) {
		variables["--background"] = config.theme.background;
	}
	if (config.theme.sidebar) variables["--sidebar"] = config.theme.sidebar;
	if (config.theme.primary) variables["--ring"] = config.theme.primary;

	return variables as CSSProperties;
}
