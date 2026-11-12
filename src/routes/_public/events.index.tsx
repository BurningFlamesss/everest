import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { getEventsFn } from "#/packages/content/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";
import {
  PageFrame,
  PageHeader,
  Section,
} from "#/templates/modern/components/chrome/PageFrame";
import type { BlockType } from "#/types";

type EventRow = Awaited<ReturnType<typeof getEventsFn>>[number];

export const Route = createFileRoute("/_public/events/")({
  head: () =>
    pageMeta({
      title: "Events",
      description:
        "Programmes, examinations, sports and celebrations on the school calendar.",
    }),
  loader: async ({ location }) => {
    const search = location.search as { cms?: string };
    const [events, previewPage] = await Promise.all([
      getEventsFn({ data: { limit: 100 } }),
      String(search.cms) === "1"
        ? getWebsitePagePreviewServer({ data: { key: "events" } })
        : Promise.resolve(null),
    ]);
    return { events, previewPage };
  },
  component: EventsPage,
});

function EventsPage() {
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { events, previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("events");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;

  const headerSection = {
    ...sectionDefaults("headline"),
    ...getSectionFields(cmsData?.blocks, "headline"),
  };

  const onSelectSection = (sectionType: BlockType) => {
    window.parent?.postMessage(
      {
        source: "scms-cms",
        type: "select-section",
        pageKey: "events",
        sectionType,
      },
      "*",
    );
  };

  return (
    <PageFrame>
      <CmsSectionBox
        preview={preview}
        sectionType="headline"
        onSelect={onSelectSection}
        testId="cms-section-hit-events-headline"
      >
        <PageHeader
          eyebrow={str(headerSection, "eyebrow") || "School calendar"}
          title={str(headerSection, "title") || "Events"}
          lead={
            str(headerSection, "body") ||
            "Programmes, examinations, sports and celebrations happening at the school."
          }
        />
      </CmsSectionBox>

      <Section className="mb-20">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">
              No upcoming events have been published yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event: EventRow) => (
              <Link
                key={event.id}
                to="/events/$slug"
                params={{ slug: event.slug }}
                className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                {event.coverImage ? (
                  <img
                    src={event.coverImage}
                    alt=""
                    className="mb-5 h-44 w-full rounded-xl object-cover"
                  />
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-primary/10 px-4 py-3 text-center">
                    <p className="text-xs font-semibold uppercase text-primary">
                      {new Date(event.startsAt).toLocaleDateString(undefined, {
                        month: "short",
                      })}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {new Date(event.startsAt).getDate()}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    {new Date(event.startsAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground group-hover:text-primary">
                  {event.title}
                </h2>
                {event.location ? (
                  <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {event.location}
                  </p>
                ) : null}
                {event.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  View event <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </PageFrame>
  );
}
