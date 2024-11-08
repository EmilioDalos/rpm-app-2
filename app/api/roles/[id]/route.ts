import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'categories.json');

// Helper function to write roles
async function writeRoles(roles: { id: string; [key: string]: any }[]) {
  await fs.writeFile(filePath, JSON.stringify(roles, null, 2));
}

// Helper function to read roles from nested categories
async function readRoles() {
  const data = await fs.readFile(filePath, 'utf8');
  const categories = JSON.parse(data);

  // Flatten all roles from categories
  const roles = categories.flatMap((category) => category.roles || []);
  return roles;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const roles = await readRoles();
  const role = roles.find((role) => role.id === id);

  if (role) {
    return NextResponse.json(role);
  } else {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const roleId = url.pathname.split('/').pop();

  const updatedRole = await req.json();
  
  // Lees alle categorieën in
  const data = await fs.readFile(filePath, 'utf8');
  const categories = JSON.parse(data);

  let roleUpdated = false;

  // Zoek de categorie en rol die overeenkomen met het opgegeven ID
  categories.forEach((category) => {
    const roleIndex = category.roles.findIndex((role) => role.id === roleId);
    if (roleIndex !== -1) {
      // Werk de rol bij
      category.roles[roleIndex] = { ...updatedRole, id: roleId };
      roleUpdated = true;
    }
  });

  if (!roleUpdated) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  // Schrijf de bijgewerkte categorieën terug naar het bestand
  await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
  return NextResponse.json(updatedRole);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const roleId = url.pathname.split('/').pop();

  // Read all categories
  const data = await fs.readFile(filePath, 'utf8');
  const categories = JSON.parse(data);

  let roleDeleted = false;

  // Iterate over each category and remove the role if it exists
  categories.forEach((category) => {
    // Ensure roles are defined and are an array
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
  await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
  return NextResponse.json({ message: 'Role deleted' });
}


