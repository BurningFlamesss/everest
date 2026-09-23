const fs = require('fs');
let file = fs.readFileSync('src/services/communications.ts', 'utf-8');

file = file.replace(
`export async function listAlbums`,
`import { getAlbumsServer } from "#/packages/content/server/content";
import { createAlbumServer, updateAlbumServer, deleteAlbumServer } from "#/packages/content/server/mutations";

export async function listAlbums`
);

file = file.replace(
/export async function listAlbums.*?db\(\).albums.filter.*?;\n\}/s,
`export async function listAlbums(search = ""): Promise<Album[]> {
  const all = (await getAlbumsServer()) as unknown as Album[];
  return all.filter((a) => matches(search, a.title, a.description));
}`
);

file = file.replace(
/export async function getAlbum\(id: string\): Promise<Album \| null> \{.*?\n\}/s,
`export async function getAlbum(id: string): Promise<Album | null> {
  const all = await getAlbumsServer();
  return (all.find((a) => a.id === id) as unknown as Album) ?? null;
}`
);

file = file.replace(
/export async function createAlbum.*?return album;\n\}/s,
`export async function createAlbum(input: AlbumInput, actor: Actor): Promise<Album> {
  return (await createAlbumServer({ data: {
    title: input.title,
    description: input.description,
    visibility: input.visibility,
    eventId: input.eventId,
    images: [],
  } })) as unknown as Album;
}`
);

file = file.replace(
/export async function updateAlbum.*?return album;\n\}/s,
`export async function updateAlbum(id: string, patch: Partial<Album>, actor: Actor): Promise<Album> {
  return (await updateAlbumServer({ data: { id, patch } })) as unknown as Album;
}`
);

file = file.replace(
/export async function deleteAlbum.*?\}\);\n\}/s,
`export async function deleteAlbum(id: string, actor: Actor): Promise<void> {
  await deleteAlbumServer({ data: id });
}`
);

fs.writeFileSync('src/services/communications.ts', file);
