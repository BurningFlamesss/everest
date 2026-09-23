const fs = require('fs');
let file = fs.readFileSync('src/routes/_public/gallery.tsx', 'utf-8');

file = file.replace(
  `import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";`,
  `import { getWebsitePagePreviewServer, getAlbumsServer } from "#/packages/content/server/content.ts";`
);

file = file.replace(
  `return { previewPage };`,
  `const dbAlbums = await getAlbumsServer();\n      return { previewPage, dbAlbums };`
);

file = file.replace(
  `return { previewPage: null };`,
  `const dbAlbums = await getAlbumsServer();\n    return { previewPage: null, dbAlbums };`
);

file = file.replace(
  `const { previewPage } = Route.useLoaderData();`,
  `const { previewPage, dbAlbums } = Route.useLoaderData();\n  const activeAlbums = dbAlbums?.length > 0 ? dbAlbums : albums;\n`
);

file = file.replace(
  `albums.filter(`,
  `activeAlbums.filter(`
);

file = file.replace(
  `There are {albums.length}`,
  `There are {activeAlbums.length}`
);

fs.writeFileSync('src/routes/_public/gallery.tsx', file);
