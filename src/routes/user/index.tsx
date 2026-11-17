import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Copy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { STAGGER } from "#/lib/motion";
import { getNoticesServer } from "#/packages/content/server/content.ts";
import { createGuardianInvite } from "#/packages/invite/guardian-invite.ts";
import { getMyPortalServer } from "#/packages/invite/portal.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Skeleton,
} from "#/templates/modern/components/kit";
import { Label } from "#/templates/modern/components/Label";
import { Segmented } from "#/templates/modern/components/Segmented";

export const Route = createFileRoute("/user/")({
	component: PortalIndex,
});

const RELATIONS = ["Father", "Mother", "Guardian", "Other"];

function PortalIndex() {
	const search = useSearch({ strict: false }) as Record<string, unknown>;
	const qc = useQueryClient();
	const [inviteOpen, setInviteOpen] = useState(
		String(search.invite ?? "") === "1",
	);
	const [guardianName, setGuardianName] = useState("");
	const [guardianEmail, setGuardianEmail] = useState("");
	const [relation, setRelation] = useState("Guardian");
	const [lastInvite, setLastInvite] = useState<{
		url: string;
		emailed: boolean;
		reason?: string;
	} | null>(null);

	const portal = useQuery({
		queryKey: ["portal"],
		queryFn: () => getMyPortalServer(),
	});
	const notices = useQuery({
		queryKey: ["portal-notices"],
		queryFn: () => getNoticesServer(),
	});

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
			setLastInvite({
				url: out.inviteUrl,
				emailed: out.emailed,
				reason: out.reason,
			});
			if (out.emailed) {
				toast.success("Guardian invitation emailed");
				setInviteOpen(false);
			} else {
				toast.info("Invite created — copy the link below");
			}
		},
		onError: (e: Error) =>
			toast.error(e.message || "Could not create the invite"),
	});

	if (portal.isLoading) {
		return (
			<PageFrame testId="portal-page">
				<div className="pt-12">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="mt-5 h-12 w-72" />
					<Skeleton className="mt-10 h-48 w-full rounded-card" />
				</div>
			</PageFrame>
		);
	}

	if (!user) {
		return (
			<PageFrame testId="portal-page">
				<p className="t-body pt-12 text-muted-foreground">
					Unable to load your account.
				</p>
			</PageFrame>
		);
	}

	const recentNotices = (notices.data ?? []).slice(0, 5);

	return (
		<PageFrame testId="portal-page">
			<PageHeader
				testId="portal-page-header"
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

			<Section className="!mt-10" testId="portal-grid">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Profile card */}
					<Reveal>
						<section className="h-full rounded-card border border-border bg-card p-6 shadow-xs">
							<h3 className="t-h3 text-foreground">My details</h3>
							<dl className="mt-5 divide-y divide-rule-soft">
								<div className="flex justify-between gap-4 py-2.5">
									<dt className="t-eyebrow">Name</dt>
									<dd className="text-[13.5px] font-medium text-foreground">
										{user.name}
									</dd>
								</div>
								<div className="flex justify-between gap-4 py-2.5">
									<dt className="t-eyebrow">Email</dt>
									<dd className="text-[13.5px] font-medium text-foreground break-all">
										{user.email}
									</dd>
								</div>
								{student?.admissionNo && (
									<div className="flex justify-between gap-4 py-2.5">
										<dt className="t-eyebrow">Admission no.</dt>
										<dd className="text-[13.5px] font-medium text-foreground">
											{student.admissionNo}
										</dd>
									</div>
								)}
							</dl>
						</section>
					</Reveal>

					{/* Student: guardians + invite */}
					{student && (
						<Reveal delay={STAGGER}>
							<section className="h-full rounded-card border border-border bg-card p-6 shadow-xs">
								<div className="flex items-center justify-between gap-3">
									<h3 className="t-h3 text-foreground">Guardians</h3>
									<Button
										size="sm"
										className="gap-1.5 rounded-field"
										onClick={() => setInviteOpen(true)}
									>
										<Users className="h-3.5 w-3.5" /> Invite a guardian
									</Button>
								</div>
								{student.guardians.length > 0 ? (
									<ul className="mt-4 divide-y divide-rule-soft">
										{student.guardians.map((g) => (
											<li
												key={g.email}
												className="flex items-baseline justify-between gap-4 py-2.5"
											>
												<span className="text-[13.5px] font-medium text-foreground">
													{g.name}
												</span>
												<span className="t-caption">{g.relation}</span>
											</li>
										))}
									</ul>
								) : (
									<p className="t-caption mt-4">
										No guardian linked yet. Invite one so they can follow your
										progress.
									</p>
								)}
								{lastInvite && !lastInvite.emailed && (
									<div className="mt-4 rounded-field border border-border bg-secondary/60 p-3">
										<p className="t-caption font-medium text-foreground">
											Share this invite link
										</p>
										<div className="mt-2 flex items-center gap-2">
											<code className="min-w-0 flex-1 truncate rounded-field bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground">
												{lastInvite.url}
											</code>
											<Button
												variant="outline"
												size="sm"
												className="gap-1 shrink-0 rounded-field"
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
						</Reveal>
					)}

					{/* Guardian: linked children */}
					{guardian && (
						<Reveal delay={STAGGER * 2} className="md:col-span-2">
							<section className="rounded-card border border-border bg-card p-6 shadow-xs">
								<h3 className="t-h3 text-foreground">My children</h3>
								{guardian.children.length > 0 ? (
									<ul className="mt-4 grid gap-3 sm:grid-cols-2">
										{guardian.children.map((c) => (
											<li
												key={c.email}
												className="rounded-field border border-border bg-card p-4"
											>
												<p className="text-[13.5px] font-medium text-foreground">
													{c.name}
												</p>
												<p className="t-caption mt-1">
													{c.relation} · Grade {c.grade ?? "—"}
													{c.section ? ` ${c.section}` : ""}
												</p>
											</li>
										))}
									</ul>
								) : (
									<p className="t-caption mt-4">
										No linked students yet. Ask your child to send you a
										guardian invite.
									</p>
								)}
							</section>
						</Reveal>
					)}

					{/* Notices */}
					<Reveal delay={STAGGER * 3} className="md:col-span-2">
						<section className="rounded-card border border-border bg-card p-6 shadow-xs">
							<h3 className="t-h3 text-foreground">Latest notices</h3>
							{recentNotices.length > 0 ? (
								<ul className="mt-4 divide-y divide-rule-soft">
									{recentNotices.map((n) => (
										<li
											key={n.id}
											className="flex items-start justify-between gap-4 py-3"
										>
											<div className="min-w-0">
												<p className="truncate text-[13.5px] font-medium text-foreground">
													{n.title}
												</p>
												<p className="t-caption truncate">{n.summary}</p>
											</div>
											<span className="t-meta shrink-0">
												{n.dateBs || n.dateAd}
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="t-caption mt-4">No notices right now.</p>
							)}
						</section>
					</Reveal>
				</div>
			</Section>

			{/* Invite guardian dialog (students) */}
			<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
				<DialogContent className="border-border bg-card sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="t-h3">Invite a guardian</DialogTitle>
						<DialogDescription>
							We'll email them a link to set a password and link their account
							to yours.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3">
						<div className="space-y-1.5">
							<Label className="text-[13px]">Guardian full name</Label>
							<Input
								value={guardianName}
								onChange={(e: any) => setGuardianName(e.target.value)}
								className="rounded-field border-border bg-background"
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-[13px]">Guardian email</Label>
							<Input
								type="email"
								value={guardianEmail}
								onChange={(e: any) => setGuardianEmail(e.target.value)}
								className="rounded-field border-border bg-background"
							/>
						</div>
						<Segmented
							label="Relationship"
							options={RELATIONS.map((r) => ({ value: r, label: r }))}
							value={relation}
							onChange={setRelation}
							testId="portal-relation-segmented"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setInviteOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={
								!guardianName.trim() ||
								!guardianEmail.trim() ||
								inviteMutation.isPending
							}
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
