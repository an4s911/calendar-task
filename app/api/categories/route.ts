import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest, requireAdmin } from "@/lib/api-helpers";
import { getAccessibleAllCategories, logActivity } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await getAccessibleAllCategories(userId);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck;

  const userId = getUserIdFromRequest(request)!;

  try {
    const body = await request.json();

    const category = await prisma.category.create({
      data: {
        name: body.name,
        color: body.color,
        projectId: body.projectId,
        order: body.order || 0,
      },
    });

    await logActivity(
      userId,
      "created",
      "category",
      category.id,
      category.name,
    );

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
