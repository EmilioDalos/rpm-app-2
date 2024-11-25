'use client'

import { useState, useEffect } from 'react';

import Capturelist from './capturelist'
import { Header } from "@/components/layout/header";
import RpmOverview from './rpmoverview'




export default function Page() {
  const [blocks, setBlocks] = useState([]); // State to store RpmBlocks
  const [isLoading, setIsLoading] = useState(true); // State to handle loading

  // Fetch RpmBlocks from the API
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await fetch('/api/rpmblocks'); // Adjust the API endpoint as needed
        if (!response.ok) {
          throw new Error('Failed to fetch RPM blocks');
        }
        const data = await response.json();
        setBlocks(data); // Set the fetched blocks to state
      } catch (error) {
        console.error('Error fetching RPM blocks:', error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchBlocks();
  }, []); // Runs once on component mount
  return (
    <main className="min-h-screen bg-gray-100">
      <Header/>
      <div className="container mx-auto p-4">
      
          <div className="grid gap-8 md:grid-cols-2">
          <div>
              <Capturelist />
            </div>
            <div>
              <RpmOverview blocks={blocks} />
            </div>
           
          </div>
        
    </div>
    </main>
  )
}
