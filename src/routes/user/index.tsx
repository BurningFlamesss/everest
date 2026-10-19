import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { getMyPortalServer } from "#/packages/invite/portal.ts";
import { createGuardianInvite } from "#/packages/invite/guardian-invite.ts";
import { getNoticesServer } from "#/packages/content/server/content.ts";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

export const Route = createFileRoute("/user/")({
	component: PortalIndex,
});

const RELATIONS = ["Father", "Mother", "Guardian", "Other"];

function PortalIndex() {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const qc = useQueryClient();
	const [inviteOpen, setInviteOpen] = useState(String(search.invite ?? "") === "1");
	const [guardianName, setGuardianName] = useState("");
	const [guardianEmail, setGuardianEmail] = useState("");
	const [relation, setRelation] = useState("Guardian");
	const [lastInvite, setLastInvite] = useState<{
		url: string;
		emailed: boolean;
		reason?: string;
	} | null>(null);

	const portal = useQuery({ queryKey: ["portal"], queryFn: () => getMyPortalServer() });
	const notices = useQuery({ queryKey: ["portal-notices"], queryFn: () => getNoticesServer() });

	const student = portal.data?.student ?? null;
	const guardian = portal.data?.guardian ?? null;
	const user = portal.data?.user ?? null;

	const inviteMutation = useMutation({
		mutationFn: () =>
			createGuardianInvite({
				data: {
					studentId: student!.id,
					guardianName: guardianName.trim(),
					guardianEmail: guardianEmail.trim(),
					relation,
				},
			}),
		onSuccess: (out) => {
			qc.invalidateQueries({ queryKey: ["portal"] });
			setLastInvite({ url: out.inviteUrl, emailed: out.emailed, reason: out.reason });
			if (out.emailed) {
				toast.success("Guardian invitation emailed");
				setInviteOpen(false);
			} else {
				toast.info("Invite created — copy the link below");
			}
		},
		onError: (e: Error) => toast.error(e.message || "Could not create the invite"),
	});

	if (portal.isLoading) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
				Unable to load your account.
			</div>
		);
	}

	const recentNotices = (notices.data ?? []).slice(0, 5);

	return (
		<PageFrame>
			<PageHeader
				eyebrow="My Portal"
				title={`Hello, ${user.name.split(" ")[0]}`}
				lead={
					student
						? `Grade ${student.grade ?? "—"}${student.section ? ` · Section ${student.section}` : ""}`
						: guardian
							? "Guardian portal"
							: "Your account"
				}
			/>

			<div className="mt-10 grid gap-6 md:grid-cols-2">
				{/* Profile card */}
				<section className="rounded-card border border-border p-6">
					<h2 className="t-h2 text-foreground text-lg">My details</h2>
					<dl className="mt-4 space-y-2 text-sm">
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Name</dt>
							<dd className="text-foreground font-medium">{user.name}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-muted-foreground">Email</dt>
							<dd className="text-foreground font-medium break-all">{user.email}</dd>
						</div>
						{student?.admissionNo && (
							<div className="flex justify-between gap-4">
								<dt className="text-muted-foreground">Admission no.</dt>
								<dd className="text-foreground font-medium">{student.admissionNo}</dd>
							</div>
						)}
					</dl>
				</section>

				{/* Student: guardians + invite */}
				{student && (
					<section className="rounded-card border border-border p-6">
						<div className="flex items-center justify-between gap-3">
							<h2 className="t-h2 text-foreground text-lg">Guardians</h2>
							<Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
								<Users className="h-3.5 w-3.5" /> Invite a guardian
							</Button>
						</div>
						{student.guardians.length > 0 ? (
							<ul className="mt-4 space-y-2 text-sm">
								{student.guardians.map((g) => (
									<li key={g.email} className="flex justify-between gap-4">
										<span className="text-foreground font-medium">{g.name}</span>
										<span className="text-muted-foreground">{g.relation}</span>
									</li>
								))}
							</ul>
						) : (
							<p className="mt-4 text-sm text-muted-foreground">
								No guardian linked yet. Invite one so they can follow your progress.
							</p>
						)}
						{lastInvite && !lastInvite.emailed && (
							<div className="mt-4 rounded-lg border border-hairline bg-surface-2 p-3">
								<p className="text-xs font-medium text-foreground">Share this invite link</p>
								<div className="mt-2 flex items-center gap-2">
									<code className="min-w-0 flex-1 truncate rounded bg-surface-1 px-2 py-1 text-[11px] text-muted-foreground">
										{lastInvite.url}
									</code>
									<Button
										variant="outline"
										size="sm"
										className="gap-1 shrink-0"
										onClick={() => {
											navigator.clipboard.writeText(lastInvite.url);
											toast.success("Link copied");
										}}
									>
										<Copy className="h-3.5 w-3.5" /> Copy
									</Button>
								</div>
							</div>
						)}
					</section>
				)}

				{/* Guardian: linked children */}
				{guardian && (
					<section className="rounded-card border border-border p-6 md:col-span-2">
						<h2 className="t-h2 text-foreground text-lg">My children</h2>
						{guardian.children.length > 0 ? (
							<ul className="mt-4 grid gap-3 sm:grid-cols-2">
								{guardian.children.map((c) => (
									<li key={c.email} className="rounded-lg border border-hairline p-4">
										<p className="text-foreground font-medium">{c.name}</p>
										<p className="text-xs text-muted-foreground">
											{c.relation} · Grade {c.grade ?? "—"}
											{c.section ? ` ${c.section}` : ""}
										</p>
									</li>
								))}
							</ul>
						) : (
							<p className="mt-4 text-sm text-muted-foreground">
								No linked students yet. Ask your child to send you a guardian invite.
							</p>
						)}
					</section>
				)}

				{/* Notices */}
				<section className="rounded-card border border-border p-6 md:col-span-2">
					<h2 className="t-h2 text-foreground text-lg">Latest notices</h2>
					{recentNotices.length > 0 ? (
						<ul className="mt-4 divide-y divide-hairline">
							{recentNotices.map((n) => (
								<li key={n.id} className="flex items-start justify-between gap-4 py-3">
									<div className="min-w-0">
										<p className="text-foreground font-medium truncate">{n.title}</p>
										<p className="text-xs text-muted-foreground truncate">{n.summary}</p>
									</div>
									<span className="shrink-0 text-xs text-muted-foreground">{n.dateBs || n.dateAd}</span>
								</li>
							))}
						</ul>
					) : (
						<p className="mt-4 text-sm text-muted-foreground">No notices right now.</p>
					)}
				</section>
			</div>

			{/* Invite guardian dialog (students) */}
			<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
				<DialogContent className="bg-popover sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="font-display">Invite a guardian</DialogTitle>
						<DialogDescription>
							We'll email them a link to set a password and link their account to yours.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3">
						<div className="space-y-1.5">
							<Label className="text-xs">Guardian full name</Label>
							<Input value={guardianName} onChange={(e: any) => setGuardianName(e.target.value)} />
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Guardian email</Label>
							<Input type="email" value={guardianEmail} onChange={(e: any) => setGuardianEmail(e.target.value)} />
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Relationship</Label>
							<Select value={relation} onValueChange={(v: string) => setRelation(v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-popover">
									{RELATIONS.map((r) => (
										<SelectItem key={r} value={r}>
											{r}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setInviteOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={!guardianName.trim() || !guardianEmail.trim() || inviteMutation.isPending}
							onClick={() => inviteMutation.mutate()}
						>
							{inviteMutation.isPending ? "Sending…" : "Send invite"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageFrame>
	);
}
