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

// GET all rpmBlocks
export async function GET() {
  const rpmBlocks = await readRpmBlocks();
  return NextResponse.json(rpmBlocks);
}

// POST a new rpmBlock
export async function POST(req: Request) {
  const newBlock = await req.json();
  const blocks = await readRpmBlocks();
  
  // Ensure blocks is an array
  const blocksArray = Array.isArray(blocks) ? blocks : [];
  
  const newBlockWithId = { ...newBlock, id: Date.now().toString() };
  blocksArray.push(newBlockWithId);

  await writeRpmBlocks(blocksArray);
  return NextResponse.json(newBlockWithId, { status: 201 });
}

// PUT: Update an RPM block
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const updatedBlock = await req.json();
  const blocks = await readRpmBlocks();

  const index = blocks.findIndex((block: { id: string; [key: string]: any }) => block.id === id);
  if (index !== -1) {
    blocks[index] = { ...updatedBlock, id }; // Ensure ID remains unchanged
    await writeRpmBlocks(blocks);
    return NextResponse.json(blocks[index]);
  } else {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 });
  }
}

// DELETE: Remove an RPM block
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const blocks = await readRpmBlocks();
  const updatedBlocks = blocks.filter((block: { id: string; [key: string]: any }) => block.id !== id);

  if (updatedBlocks.length === blocks.length) {
    return NextResponse.json({ error: 'Block not found' }, { status: 404 });
  }

  await writeRpmBlocks(updatedBlocks);
  return NextResponse.json({ message: 'Block deleted' });
}
