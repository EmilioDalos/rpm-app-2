const { GET, POST } = require('../../../app/api/categories/route');
const { NextRequest: NextRequestType } = require('next/server');
import mockFs from 'mock-fs';
const fs = require('fs/promises');
const path = require('path');

describe('API Categories', () => {
  const originalCategoriesPath = path.join(process.cwd(), 'data', 'categories.json');

  beforeAll(async () => {
    // Creëer categories.json als het niet bestaat voor testdoeleinden.
    try {
      await fs.access(originalCategoriesPath);
    } catch {
      await fs.writeFile(originalCategoriesPath, JSON.stringify([
        { id: '123', name: 'Sample Category', roles: [] },
        { id: '456', name: 'Another Category', roles: [] },
      ]));
    }
  });

  beforeEach(() => {
    // Mock the filesystem with the categories.json file for testing purposes.
    mockFs({
      'data/categories.json': JSON.stringify([
        { id: '123', name: 'Sample Category', roles: [] },
        { id: '456', name: 'Another Category', roles: [] },
      ]),
    });
  });

  afterEach(() => {
    // Restore the real filesystem after each test.
    mockFs.restore();
  });

  it('GET should return all categories as JSON if no parameter is provided', async () => {
    const request = new NextRequestType('http://localhost:3000/api/categories');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual([
      { id: '123', name: 'Sample Category', roles: [] },
      { id: '456', name: 'Another Category', roles: [] },
    ]);
  });

  it('GET should return a category name by ID as plain text', async () => {
    const request = new NextRequestType('http://localhost:3000/api/categories?id=123');
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe('Sample Category');
  });

  it('GET should return 404 if category by ID is not found', async () => {
    const request = new NextRequestType('http://localhost:3000/api/categories?id=999');
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(404);
    expect(text).toBe('Category not found');
  });

  it('GET should return simplified categories with only id and name', async () => {
    const request = new NextRequestType('http://localhost:3000/api/categories?simplified=true');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      { id: '123', name: 'Sample Category' },
      { id: '456', name: 'Another Category' },
    ]);
  });

  it('POST should add a new category and return it with an ID', async () => {
    const newCategory = { name: 'New Category' };
    const request = new NextRequestType('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCategory),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);
    const createdCategory = await response.json();

    expect(response.status).toBe(200);
    expect(createdCategory).toHaveProperty('id');
    expect(createdCategory.name).toBe(newCategory.name);

    // Check of de nieuwe categorie is toegevoegd aan het bestand
    const updatedCategories = JSON.parse(await fs.readFile(originalCategoriesPath, 'utf8'));
    expect(updatedCategories).toContainEqual(createdCategory);
  });

  it('POST should return 500 if adding a category fails', async () => {
    // Simuleer een fout bij het lezen of schrijven van het bestand door het bestandssysteem leeg te maken
    mockFs({});

    const newCategory = { name: 'Faulty Category' };
    const request = new NextRequestType('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCategory),
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to add category' });
  });
});
