const fs = require('fs');
const file = 'src/mock/seed.ts';
let code = fs.readFileSync(file, 'utf8');

const keysAndPaths = {
  home: '/',
  about: '/about',
  courses: '/courses',
  facilities: '/facilities',
  gallery: '/gallery',
  calendar: '/calendar',
  contact: '/contact',
  resources: '/resources',
  result: '/result',
  transportation: '/transportation',
  notices: '/notices',
  scholarship: '/scholarship',
  faculty: '/faculty',
  login: '/login',
  activate: '/_onboard/activate'
};

code = code.replace(/key: "homepage"/, 'key: "home"');

const additions = [];
let i = 0;
for (const [key, path] of Object.entries(keysAndPaths)) {
  if (['home', 'about', 'contact'].includes(key)) continue;
  additions.push(`
    {
      id: "wp_sys_${i++}",
      key: "${key}",
      title: "${key.charAt(0).toUpperCase() + key.slice(1)}",
      path: "${path}",
      status: "published",
      hasUnpublishedChanges: false,
      updatedAt: iso(1),
      publishedAt: iso(1),
      updatedBy: "System",
      seo: {
        title: "${key.charAt(0).toUpperCase() + key.slice(1)}",
        description: "",
        keywords: "",
      },
      blocks: [],
    }`);
}

const parts = code.split('const websitePages: WebsitePage[] = [');
if (parts.length === 2) {
  const arrayEnd = parts[1].indexOf('  ];\n');
  if (arrayEnd !== -1) {
    const newEnd = parts[1].substring(0, arrayEnd) + ',' + additions.join(',') + parts[1].substring(arrayEnd);
    fs.writeFileSync(file, parts[0] + 'const websitePages: WebsitePage[] = [' + newEnd);
    console.log('patched seed.ts');
  } else {
    console.log('could not find end of array');
  }
} else {
  console.log('could not find array start'); 
}
