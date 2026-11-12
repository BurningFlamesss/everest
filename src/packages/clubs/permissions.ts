/**
 * Club-level permission keys.
 *
 * A role's `permissions` column is a comma-separated list of these keys.
 * `posts.create` is what separates, say, a President (who can publish to the
 * club feed) from a plain Member (who cannot).
 */
export const CLUB_PERMISSIONS = [
	{
		key: "posts.create",
		label: "Create posts",
		description: "Publish posts to the club feed.",
	},
	{
		key: "posts.editAny",
		label: "Edit any post",
		description: "Edit or delete posts written by other members.",
	},
	{
		key: "posts.pin",
		label: "Pin posts",
		description: "Pin posts to the top of the club feed.",
	},
	{
		key: "members.manage",
		label: "Manage members",
		description: "Add or remove club members and change their roles.",
	},
] as const;

export type ClubPermissionKey = (typeof CLUB_PERMISSIONS)[number]["key"];

export const ALL_CLUB_PERMISSIONS: Array<ClubPermissionKey> =
	CLUB_PERMISSIONS.map((definition) => definition.key);

export function isClubPermissionKey(value: string): value is ClubPermissionKey {
	return (ALL_CLUB_PERMISSIONS as Array<string>).includes(value);
}

/** Parse a role's comma-separated permissions column into a key set. */
export function parseClubPermissions(
	raw: string | null | undefined,
): Set<string> {
	return new Set(
		(raw ?? "")
			.split(",")
			.map((part) => part.trim())
			.filter(Boolean),
	);
}

export function joinClubPermissions(keys: Iterable<string>): string {
	return [...new Set(keys)]
		.map((key) => key.trim())
		.filter(Boolean)
		.join(",");
}

/** Human-readable sentence for a role's permissions, used on the public page. */
export function clubPermissionsLabel(raw: string | null | undefined): string {
	const keys = [...parseClubPermissions(raw)];
	if (keys.length === 0) return "";
	const labels = CLUB_PERMISSIONS.filter((definition) =>
		keys.includes(definition.key),
	).map((definition) => definition.label.toLowerCase());
	return labels.join(", ");
}
