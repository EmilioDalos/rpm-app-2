import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Correct path to the data file
const filePath = path.join(process.cwd(), 'src', 'data', 'categories.json');

// Helper function to read categories
async function readCategories() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

// Helper function to write categories
async function writeCategories(categories: any[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing categories:', error);
    return false;
  }
}

export const dynamic = "force-static";
export const revalidate = 60;

// GET all categories
export async function GET() {
  try {
    const categories = await readCategories();
    console.log('Categories loaded:', categories); // Debug log
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

// POST a new category
export async function POST(req: Request) {
  try {
    const newCategory = await req.json();
    const categories = await readCategories();

    // Add the new category with an ID
    const categoryWithId = {
      ...newCategory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    categories.push(categoryWithId);
    await writeCategories(categories);

    return NextResponse.json(categoryWithId, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

