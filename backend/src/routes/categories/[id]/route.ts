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

// GET /api/categories/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/categories/[id] - ID:', params.id);
    const categories = await readCategories();
    const category = categories.find((cat: any) => cat.id === params.id);

    if (!category) {
      console.log('Category not found with ID:', params.id);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in GET /api/categories/[id]:', error);
    return NextResponse.json({ error: 'Failed to get category' }, { status: 500 });
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/categories/[id] - ID:', params.id);
    const categories = await readCategories();
    const updatedCategory = await request.json();
    
    const index = categories.findIndex((cat: any) => cat.id === params.id);
    if (index === -1) {
      console.log('Category not found with ID:', params.id);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    categories[index] = {
      ...updatedCategory,
      id: params.id,
      updatedAt: new Date().toISOString()
    };

    await writeCategories(categories);
    return NextResponse.json(categories[index]);
  } catch (error) {
    console.error('Error in PUT /api/categories/[id]:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE /api/categories/[id] - ID:', params.id);
    const categories = await readCategories();
    const filteredCategories = categories.filter((cat: any) => cat.id !== params.id);

    if (categories.length === filteredCategories.length) {
      console.log('Category not found with ID:', params.id);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await writeCategories(filteredCategories);
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}



