const fs = require('fs');

const path = 'src/templates/modern/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert imports
const importBlock = `
import { useQuery } from "@tanstack/react-query";
import { getFacebookPostsServer } from "#/packages/content/server/facebook.ts";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel.jsx";
`;

content = content.replace('import { MonogramAvatar } from "#/templates/modern/components/shared/MonogramAvatar";', 'import { MonogramAvatar } from "#/templates/modern/components/shared/MonogramAvatar";\n' + importBlock);

// Insert FacebookCarousel component definitions at the end
const componentBlock = `

function FacebookCarousel() {
  const { data, status } = useQuery({
    queryKey: ["facebook-posts", "landing"],
    queryFn: () => getFacebookPostsServer({ data: { page: 1, pageSize: 6 } }),
  });

  const posts = data?.data ?? [];

  if (status === "pending") {
    return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-border border-t-ring animate-spin" /></div>;
  }

  if (posts.length === 0) return null;

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {posts.map((post) => (
            <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <a href={post.permalink_url} target="_blank" rel="noreferrer" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                {post.full_picture && (
                  <div className="mb-6 h-[200px] w-full shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                    <img
                      src={post.full_picture}
                      alt="Facebook Post Media"
                      className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-4">
                    <span className="t-eyebrow">
                      {formatDistanceToNow(new Date(post.created_time), { addSuffix: true })}
                    </span>
                    <span className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                      <ExternalLink size={18} />
                    </span>
                  </div>
                  <p className="mt-4 font-display text-[15px] leading-snug text-foreground whitespace-pre-wrap flex-grow line-clamp-3">
                    {post.message}
                  </p>
                </div>
              </a>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-end gap-2 mt-6 mr-2">
          <CarouselPrevious className="static transform-none translate-y-0 h-10 w-10 border-border bg-background hover:bg-secondary text-foreground rounded-full shadow-sm" />
          <CarouselNext className="static transform-none translate-y-0 h-10 w-10 border-border bg-background hover:bg-secondary text-foreground rounded-full shadow-sm" />
        </div>
      </Carousel>
    </div>
  );
}
`;

content = content + componentBlock;

// Insert the section into the return block
const targetStr = `						{/* Faculty */}`;
const insertStr = `						{/* Latest Updates */}
						<div className="mb-32">
							<SectionHeading
								eyebrow="Stay Updated"
								title="Latest Announcements"
								description="News and events from our community timeline."
							/>
							<div className="mt-12">
								<FacebookCarousel />
							</div>
						</div>

`;

content = content.replace(targetStr, insertStr + targetStr);

fs.writeFileSync(path, content);
