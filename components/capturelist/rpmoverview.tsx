'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, BookOpen } from 'lucide-react';
import { RpmBlock } from '@/types';
import ActionPlanPanel from './action-plan-panel';

export default function RpmOverview({ blocks }: { blocks: RpmBlock[] }) {
  const [visibleBlocks, setVisibleBlocks] = useState(8);
  const [storedBlocks, setStoredBlocks] = useState<RpmBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<RpmBlock | null>(null);


  // Combineer blocks uit props en localStorage
  useEffect(() => {
    const reloadCombinedBlocks = () => {
      const localBlocks = localStorage.getItem('rpmBlocks');
      const localBlocksArray: RpmBlock[] = localBlocks ? JSON.parse(localBlocks) : [];
  
      // Combineer de blocks, waarbij duplicaten op basis van ID worden vermeden
      const combinedBlocks = [
        ...localBlocksArray,
        ...blocks.filter(
          (block) => !localBlocksArray.some((localBlock) => localBlock.id === block.id)
        ),
      ];

      // Update de state en localStorage met de gesorteerde blocks
      setStoredBlocks(combinedBlocks);
      localStorage.setItem('rpmBlocks', JSON.stringify(combinedBlocks));
    };

    // Bij eerste render en wanneer de props veranderen, laad en combineer blocks
    reloadCombinedBlocks();

    // Luisteren naar het custom event 'rpmBlocksUpdated' voor real-time updates
    window.addEventListener('rpmBlocksUpdated', reloadCombinedBlocks);

    return () => {
      window.removeEventListener('rpmBlocksUpdated', reloadCombinedBlocks);
    };
  }, [blocks]);

  const handleDelete = async (id: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        // Voor opgeslagen regels: Verwijderen via de API
        const response = await fetch(`/api/rpmblocks/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error deleting RPM Block: ${response.statusText}`);
        }
      }

      // Voor beide gevallen: Verwijderen uit localStorage en state
      const updatedBlocks = storedBlocks.filter((block) => block.id !== id);
      setStoredBlocks(updatedBlocks);
      localStorage.setItem('rpmBlocks', JSON.stringify(updatedBlocks));
    } catch (error) {
      console.error(`Error deleting RPM Block with ID ${id}:`, error);
    }
  };

  const loadMore = () => {
    setVisibleBlocks((prevVisible) => Math.min(prevVisible + 8, storedBlocks.length));
  };

  const openActionPlan = (block: RpmBlock) => {
    setSelectedBlock(block); // Stel het geselecteerde block in om door te geven aan het panel
  };

  const closeActionPlan = () => {
    setSelectedBlock(null); // Sluit het panel door de geselecteerde block te resetten
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">RPM List</h1>

      <div className="space-y-2">
        {storedBlocks.slice(0, visibleBlocks).map((block, index) => (
          <div
            key={block.id}
            className={`block p-3 rounded-lg transition-colors ${
              block.saved
                ? index % 2 === 0
                  ? 'bg-gray-100 hover:bg-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium">{block.result}</span>
                <span className="text-sm text-gray-500">{block.type}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  {block.createdAt ? new Date(block.createdAt).toLocaleDateString('en-US') : 'Date not available'}
                </span>
                {block.saved ? (
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openActionPlan(block)}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(block.id, block.saved ?? false)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleBlocks < storedBlocks.length && (
        <div className="flex justify-center">
          <Button onClick={loadMore} variant="outline">
            Meer laden
          </Button>
        </div>
      )}
      {selectedBlock && (
        <ActionPlanPanel selectedBlock={selectedBlock} onClose={closeActionPlan} />
      )}
    </div>
  );
}
