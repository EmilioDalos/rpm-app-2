import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'rpmBlocks.json');

// Helper function to read rpmBlocks
async function readRpmBlocks() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Controleer of het een array is, zo niet, haal de array uit het object
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.rpmBlocks && Array.isArray(parsed.rpmBlocks)) {
      return parsed.rpmBlocks;
    } else {
      console.error('Unexpected data structure in rpmBlocks.json:', parsed);
      return []; // Return empty array as fallback
    }
  } catch (error) {
    console.error('Error reading rpmBlocks:', error);
    return []; // Return empty array on error
  }
}

// Helper function to write rpmBlocks
async function writeRpmBlocks(rpmBlocks: { id: string; [key: string]: any }[]) {
  await fs.writeFile(filePath, JSON.stringify(rpmBlocks, null, 2));
}

// GET rpmBlock by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  console.log(`Parsed ID from URL: ${id}`); // DEBUG LOG

  const rpmBlocks = await readRpmBlocks();
  const rpmBlock = rpmBlocks.find((block: { id: string; [key: string]: any }) => block.id === id);

  if (rpmBlock) {
    return NextResponse.json(rpmBlock);
  } else {
    return NextResponse.json({ error: 'RPM Block not found' }, { status: 404 });
  }
}

// Update rpmBlock by ID
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const updatedRpmBlock = await req.json();
  const rpmBlocks = await readRpmBlocks();

  const index = rpmBlocks.findIndex((block: { id: string; [key: string]: any }) => block.id === id);
  if (index !== -1) {
    rpmBlocks[index] = { ...updatedRpmBlock, id };
    await writeRpmBlocks(rpmBlocks);
    return NextResponse.json(rpmBlocks[index]);
  } else {
    return NextResponse.json({ error: 'RPM Block not found' }, { status: 404 });
  }
}

// Delete rpmBlock by ID
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const rpmBlocks = await readRpmBlocks();
  const updatedRpmBlocks = rpmBlocks.filter((block: { id: string; [key: string]: any }) => block.id !== id);

  if (updatedRpmBlocks.length === rpmBlocks.length) {
    return NextResponse.json({ error: 'RPM Block not found' }, { status: 404 });
  }

  await writeRpmBlocks(updatedRpmBlocks);
  return NextResponse.json({ message: 'RPM Block deleted' });
}
