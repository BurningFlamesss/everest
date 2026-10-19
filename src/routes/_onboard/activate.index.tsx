import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { pageCopy } from "#/lib/site";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { Button } from "#/templates/modern/components/Button.tsx";
import {
	ImageReveal,
	SectionLabel,
} from "#/templates/modern/components/Editorial.tsx";
import { Input } from "#/templates/modern/components/Input";
import { Label } from "#/templates/modern/components/Label";
import type { BlockType, ContentBlock } from "#/types";

export const Route = createFileRoute("/_onboard/activate/")({
	beforeLoad: ({ context, location }) => {
		const search = location.search as any;
		if (
			String(search.cms) === "1" ||
			String(search["allow-when-logged-in"]) === "true"
		) {
			return;
		}
		if (context.session) {
			if (
				context.session.user.role === "admin" ||
				context.session.user.role === "super_admin"
			) {
				throw redirect({ to: "/admin/overview" });
			}
			throw redirect({ to: "/user" });
		}
	},
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		if (String(search.cms) === "1") {
			const p = await getWebsitePagePreviewServer({
				data: { key: "activate" },
			});
			return { previewPage: p };
		}
		return { previewPage: null };
	},
	component: RouteComponent,
});

function pick(blocks: ContentBlock[], type: string) {
	return blocks.find((b) => b.type === type);
}

function CmsSectionBox({
	type,
	children,
	onSelect,
	active,
}: {
	type: BlockType;
	children: React.ReactNode;
	onSelect?: (type: BlockType) => void;
	active?: boolean;
}) {
	if (!onSelect) return <>{children}</>;
	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				onSelect(type);
			}}
			className={`relative cursor-pointer ring-inset transition-all hover:ring-2 hover:ring-primary ${
				active ? "ring-2 ring-primary" : "ring-0 ring-transparent"
			}`}
		>
			<div className="pointer-events-none absolute inset-0 z-50 bg-primary/0 transition-colors hover:bg-primary/5" />
			{children}
		</div>
	);
}

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const published = useWebsitePageContent("activate");
	const preview = String(cms ?? "") === "1";
	const activatePage = preview ? previewPage : published;
	const blocks = activatePage?.blocks || [];

	const onSelectSection = preview
		? (sectionType: BlockType) => {
				window.parent?.postMessage(
					{
						source: "scms-cms",
						type: "select-section",
						pageKey: "activate",
						sectionType,
					},
					"*",
				);
			}
		: undefined;

	const visual = pick(blocks, "auth_visual");
	const intro = pick(blocks, "auth_intro");
	const formBlock = pick(blocks, "auth_form");

	const [token, setToken] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!token.trim()) {
			setError("Please enter your activation code.");
			return;
		}
		const safe = encodeURIComponent(token.trim()).replace(/\/+$/, "");
		navigate({ to: `/_onboard/activate/${safe}` });
	};

	return (
		<section
			className="auth-page overflow-x-hidden min-w-0"
			aria-labelledby="activate-title"
		>
			<CmsSectionBox type="auth_visual" onSelect={onSelectSection}>
				<div
					className="auth-visual min-w-0"
					style={{
						height: "100%",
						width: "100%",
						position: "absolute",
						top: 0,
						left: 0,
					}}
				>
					<ImageReveal
						src={
							(visual?.fields?.image as any)?.url ||
							"/public/schools/everest/landing-footage/frame_0001.jpeg"
						}
						alt="School architecture"
						eager
						testId="activate-visual-image"
					/>
					<div className="auth-visual__overlay">
						<SectionLabel
							number={String(visual?.fields?.kicker || "04")}
							inverse
						>
							{String(visual?.fields?.title || "Welcome")}
						</SectionLabel>
						<p>{String(visual?.fields?.subtitle || "Account Activation")}</p>
						<span>
							{String(
								visual?.fields?.description ||
									"One community / connected responsibly",
							)}
						</span>
					</div>
				</div>
			</CmsSectionBox>
			<div className="auth-panel" style={{ zIndex: 1 }}>
				<Link
					to="/"
					className="auth-back"
					data-testid="activate-back-home-link"
					style={{ color: "var(--c-black)" }}
				>
					<ArrowLeft aria-hidden="true" style={{ color: "var(--c-red)" }} />
					Public website
				</Link>
				<div className="auth-panel__inner">
					<CmsSectionBox type="auth_intro" onSelect={onSelectSection}>
						<header>
							<span className="auth-kicker">
								{String(intro?.fields?.title || pageCopy.activate.eyebrow)}
							</span>
							<h1 id="activate-title" className="t-page-title text-foreground">
								{String(intro?.fields?.body || pageCopy.activate.title)
									.split("\n")
									.map((line: string, i: number) => (
										<span key={i}>
											{line}
											<br />
										</span>
									))}
							</h1>
							<p className="auth-lead" data-testid="activate-support-copy">
								{String(
									intro?.fields?.callToAction || pageCopy.activate.support,
								)}
							</p>
						</header>
					</CmsSectionBox>

					<CmsSectionBox type="auth_form" onSelect={onSelectSection}>
						<form onSubmit={submit} className="auth-form" noValidate>
							<h2 className="t-label mt-8 mb-4 border-b pb-2 text-foreground">
								{String(formBlock?.fields?.title || "Security verification")}
							</h2>

							{error && (
								<div
									role="alert"
									className="mb-4 flex items-start gap-2 text-sm font-medium text-red-600"
								>
									<AlertCircle
										className="mt-0.5 h-4 w-4 shrink-0"
										aria-hidden="true"
									/>
									<p>{error}</p>
								</div>
							)}

							<div className="auth-field">
								<Label htmlFor="token" className="sr-only">
									Code
								</Label>
								<Input
									id="token"
									type="text"
									placeholder="EXV-894-ABC"
									value={token}
									onChange={(e) => {
										setToken(e.target.value.toUpperCase());
										setError("");
									}}
									autoFocus
									required
								/>
							</div>

							<div className="auth-submits mt-8">
								<Button
									type="submit"
									className="w-full justify-between"
									testId="activate-submit-btn"
								>
									<span>Verify code</span>
									<span aria-hidden="true">→</span>
								</Button>
							</div>
						</form>
					</CmsSectionBox>
				</div>
			</div>
		</section>
	);
}
