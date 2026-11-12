import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useSchoolConfig, useWebsitePageContent } from "#/packages/school/hook.tsx";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, FileText, MessageSquare } from "lucide-react";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import {
  PageFrame,
  PageHeader,
  Section,
  SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/admissions")({
  loader: async ({ location }) => {
    const search = location.search as { cms?: string };
    if (String(search.cms) === "1") {
      const previewPage = await getWebsitePagePreviewServer({
        data: { key: "admissions" },
      });
      return { previewPage };
    }
    return { previewPage: null };
  },
  component: AdmissionsPage,
});

interface Step {
  title?: string;
  description?: string;
}

const STEP_ICONS = [MessageSquare, CalendarCheck, FileText];

function AdmissionsPage() {
  const config = useSchoolConfig();
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("admissions");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;

  const onSelectSection = (sectionType: BlockType) => {
    window.parent?.postMessage(
      {
        source: "scms-cms",
        type: "select-section",
        pageKey: "admissions",
        sectionType,
      },
      "*",
    );
  };

  // Hero — banner, lead line and enquiry button.
  const heroSection = {
    ...sectionDefaults("hero"),
    ...getSectionFields(cmsData?.blocks, "hero"),
  };
  // Admissions info — steps, deadline and overview copy.
  const infoSection = {
    ...sectionDefaults("admissions_info"),
    ...getSectionFields(cmsData?.blocks, "admissions_info"),
  };
  // Closing call to action.
  const ctaSection = {
    ...sectionDefaults("cta"),
    ...getSectionFields(cmsData?.blocks, "cta"),
  };

  const heroEyebrow = str(heroSection, "eyebrow") || "Admissions";
  const heroTitle = str(heroSection, "headline") || "A place to begin.";
  const heroLead =
    str(heroSection, "subheadline") ||
    "Admissions are open for the coming academic year. The process is simple, and the school office will guide you at every step.";
  const primaryLabel =
    str(heroSection, "primaryCtaLabel") || "Send an enquiry";
  const primaryHref = str(heroSection, "primaryCtaHref") || "/contact";
  const secondaryLabel = str(heroSection, "secondaryCtaLabel");
  const secondaryHref = str(heroSection, "secondaryCtaHref") || "/courses";

  const infoTitle = str(infoSection, "title") || "How to apply";
  const infoBody = str(infoSection, "body");
  const deadline = str(infoSection, "deadline");
  const rawSteps = Array.isArray(infoSection.steps) ? infoSection.steps : [];
  const steps: Array<{ title: string; description: string }> = rawSteps
    .filter(
      (step): step is Step =>
        typeof step === "object" && step !== null && !!(step as Step).title,
    )
    .map((step, index) => ({
      title: String(step.title ?? `Step ${index + 1}`),
      description: String(step.description ?? ""),
    }));
  const fallbackSteps = [
    {
      title: "1. Start an enquiry",
      description:
        "Send the contact form with your child's current grade and the year you are applying for.",
    },
    {
      title: "2. Visit the campus",
      description:
        "The office arranges a tour and a short conversation with the year coordinator.",
    },
    {
      title: "3. Submit documents",
      description:
        "Bring the previous report card, transfer certificate, birth certificate and photographs.",
    },
  ];
  const shownSteps = steps.length > 0 ? steps : fallbackSteps;

  const ctaTitle = str(ctaSection, "title") || "Questions before you apply?";
  const ctaBody =
    str(ctaSection, "body") ||
    `Call the office on ${config.contact.phone} or email ${config.contact.email}. We reply within one working day.`;
  const ctaLabel = str(ctaSection, "buttonLabel") || "Contact the office";
  const ctaHref = str(ctaSection, "buttonHref") || "/contact";

  return (
    <PageFrame>
      <CmsSectionBox
        preview={preview}
        sectionType="hero"
        onSelect={onSelectSection}
        testId="cms-section-hit-admissions-hero"
      >
        <PageHeader
          eyebrow={heroEyebrow}
          title={heroTitle}
          lead={heroLead}
          actions={
            <span className="flex flex-wrap items-center gap-3">
              <Link
                to={primaryHref as "/contact"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              {secondaryLabel ? (
                <Link
                  to={secondaryHref as "/courses"}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary/60"
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </span>
          }
        />
      </CmsSectionBox>

      <Section>
        <CmsSectionBox
          preview={preview}
          sectionType="admissions_info"
          onSelect={onSelectSection}
          testId="cms-section-hit-admissions-info"
        >
          <SectionHeading
            eyebrow="Admissions"
            title={infoTitle}
            description={infoBody || undefined}
            aside={
              deadline ? (
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Deadline: {deadline}
                </span>
              ) : undefined
            }
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {shownSteps.map((step, index) => {
              const Icon = STEP_ICONS[index % STEP_ICONS.length];
              return (
                <article
                  key={step.title}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </CmsSectionBox>
      </Section>

      <Section className="mb-20">
        <CmsSectionBox
          preview={preview}
          sectionType="cta"
          onSelect={onSelectSection}
          testId="cms-section-hit-admissions-cta"
        >
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {ctaTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{ctaBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={ctaHref as "/contact"}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {ctaLabel}
              </Link>
              <Link
                to="/gallery"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                See the campus
              </Link>
            </div>
          </div>
        </CmsSectionBox>
      </Section>
    </PageFrame>
  );
}
