import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'categories.json');

// Helper function to write categories back to the file
async function writeCategories(categories: { id: string; [key: string]: any }[]) {
  await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
}

// Helper function to read categories from the file
async function readCategories() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// GET: Fetch a specific role by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const roleId = url.pathname.split('/').pop();

  const categories = await readCategories();
  const roles = categories.flatMap((category: { roles?: { id: string }[] }) => category.roles || []);
  const role = roles.find((role: { id: string }) => role.id === roleId);

  if (role) {
    return NextResponse.json(role);
  } else {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }
}

// PUT: Update an existing role within a category
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const roleId = url.pathname.split('/').pop();

  const updatedRole = await req.json();
  const categories = await readCategories();

  let roleUpdated = false;
  let originalCategoryIndex = null;
  let roleToMove = null;

  // Iterate over categories to find the role and check if it needs to be moved
  categories.forEach((category: { id: string; roles?: { id: string }[] }, categoryIndex: number) => {
    if (category.roles) {
      const roleIndex = category.roles.findIndex((role) => role.id === roleId);
      if (roleIndex !== -1) {
        if (category.id === updatedRole.categoryId) {
          // Update the role if it's in the same category
          category.roles[roleIndex] = { ...updatedRole, id: roleId };
          roleUpdated = true;
        } else {
          // Mark the role for moving if the category ID has changed
          roleToMove = { ...category.roles[roleIndex], ...updatedRole, id: roleId };
          originalCategoryIndex = categoryIndex;
        }
      }
    }
  });

  if (roleToMove && originalCategoryIndex !== null) {
    // Remove the role from the original category
    categories[originalCategoryIndex].roles = categories[originalCategoryIndex].roles.filter(
      (role: { id: string }) => role.id !== roleId
    );

    // Find the target category and add the role there
    const targetCategory = categories.find((category: { id: string; roles: any[] }) => category.id === updatedRole.categoryId);
    if (!targetCategory) {
      return NextResponse.json({ error: 'Target category not found' }, { status: 404 });
    }
    targetCategory.roles.push(roleToMove);
    roleUpdated = true;
  }

  if (!roleUpdated) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  // Write updated categories back to the file
  await writeCategories(categories);
  return NextResponse.json(updatedRole);
}


// DELETE: Remove a role from a specific category
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const roleId = url.pathname.split('/').pop();

  const categories = await readCategories();
  let roleDeleted = false;

  // Iterate over categories to find and delete the role
  categories.forEach((category: { roles?: { id: string }[] }) => {
    if (Array.isArray(category.roles)) {
      const initialLength = category.roles.length;
      category.roles = category.roles.filter((role) => role.id !== roleId);
      if (category.roles.length < initialLength) {
        roleDeleted = true;
      }
    }
  });

  if (!roleDeleted) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  // Write updated categories back to the file
  await writeCategories(categories);
  return NextResponse.json({ message: 'Role deleted' });
}
