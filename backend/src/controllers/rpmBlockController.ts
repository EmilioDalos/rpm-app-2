import { Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const rpmBlocksFilePath = path.join(__dirname, '../data/rpmblocks.json');

interface RPMBlock {
  id: string;
  result: string;
  purposes: string[];
  massiveActions: any[];
  categoryId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  saved: boolean;
}

// Helper function to read RPM blocks
const readRPMBlocks = async (): Promise<RPMBlock[]> => {
  try {
    const data = await fs.readFile(rpmBlocksFilePath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : parsed.rpmBlocks || [];
  } catch (error) {
    console.error('Error reading RPM blocks:', error);
    return [];
  }
};

// Helper function to write RPM blocks
const writeRPMBlocks = async (blocks: RPMBlock[]): Promise<boolean> => {
  try {
    await fs.writeFile(rpmBlocksFilePath, JSON.stringify({ rpmBlocks: blocks }, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing RPM blocks:', error);
    return false;
  }
};

export const getAllRPMBlocks = async (req: Request, res: Response) => {
  try {
    const blocks = await readRPMBlocks();
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RPM blocks' });
  }
};

export const getRPMBlockById = async (req: Request, res: Response) => {
  try {
    const blocks = await readRPMBlocks();
    const block = blocks.find(b => b.id === req.params.id);
    
    if (!block) {
      return res.status(404).json({ error: 'RPM block not found' });
    }
    
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RPM block' });
  }
};

export const createRPMBlock = async (req: Request, res: Response) => {
  try {
    const blocks = await readRPMBlocks();
    const newBlock: RPMBlock = {
      ...req.body,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    blocks.push(newBlock);
    
    if (await writeRPMBlocks(blocks)) {
      res.status(201).json(newBlock);
    } else {
      res.status(500).json({ error: 'Failed to create RPM block' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create RPM block' });
  }
};

export const updateRPMBlock = async (req: Request, res: Response) => {
  try {
    const blocks = await readRPMBlocks();
    const index = blocks.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'RPM block not found' });
    }
    
    const updatedBlock: RPMBlock = {
      ...blocks[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    blocks[index] = updatedBlock;
    
    if (await writeRPMBlocks(blocks)) {
      res.json(updatedBlock);
    } else {
      res.status(500).json({ error: 'Failed to update RPM block' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update RPM block' });
  }
};

export const deleteRPMBlock = async (req: Request, res: Response) => {
  try {
    const blocks = await readRPMBlocks();
    const filteredBlocks = blocks.filter(b => b.id !== req.params.id);
    
    if (filteredBlocks.length === blocks.length) {
      return res.status(404).json({ error: 'RPM block not found' });
    }
    
    if (await writeRPMBlocks(filteredBlocks)) {
      res.json({ message: 'RPM block deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete RPM block' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete RPM block' });
  }
}; 