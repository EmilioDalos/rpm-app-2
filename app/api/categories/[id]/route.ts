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

// GET, PUT, and DELETE methods for a single category by ID
export async function GET(req: Request, { params }) {
  const { id } = params;
  const categories = await readCategories();
  const category = categories.find((cat) => cat.id === id);

  if (category) {
    return NextResponse.json(category);
  } else {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }) {
  const { id } = params;
  const updatedCategory = await req.json();
  const categories = await readCategories();

  const index = categories.findIndex((cat) => cat.id === id);
  if (index !== -1) {
    categories[index] = { ...updatedCategory, id };
    await writeCategories(categories);
    return NextResponse.json(categories[index]);
  } else {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }) {
  const { id } = params;
  const categories = await readCategories();

  const updatedCategories = categories.filter((cat) => cat.id !== id);
  if (updatedCategories.length === categories.length) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  await writeCategories(updatedCategories);
  return NextResponse.json({ message: 'Category deleted' });
}
