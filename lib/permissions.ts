import { prisma } from "./prisma";

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, isActive: true },
  });
  return (user?.isAdmin && user?.isActive) || false;
}

export async function canAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  if (await isAdmin(userId)) return true;

  const assignment = await prisma.projectAssignment.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  return !!assignment;
}

export async function canAccessCategory(
  userId: string,
  categoryId: string
): Promise<boolean> {
  if (await isAdmin(userId)) return true;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { projectId: true },
  });

  if (!category?.projectId) return false;

  const assignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: { projectId: category.projectId, userId },
    },
    include: {
      categoryPermissions: {
        where: { categoryId },
      },
    },
  });

  if (!assignment) return false;

  switch (assignment.categoryAccessMode) {
    case "all":
      return true;
    case "selected":
      return assignment.categoryPermissions.some((p) => p.canAccess);
    case "all_except":
      return !assignment.categoryPermissions.some((p) => !p.canAccess);
    default:
      return false;
  }
}

export async function canAccessTask(
  userId: string,
  taskId: string
): Promise<boolean> {
  if (await isAdmin(userId)) return true;

  const taskAssignment = await prisma.taskAssignment.findUnique({
    where: { taskId_userId: { taskId, userId } },
  });

  if (taskAssignment) return true;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { categoryId: true },
  });

  if (!task) return false;

  return canAccessCategory(userId, task.categoryId);
}

export async function getAssignedProjects(userId: string) {
  if (await isAdmin(userId)) {
    return prisma.project.findMany({
      include: { categories: true },
      orderBy: { order: "asc" },
    });
  }

  const assignments = await prisma.projectAssignment.findMany({
    where: { userId },
    include: {
      project: {
        include: { categories: true },
      },
    },
  });

  return assignments.map((a) => a.project);
}

export async function getAccessibleCategories(
  userId: string,
  projectId: string
) {
  if (await isAdmin(userId)) {
    return prisma.category.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });
  }

  const assignment = await prisma.projectAssignment.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: {
      categoryPermissions: true,
      project: {
        include: { categories: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!assignment) return [];

  const allCategories = assignment.project.categories;

  switch (assignment.categoryAccessMode) {
    case "all":
      return allCategories;
    case "selected": {
      const allowedIds = new Set(
        assignment.categoryPermissions
          .filter((p) => p.canAccess)
          .map((p) => p.categoryId)
      );
      return allCategories.filter((c) => allowedIds.has(c.id));
    }
    case "all_except": {
      const excludedIds = new Set(
        assignment.categoryPermissions
          .filter((p) => !p.canAccess)
          .map((p) => p.categoryId)
      );
      return allCategories.filter((c) => !excludedIds.has(c.id));
    }
    default:
      return [];
  }
}

export async function getAccessibleTasks(userId: string) {
  if (await isAdmin(userId)) {
    return prisma.task.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Get all accessible category IDs
  const assignments = await prisma.projectAssignment.findMany({
    where: { userId },
    include: {
      categoryPermissions: true,
      project: {
        include: { categories: true },
      },
    },
  });

  const accessibleCategoryIds = new Set<string>();

  for (const assignment of assignments) {
    const allCategories = assignment.project.categories;

    switch (assignment.categoryAccessMode) {
      case "all":
        allCategories.forEach((c) => accessibleCategoryIds.add(c.id));
        break;
      case "selected": {
        const allowedIds = new Set(
          assignment.categoryPermissions
            .filter((p) => p.canAccess)
            .map((p) => p.categoryId)
        );
        allCategories
          .filter((c) => allowedIds.has(c.id))
          .forEach((c) => accessibleCategoryIds.add(c.id));
        break;
      }
      case "all_except": {
        const excludedIds = new Set(
          assignment.categoryPermissions
            .filter((p) => !p.canAccess)
            .map((p) => p.categoryId)
        );
        allCategories
          .filter((c) => !excludedIds.has(c.id))
          .forEach((c) => accessibleCategoryIds.add(c.id));
        break;
      }
    }
  }

  // Get directly assigned task IDs
  const directAssignments = await prisma.taskAssignment.findMany({
    where: { userId },
    select: { taskId: true },
  });
  const directTaskIds = directAssignments.map((a) => a.taskId);

  return prisma.task.findMany({
    where: {
      OR: [
        { categoryId: { in: Array.from(accessibleCategoryIds) } },
        ...(directTaskIds.length > 0
          ? [{ id: { in: directTaskIds } }]
          : []),
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAccessibleAllCategories(userId: string) {
  if (await isAdmin(userId)) {
    return prisma.category.findMany({
      orderBy: { order: "asc" },
    });
  }

  const assignments = await prisma.projectAssignment.findMany({
    where: { userId },
    include: {
      categoryPermissions: true,
      project: {
        include: { categories: { orderBy: { order: "asc" } } },
      },
    },
  });

  const categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    projectId: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const seen = new Set<string>();

  for (const assignment of assignments) {
    const allCategories = assignment.project.categories;

    let accessible: typeof allCategories;
    switch (assignment.categoryAccessMode) {
      case "all":
        accessible = allCategories;
        break;
      case "selected": {
        const allowedIds = new Set(
          assignment.categoryPermissions
            .filter((p) => p.canAccess)
            .map((p) => p.categoryId)
        );
        accessible = allCategories.filter((c) => allowedIds.has(c.id));
        break;
      }
      case "all_except": {
        const excludedIds = new Set(
          assignment.categoryPermissions
            .filter((p) => !p.canAccess)
            .map((p) => p.categoryId)
        );
        accessible = allCategories.filter((c) => !excludedIds.has(c.id));
        break;
      }
      default:
        accessible = [];
    }

    for (const cat of accessible) {
      if (!seen.has(cat.id)) {
        seen.add(cat.id);
        categories.push(cat);
      }
    }
  }

  return categories;
}

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  entityName?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      entityName,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    },
  });
}
