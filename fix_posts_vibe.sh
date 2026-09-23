sed -i 's/className="group flex flex-col bg-white border border-n-200 rounded-card overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full"/className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary\/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring\/40"/g' src/routes/_public/posts.tsx

sed -i 's/className="relative aspect-video w-full overflow-hidden bg-n-100"/className="mb-6 h-[200px] w-full shrink-0 overflow-hidden rounded-md border border-border bg-secondary"/g' src/routes/_public/posts.tsx

sed -i 's/className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"/g' src/routes/_public/posts.tsx

sed -i 's/className="p-6 flex flex-col flex-grow"/className="flex flex-col flex-grow"/g' src/routes/_public/posts.tsx

sed -i 's/className="text-sm font-medium text-n-500"/className="t-eyebrow"/g' src/routes/_public/posts.tsx

sed -i 's/className="text-p text-ink whitespace-pre-wrap flex-grow"/className="mt-2 font-display text-[15px] leading-snug text-foreground whitespace-pre-wrap flex-grow"/g' src/routes/_public/posts.tsx

sed -i 's/className="text-n-400 hover:text-accent transition-colors"/className="text-muted-foreground hover:text-foreground transition-colors shrink-0"/g' src/routes/_public/posts.tsx

