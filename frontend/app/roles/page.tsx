"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Role } from "@/types"; // Ensure Role type is defined in "@/types"

// Placeholder for RoleList component; replace with actual implementation
import { RoleList } from "@/components/roles/roles-list"; 

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`);
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        } else {
          console.error('Failed to fetch roles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    }

    fetchRoles();
  }, []);

  const handleAddRole = async (newRole: Omit<Role, 'id'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      });
      if (response.ok) {
        const addedRole = await response.json();
        setRoles((prevRoles) => [...prevRoles, addedRole]);
      } else {
        console.error('Failed to add role');
      }
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleUpdateRole = async (updatedRole: Role) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${updatedRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRole),
      });
  
      if (response.ok) {
        const updatedData = await response.json();
  
        // Werk de state bij en ververs de lijst
        setRoles((prevRoles) =>
          prevRoles.map((role) =>
            role.id === updatedData.id ? updatedData : role
          )
        );
  
        // Optioneel: herlaad de lijst volledig om de laatste data te krijgen
        //fetchRoles();
      } else {
        console.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };
  
  

  const handleDeleteRole = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
      } else {
        console.error('Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <RoleList
          roles={roles}
          onAddRole={handleAddRole}
          onUpdateRole={handleUpdateRole}
          onDeleteRole={handleDeleteRole}
        />
      </div>
    </main>
  );
}
