import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/prisma";
import type { Subject } from "#/types/index";

export const getCoursesServer = createServerFn({ method: "GET" }).handler(async () => {
  return await prisma.course.findMany({ orderBy: { name: "asc" } });
});

export const createCourseServer = createServerFn({ method: "POST" })
  .validator((data: any) => data as any)
  .handler(async ({ data }) => {
    return await prisma.course.create({ data });
  });

export const updateCourseServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: any }) => data)
  .handler(async ({ data: { id, patch } }) => {
    return await prisma.course.update({ where: { id }, data: patch });
  });

export const deleteCourseServer = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async ({ data: id }) => {
    await prisma.course.delete({ where: { id } });
  });


// Albums (Gallery)
export const createAlbumServer = createServerFn({ method: "POST" })
  .validator((data: any) => data as any)
  .handler(async ({ data }) => {
    return await prisma.album.create({ data });
  });

export const updateAlbumServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: any }) => data)
  .handler(async ({ data: { id, patch } }) => {
    return await prisma.album.update({ where: { id }, data: patch });
  });

export const deleteAlbumServer = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async ({ data: id }) => {
    await prisma.album.delete({ where: { id } });
  });

// Staff
export const getStaffServer = createServerFn({ method: "GET" }).handler(async () => {
  return await prisma.staff.findMany({ include: { user: true } });
});

export const createStaffServer = createServerFn({ method: "POST" })
  .validator((data: any) => data as any)
  .handler(async ({ data }) => {
    return await prisma.staff.create({ data });
  });

export const updateStaffServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: any }) => data)
  .handler(async ({ data: { id, patch } }) => {
    return await prisma.staff.update({ where: { id }, data: patch });
  });

export const deleteStaffServer = createServerFn({ method: "POST" })
  .validator((data: string) => data)
  .handler(async ({ data: id }) => {
    await prisma.staff.delete({ where: { id } });
  });
