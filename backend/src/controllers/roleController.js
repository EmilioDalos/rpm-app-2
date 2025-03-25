const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to categories.json file (roles are stored within categories)
const categoriesFilePath = path.join(__dirname, '../data/categories.json');

// Helper function to read categories
const readCategories = () => {
  try {
    const data = fs.readFileSync(categoriesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories file:', error);
    return [];
  }
};

// Helper function to write categories
const writeCategories = (categories) => {
  try {
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing categories file:', error);
    return false;
  }
};

// Get all roles across all categories or roles for a specific category
exports.getAllRoles = (req, res) => {
  const { categoryId } = req.query;
  const categories = readCategories();

  if (categoryId) {
    // If categoryId is provided, fetch roles for that category
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.json(category.roles || []);
  }

  // Otherwise, fetch all roles across categories
  const allRoles = categories.flatMap(cat => cat.roles || []);
  return res.json(allRoles);
};

// Get a single role by ID
exports.getRoleById = (req, res) => {
  const { id } = req.params;
  const categories = readCategories();
  
  // Find the role across all categories
  let foundRole = null;
  for (const category of categories) {
    if (category.roles) {
      const role = category.roles.find(r => r.id === id);
      if (role) {
        foundRole = role;
        break;
      }
    }
  }
  
  if (foundRole) {
    return res.json(foundRole);
  } else {
    return res.status(404).json({ error: 'Role not found' });
  }
};

// Create a new role in a specified category
exports.createRole = (req, res) => {
  const { categoryId, role } = req.body;
  
  if (!categoryId || !role) {
    return res.status(400).json({ error: 'Both categoryId and role data are required' });
  }
  
  const categories = readCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  // Create the new role with a unique ID and timestamps
  const newRole = {
    ...role,
    id: uuidv4(),
    categoryId, // Ensure the categoryId is set
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Initialize roles array if it doesn't exist
  if (!category.roles) {
    category.roles = [];
  }
  
  category.roles.push(newRole);
  
  if (writeCategories(categories)) {
    return res.status(201).json(newRole);
  } else {
    return res.status(500).json({ error: 'Failed to create role' });
  }
};

// Update an existing role
exports.updateRole = (req, res) => {
  const { id } = req.params;
  const updatedRole = req.body;
  const categories = readCategories();

  let roleUpdated = false;
  let originalCategoryIndex = null;
  let roleToMove = null;

  // Find the role and update or mark for moving
  categories.forEach((category, categoryIndex) => {
    if (category.roles) {
      const roleIndex = category.roles.findIndex(r => r.id === id);
      if (roleIndex !== -1) {
        if (!updatedRole.categoryId || category.id === updatedRole.categoryId) {
          // Update the role if it's staying in the same category
          category.roles[roleIndex] = { 
            ...category.roles[roleIndex],
            ...updatedRole,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
          };
          roleUpdated = true;
        } else {
          // Mark the role for moving if the category ID has changed
          roleToMove = { 
            ...category.roles[roleIndex],
            ...updatedRole,
            id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
          };
          originalCategoryIndex = categoryIndex;
        }
      }
    }
  });

  if (roleToMove && originalCategoryIndex !== null) {
    // Remove the role from the original category
    categories[originalCategoryIndex].roles = categories[originalCategoryIndex].roles.filter(
      role => role.id !== id
    );

    // Find the target category and add the role there
    const targetCategory = categories.find(category => category.id === updatedRole.categoryId);
    if (!targetCategory) {
      return res.status(404).json({ error: 'Target category not found' });
    }
    
    // Initialize roles array if it doesn't exist
    if (!targetCategory.roles) {
      targetCategory.roles = [];
    }
    
    targetCategory.roles.push(roleToMove);
    roleUpdated = true;
  }

  if (!roleUpdated) {
    return res.status(404).json({ error: 'Role not found' });
  }

  if (writeCategories(categories)) {
    // Find the updated role to return in the response
    let updatedRoleResponse = null;
    for (const category of categories) {
      if (category.roles) {
        const role = category.roles.find(r => r.id === id);
        if (role) {
          updatedRoleResponse = role;
          break;
        }
      }
    }
    return res.json(updatedRoleResponse);
  } else {
    return res.status(500).json({ error: 'Failed to update role' });
  }
};

// Delete a role
exports.deleteRole = (req, res) => {
  const { id } = req.params;
  const categories = readCategories();
  let roleDeleted = false;

  // Iterate over categories to find and delete the role
  categories.forEach(category => {
    if (Array.isArray(category.roles)) {
      const initialLength = category.roles.length;
      category.roles = category.roles.filter(role => role.id !== id);
      if (category.roles.length < initialLength) {
        roleDeleted = true;
      }
    }
  });

  if (!roleDeleted) {
    return res.status(404).json({ error: 'Role not found' });
  }

  if (writeCategories(categories)) {
    return res.json({ message: 'Role deleted successfully' });
  } else {
    return res.status(500).json({ error: 'Failed to delete role' });
  }
}; 