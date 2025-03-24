const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to RPM blocks JSON file
const rpmBlocksFilePath = path.join(__dirname, '../data/rpmblocks.json');

// Helper function to read RPM blocks
const readRPMBlocks = () => {
  try {
    const data = fs.readFileSync(rpmBlocksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading RPM blocks file:', error);
    return [];
  }
};

// Helper function to write RPM blocks
const writeRPMBlocks = (blocks) => {
  try {
    fs.writeFileSync(rpmBlocksFilePath, JSON.stringify(blocks, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing RPM blocks file:', error);
    return false;
  }
};

// Get all RPM blocks
exports.getAllRPMBlocks = (req, res) => {
  const blocks = readRPMBlocks();
  res.json(blocks);
};

// Get a single RPM block by ID
exports.getRPMBlockById = (req, res) => {
  const { id } = req.params;
  const blocks = readRPMBlocks();
  const block = blocks.find(block => block.id === id);
  
  if (!block) {
    return res.status(404).json({ error: 'RPM block not found' });
  }
  
  res.json(block);
};

// Create a new RPM block
exports.createRPMBlock = (req, res) => {
  const blocks = readRPMBlocks();
  const newBlock = {
    ...req.body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  blocks.push(newBlock);
  
  if (writeRPMBlocks(blocks)) {
    res.status(201).json(newBlock);
  } else {
    res.status(500).json({ error: 'Failed to create RPM block' });
  }
};

// Update an RPM block
exports.updateRPMBlock = (req, res) => {
  const { id } = req.params;
  const blocks = readRPMBlocks();
  const index = blocks.findIndex(block => block.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'RPM block not found' });
  }
  
  const updatedBlock = {
    ...blocks[index],
    ...req.body,
    id, // Ensure ID doesn't change
    updatedAt: new Date().toISOString()
  };
  
  blocks[index] = updatedBlock;
  
  if (writeRPMBlocks(blocks)) {
    res.json(updatedBlock);
  } else {
    res.status(500).json({ error: 'Failed to update RPM block' });
  }
};

// Delete an RPM block
exports.deleteRPMBlock = (req, res) => {
  const { id } = req.params;
  const blocks = readRPMBlocks();
  const filteredBlocks = blocks.filter(block => block.id !== id);
  
  if (filteredBlocks.length === blocks.length) {
    return res.status(404).json({ error: 'RPM block not found' });
  }
  
  if (writeRPMBlocks(filteredBlocks)) {
    res.json({ message: 'RPM block deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete RPM block' });
  }
}; 