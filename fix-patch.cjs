const fs = require('fs');
const path = require('path');

const routes = {
  'index.tsx': 'home',
  'about.tsx': 'about',
  'courses.tsx': 'courses',
  'facilities.tsx': 'facilities',
  'gallery.tsx': 'gallery',
  'calendar.tsx': 'calendar',
  'contact.tsx': 'contact',
  'resources.tsx': 'resources',
  'result.tsx': 'result',
  'transportation.tsx': 'transportation',
  'notices.tsx': 'notices',
  'scholarship.tsx': 'scholarship'
};

for (const file of Object.keys(routes)) {
  const p = path.join(__dirname, 'src', 'routes', '_public', file);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/data:\s*"([^"]+)"/, 'data: { key: "$1" }');
  fs.writeFileSync(p, content);
}
