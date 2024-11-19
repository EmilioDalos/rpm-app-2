import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const filePath = path.join(process.cwd(), 'data', 'rpmblocks.json');

// Helper function to read the RPM blocks
async function readRpmBlocks() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write to the RPM blocks
async function writeRpmBlocks(blocks: { id: string; [key: string]: any }[]) {
  await fs.writeFile(filePath, JSON.stringify(blocks, null, 2));
}

// GET: Fetch a specific RPM block or all blocks
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  const blocks = await readRpmBlocks();
 
  return NextResponse.json(blocks);
}

// POST: Create a new RPM block
export async function POST(req: Request) {
  const newBlock = await req.json();
  const blocks = await readRpmBlocks();

  const newBlockWithId = { ...newBlock, id: Date.now().toString() };
  blocks.push(newBlockWithId);

  await writeRpmBlocks(blocks);
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
