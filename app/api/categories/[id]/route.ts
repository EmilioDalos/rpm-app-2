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
async function writeCategories(categories: { id: string; [key: string]: any }[]) {
  await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  console.log(`Parsed ID from URL: ${id}`); // DEBUG LOG

  const categories = await readCategories();
  const category = categories.find((cat: { id: string; [key: string]: any }) => cat.id === id);

  if (category) {
    return NextResponse.json(category);
  } else {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  
  console.log("PUT /api/categories/[id] - ID from URL:", id);
  console.log("PUT /api/categories/[id] - Request URL:", req.url);

  try {
    const updatedCategory = await req.json();
    console.log("PUT /api/categories/[id] - Received category data:", updatedCategory);
    console.log("PUT /api/categories/[id] - Category ID in data:", updatedCategory.id);
    
    const categories = await readCategories();
    console.log("PUT /api/categories/[id] - Existing categories:", categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));

    const index = categories.findIndex((cat: { id: string; [key: string]: any }) => cat.id === id);
    console.log("PUT /api/categories/[id] - Found category at index:", index);
    
    if (index !== -1) {
      console.log("PUT /api/categories/[id] - Updating category with ID:", id);
      categories[index] = { ...updatedCategory, id };
      await writeCategories(categories);
      return NextResponse.json(categories[index]);
    } else {
      console.log("PUT /api/categories/[id] - Category not found with ID:", id);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("PUT /api/categories/[id] - Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const categories = await readCategories();
  const updatedCategories = categories.filter((cat: { id: string; [key: string]: any }) => cat.id !== id);

  if (updatedCategories.length === categories.length) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  await writeCategories(updatedCategories);
  return NextResponse.json({ message: 'Category deleted' });
}



