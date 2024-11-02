import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'categories.json');

// Helper function to read categories
async function readCategories() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write categories
async function writeCategories(categories) {
  await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
}

// GET: Fetch all roles or roles within a specific category
export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get('categoryId');

  try {
    const categories = await readCategories();

    // If a categoryId is provided, fetch roles for that category
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json(category.roles || []);
    }

    // Otherwise, fetch all roles across categories
    const allRoles = categories.flatMap(cat => cat.roles || []);
    return NextResponse.json(allRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}


// POST: Add a new role to a specific category
export async function POST(req: Request) {
  try {
    const { categoryId, role } = await req.json();
    const categories = await readCategories();

    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Assign a unique ID to the new role
    const newRole = { ...role, id: Date.now().toString() };
    category.roles = category.roles ? [...category.roles, newRole] : [newRole];

    await writeCategories(categories);

    return NextResponse.json(newRole);
  } catch (error) {
    console.error('Error adding role:', error);
    return NextResponse.json({ error: 'Failed to add role' }, { status: 500 });
  }
}

// PUT: Update an existing role within a category
export async function PUT(req: Request) {
  try {
    const { categoryId, role } = await req.json();
    const categories = await readCategories();

    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const roleIndex = category.roles.findIndex(r => r.id === role.id);
    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    category.roles[roleIndex] = role;
    await writeCategories(categories);

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

// DELETE: Remove a role from a specific category
export async function DELETE(req: Request) {
  try {
    const { categoryId, roleId } = await req.json();
    const categories = await readCategories();

    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updatedRoles = category.roles.filter(role => role.id !== roleId);
    if (updatedRoles.length === category.roles.length) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    category.roles = updatedRoles;
    await writeCategories(categories);

    return NextResponse.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
