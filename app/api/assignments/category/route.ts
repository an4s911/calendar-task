import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getUserIdFromRequest } from "@/lib/api-helpers";
import { logActivity } from "@/lib/permissions";

// GET: Get users assigned to a specific category
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json(
      { error: "categoryId is required" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { projectId: true },
  });

  if (!category?.projectId) {
    return NextResponse.json(
      { error: "Category not found or has no project" },
      { status: 404 },
    );
  }

  // Find all project assignments for this category's project
  const assignments = await prisma.projectAssignment.findMany({
    where: { projectId: category.projectId },
    include: {
      user: { select: { id: true, fullName: true, username: true } },
      categoryPermissions: {
        where: { categoryId },
      },
    },
  });

  // Filter to users who have access to this category
  const assignedUsers = assignments
    .filter((a) => {
      switch (a.categoryAccessMode) {
        case "all":
          return true;
        case "selected":
          return a.categoryPermissions.some((cp) => cp.canAccess);
        case "all_except":
          return !a.categoryPermissions.some((cp) => !cp.canAccess);
        default:
          return false;
      }
    })
    .map((a) => a.user);

  return NextResponse.json(assignedUsers);
}

// POST: Assign a user to a category
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const body = await request.json();

  if (!body.categoryId || !body.userId) {
    return NextResponse.json(
      { error: "categoryId and userId are required" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: body.categoryId },
    select: { projectId: true, name: true },
  });

  if (!category?.projectId) {
    return NextResponse.json(
      { error: "Category not found or has no project" },
      { status: 404 },
    );
  }

  // Find or create project assignment
  let assignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: {
        projectId: category.projectId,
        userId: body.userId,
      },
    },
  });

  if (!assignment) {
    // Create project assignment with "selected" mode
    assignment = await prisma.projectAssignment.create({
      data: {
        projectId: category.projectId,
        userId: body.userId,
        categoryAccessMode: "selected",
      },
    });
  }

  if (assignment.categoryAccessMode === "selected") {
    // Add category permission
    await prisma.categoryPermission.upsert({
      where: {
        projectAssignmentId_categoryId: {
          projectAssignmentId: assignment.id,
          categoryId: body.categoryId,
        },
      },
      update: { canAccess: true },
      create: {
        projectAssignmentId: assignment.id,
        categoryId: body.categoryId,
        canAccess: true,
      },
    });
  }
  // If mode is "all", user already has access — nothing to do
  // If mode is "all_except", remove the exclusion
  if (assignment.categoryAccessMode === "all_except") {
    await prisma.categoryPermission.deleteMany({
      where: {
        projectAssignmentId: assignment.id,
        categoryId: body.categoryId,
        canAccess: false,
      },
    });
  }

  await logActivity(
    currentUserId,
    "assigned",
    "category",
    body.categoryId,
    category.name,
    { assignedUserId: body.userId },
  );

  return NextResponse.json({ success: true }, { status: 201 });
}

// DELETE: Unassign a user from a category
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const currentUserId = getUserIdFromRequest(request)!;
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const userId = searchParams.get("userId");

  if (!categoryId || !userId) {
    return NextResponse.json(
      { error: "categoryId and userId are required" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { projectId: true, name: true },
  });

  if (!category?.projectId) {
    return NextResponse.json(
      { error: "Category not found or has no project" },
      { status: 404 },
    );
  }

  const assignment = await prisma.projectAssignment.findUnique({
    where: {
      projectId_userId: {
        projectId: category.projectId,
        userId,
      },
    },
  });

  if (!assignment) {
    return NextResponse.json({ success: true });
  }

  if (assignment.categoryAccessMode === "all") {
    // Switch to "all_except" and exclude this category
    await prisma.projectAssignment.update({
      where: { id: assignment.id },
      data: { categoryAccessMode: "all_except" },
    });
    await prisma.categoryPermission.create({
      data: {
        projectAssignmentId: assignment.id,
        categoryId,
        canAccess: false,
      },
    });
  } else if (assignment.categoryAccessMode === "selected") {
    // Remove the permission
    await prisma.categoryPermission.deleteMany({
      where: {
        projectAssignmentId: assignment.id,
        categoryId,
        canAccess: true,
      },
    });
  }
  // "all_except" — add exclusion
  if (assignment.categoryAccessMode === "all_except") {
    await prisma.categoryPermission.upsert({
      where: {
        projectAssignmentId_categoryId: {
          projectAssignmentId: assignment.id,
          categoryId,
        },
      },
      update: { canAccess: false },
      create: {
        projectAssignmentId: assignment.id,
        categoryId,
        canAccess: false,
      },
    });
  }

  await logActivity(
    currentUserId,
    "unassigned",
    "category",
    categoryId,
    category.name,
    { unassignedUserId: userId },
  );

  return NextResponse.json({ success: true });
}
