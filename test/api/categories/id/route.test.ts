const { GET, PUT, DELETE} = require('../../../../app/api/categories/[id]/route');
const { NextRequest } = require('next/server');
const mockFs = require('mock-fs');
const fs = require('fs/promises');
const path = require('path');

describe('API Categories', () => {
  const originalCategoriesPath = path.join(process.cwd(), 'data', 'categories.x.json');
  const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');

  beforeAll(async () => {
    // Creëer categories.json als het niet bestaat voor testdoeleinden.
    try {
      await fs.access(originalCategoriesPath);
    } catch {
      await fs.writeFile(originalCategoriesPath, JSON.stringify([
        { id: '123', name: 'Sample Category', roles: [{ id: 'r1', name: 'Existing Role', purpose: 'Purpose 1' }] },
        { id: '456', name: 'Another Category', roles: [] },
      ]));0
    }
  });

  beforeEach(() => {
    // Mock the filesystem with the categories.json file for testing purposes.
    mockFs({
      'data/categories.json': JSON.stringify([
        {"id": "123", "name": "Sample Category", "roles": []},
       
      ]),
    });
  });

  afterEach(() => {
    // Restore the real filesystem after each test.
    mockFs.restore();
  });


  it('GET should return a category by ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/categories/123');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ id: '123', name: 'Sample Category', roles: [] });
  });

  it('GET should return 404 if the category is not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/categories/909');
    const response = await GET(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Category not found' });
  });

  it('PUT should update an existing category', async () => {
    const updatedCategory = { name: 'Updated Category', roles: ['newRole'] };
    const request = new NextRequest('http://localhost:3000/api/categories/123', {
      method: 'PUT',
      body: JSON.stringify(updatedCategory),
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ id: '123', ...updatedCategory });
  });

  it('PUT should return 404 if the category is not found', async () => {
    const updatedCategory = { name: 'Non-existent Category', roles: [] };
    const request = new NextRequest('http://localhost:3000/api/categories/999', {
      method: 'PUT',
      body: JSON.stringify(updatedCategory),
    });
    const response = await PUT(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Category not found' });
  });

  it('DELETE should remove a category', async () => {
    const request = new NextRequest('http://localhost:3000/api/categories/123', {
      method: 'DELETE',
    });
    const response = await DELETE(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ message: 'Category deleted' });
  });

  it('DELETE should return 404 if the category is not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/categories/999', {
      method: 'DELETE',
    });
    const response = await DELETE(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Category not found' });
  });

  it('should keep existing roles when adding or updating roles in a category', async () => {
    // Nieuwe of bijgewerkte data met een extra rol
    const updatedCategory = {
      id: '123',
      name: 'Updated Test Category',
      roles: [
        { id: 'r1', name: 'Existing Role', purpose: 'Purpose 1' },
        { id: 'r2', name: 'New Role', purpose: 'Purpose 2' }
      ],
    };

    // Voer een PUT-verzoek uit om de categorie bij te werken
    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'PUT',
      body: JSON.stringify(updatedCategory),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);

    // Lees de categorieën na de update en controleer of beide rollen bestaan
    const updatedData = await fs.readFile(categoriesPath, 'utf8');
    const categories: { id: string; name: string; roles: any[] }[] = JSON.parse(updatedData);
    const category = categories.find((cat: { id: string }) => cat.id === '123');

    // Controleer of de categorie is gevonden voordat je de rollen bevestigt
    expect(category).toBeDefined();
    expect(category?.roles).toEqual([
      { id: 'r1', name: 'Existing Role', purpose: 'Purpose 1' },
      { id: 'r2', name: 'New Role', purpose: 'Purpose 2' },
    ]);
  });
});
