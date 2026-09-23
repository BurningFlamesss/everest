const fs = require('fs');
let file = fs.readFileSync('src/services/staff.ts', 'utf-8');

file = file.replace(
`export async function listStaff`,
`import { getStaffServer, createStaffServer, updateStaffServer, deleteStaffServer } from "#/packages/content/server/mutations";

export async function listStaff`
);

file = file.replace(
/export async function listStaff.*?return paginate\(sorted, page, pageSize\);\n\}/s,
`export async function listStaff(query: StaffQuery = {}): Promise<Paginated<StaffMember>> {
  const all = (await getStaffServer()) as unknown as StaffMember[];
  return paginate(all, query.page || 1, query.pageSize || 10);
}`
);

fs.writeFileSync('src/services/staff.ts', file);
