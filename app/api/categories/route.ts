import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'categories.json');

export const dynamic = "force-static";
export const revalidate = 60;

// GET all categories
export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

// POST a new category
export async function POST(req: Request) {
  try {
    const newCategory = await req.json();
    const data = await fs.readFile(filePath, 'utf8');
    const categories = JSON.parse(data);

    // Add the new category with an ID
    const categoryWithId = { ...newCategory, id: Date.now().toString() };
    categories.push(categoryWithId);

    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));

    return NextResponse.json(categoryWithId);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

// POST a new category
export async function POST(req: Request) {
  try {
    const newCategory = await req.json();
    const data = await fs.readFile(filePath, 'utf8');
    const categories = JSON.parse(data);

    // Add the new category with an ID
    const categoryWithId = { ...newCategory, id: Date.now().toString() };
    categories.push(categoryWithId);

    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));

    return NextResponse.json(categoryWithId);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
