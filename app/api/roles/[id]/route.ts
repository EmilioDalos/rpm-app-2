import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'categories.json');


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
  const id = url.pathname.split('/').pop();

  const updatedRole = await req.json();
  const roles = await readRoles();

  const index = roles.findIndex((role) => role.id === id);
  if (index !== -1) {
    roles[index] = { ...updatedRole, id };
    await writeRoles(roles);
    return NextResponse.json(roles[index]);
  } else {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const roles = await readRoles();
  const updatedRoles = roles.filter((role) => role.id !== id);

  if (updatedRoles.length === roles.length) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  await writeRoles(updatedRoles);
  return NextResponse.json({ message: 'Role deleted' });
}
