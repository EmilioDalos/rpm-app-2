import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// File path to the JSON file
const filePath = path.join(process.cwd(), 'data', 'categories.json');

// Voeg dynamische exportinstellingen toe
export const dynamic = "force-static"; // Dwing statische generatie af
export const revalidate = 60; // Optioneel: stel revalidatie in op 60 seconden

// GET method to fetch categories
export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

// POST method to add a category
export async function POST(req: Request) {
  try {
    const newCategory = await req.json();
    const data = await fs.readFile(filePath, 'utf8');
    const categories = JSON.parse(data);
    
    // Add the new category
    categories.push({
      ...newCategory,
      id: Date.now().toString(),
    });

    // Save updated categories back to the file
    await fs.writeFile(filePath, JSON.stringify(categories, null, 2));

    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

// PUT method to update a category
export async function PUT(req: Request) {
  try {
    const updatedCategory = await req.json();
    const data = await fs.readFile(filePath, 'utf8');
    const categories = JSON.parse(data);

    // Find the category and update it
    const index = categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index !== -1) {
      categories[index] = updatedCategory;
      await fs.writeFile(filePath, JSON.stringify(categories, null, 2));
      return NextResponse.json(updatedCategory);
    } else {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE method to delete a category
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const data = await fs.readFile(filePath, 'utf8');
    const categories = JSON.parse(data);

    // Remove the category
    const updatedCategories = categories.filter(cat => cat.id !== id);
    await fs.writeFile(filePath, JSON.stringify(updatedCategories, null, 2));

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}