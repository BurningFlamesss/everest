const fs = require('fs');

let file = fs.readFileSync('src/services/academics.ts', 'utf-8');

file = file.replace(
`export async function listCourses(query: CourseQuery = {}): Promise<Course[]> {`,
`import { getCoursesServer, createCourseServer, updateCourseServer, deleteCourseServer } from "#/packages/content/server/mutations";\n\nexport async function listCourses(query: CourseQuery = {}): Promise<Course[]> {`
);

// Replace listCourses
file = file.replace(
/export async function listCourses.*?return true;\n  \}\);\n\}/s,
`export async function listCourses(query: CourseQuery = {}): Promise<Course[]> {
  const all = (await getCoursesServer()) as Course[];
  const { search = "", department = "all", elective = "all" } = query;
  return all.filter((c) => {
    if (!matches(search, c.name, c.code, c.department)) return false;
    if (department !== "all" && c.department !== department) return false;
    if (elective !== "all" && String(c.isElective) !== elective) return false;
    return true;
  });
}`
);

// Replace createCourse
file = file.replace(
/export async function createCourse.*?return course;\n\}/s,
`export async function createCourse(input: CourseInput, actor: Actor): Promise<Course> {
  const created = (await createCourseServer({ data: {
    ...input, classIds: [], syllabus: []
  } })) as unknown as Course;
  return created;
}`
);

// Replace updateCourse
file = file.replace(
/export async function updateCourse.*?return course;\n\}/s,
`export async function updateCourse(id: string, patch: Partial<Course>, actor: Actor): Promise<Course> {
  const updated = (await updateCourseServer({ data: { id, patch } })) as unknown as Course;
  return updated;
}`
);

fs.writeFileSync('src/services/academics.ts', file);
