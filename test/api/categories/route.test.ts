const { GET, POST } = require('../../../app/api/categories/route');

const { NextRequest } = require('next/server');
const fs = require('fs/promises');
const path = require('path');

describe('API Categories', () => {
  const originalCategoriesPath = path.join(process.cwd(), 'data', 'categories.json');

  beforeAll(async () => {
    // Zorg ervoor dat het testbestand bestaat
    try {
      await fs.access(originalCategoriesPath);
    } catch {
      await fs.writeFile(originalCategoriesPath, JSON.stringify([
        { id: '123', name: 'Sample Category', roles: [{ id: 'r1', name: 'Existing Role', purpose: 'Purpose 1' }] },
        { id: '456', name: 'Another Category', roles: [] },
      ]));
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('POST should return 500 if adding a category fails', async () => {
    // Mock `fs.writeFile` om een fout te simuleren tijdens het schrijven naar `categories.json`
    jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Simulated write error'));

    const newCategory = { name: 'Faulty Category' };
    const request = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCategory),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);

    // Controleer of de fout gelogd is en of de fout correct afgehandeld is
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to add category' });
  });
});
