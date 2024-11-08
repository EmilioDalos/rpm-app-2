const { GET, POST, PUT, DELETE } = require('../../../../app/api/roles/[id]/route');
const { NextRequest } = require('next/server');
const mockFs = require('mock-fs');
const path = require('path');
const fs = require('fs/promises');

const filePath = path.join(process.cwd(), 'data', 'categories.json');

const mockCategories = [
  { id: '123', name: 'Sample Category', roles: [] },
  { id: '456', name: 'Another Category', roles: [{ id: '1', name: 'Role 1' }] },
];

describe('API Roles', () => {
  beforeEach(() => {
    // Mock the filesystem with the categories.json file for testing purposes
    mockFs({
      'data/categories.json': JSON.stringify(mockCategories),
    });
  });

  afterEach(() => {
    // Restore the real filesystem after each test
    mockFs.restore();
  });

  it('GET should return a role by ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/roles/1');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ id: '1', name: 'Role 1' });
  });

  it('GET should return 404 if the role is not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/roles/999');
    const response = await GET(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Role not found' });
  });

  it('PUT should update an existing role', async () => {
    const updatedRole = { id: '1', name: 'Updated Role' };
    const request = new NextRequest('http://localhost:3000/api/roles/1', {
      method: 'PUT',
      body: JSON.stringify(updatedRole),
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(updatedRole);
  });

  it('PUT should return 404 if the role is not found', async () => {
    const updatedRole = { id: '999', name: 'Non-existent Role' };
    const request = new NextRequest('http://localhost:3000/api/roles/999', {
      method: 'PUT',
      body: JSON.stringify(updatedRole),
    });
    const response = await PUT(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Role not found' });
  });

  it('DELETE should remove a role from a specific category', async () => {
    const request = new NextRequest('http://localhost:3000/api/roles/1', {
      method: 'DELETE',
    });
    const response = await DELETE(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ message: 'Role deleted' });
  });

  it('DELETE should return 404 if the role is not found', async () => {
    const request = new NextRequest('http://localhost:3000/api/roles/999', {
      method: 'DELETE',
    });
    const response = await DELETE(request);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Role not found' });
  });
});
