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
  const [showActionPlan, setShowActionPlan] = useState(false);

  useEffect(() => {
    const reloadCombinedBlocks = () => {
      const localBlocks = localStorage.getItem('rpmBlocks');
      const localBlocksArray: RpmBlock[] = localBlocks ? JSON.parse(localBlocks) : [];
  
      const combinedBlocks = [
        ...localBlocksArray,
        ...(Array.isArray(blocks) ? blocks.filter(
          (block) => !localBlocksArray.some((localBlock) => localBlock.id === block.id)
        ) : []),
      ];

      setStoredBlocks(combinedBlocks);
      localStorage.setItem('rpmBlocks', JSON.stringify(combinedBlocks));
    };

    reloadCombinedBlocks();

    window.addEventListener('rpmBlocksUpdated', reloadCombinedBlocks);

    return () => {
      window.removeEventListener('rpmBlocksUpdated', reloadCombinedBlocks);
    };
  }, [blocks]);

  const handleDelete = async (id: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        const response = await fetch(`/api/rpmblocks/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Error deleting RPM Block: ${response.statusText}`);
        }
      }

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
    setSelectedBlock(block);
    setShowActionPlan(true);
  };

  const closeActionPlan = () => {
    setSelectedBlock(null);
    setShowActionPlan(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">RPM List</h1>

      <div className="grid grid-cols-12 gap-2 mb-2 px-3 font-medium text-sm text-gray-600">
        <div className="col-span-5 truncate">Result</div>
        <div className="col-span-2 truncate">Type</div>
        <div className="col-span-3 truncate">Datum</div>
        <div className="col-span-2 text-right">Acties</div>
      </div>

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
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5 truncate font-medium" title={block.result}>{block.result}</div>
              <div className="col-span-2 text-sm text-gray-500 truncate overflow-hidden" title={block.type}>{block.type}</div>
              <div className="col-span-3 text-sm truncate" title={block.createdAt ? new Date(block.createdAt).toLocaleDateString('en-US') : 'Date not available'}>
                {block.createdAt ? new Date(block.createdAt).toLocaleDateString('en-US') : 'Date not available'}
              </div>
              <div className="col-span-2 flex items-center justify-end space-x-1">
                {block.saved ? (
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
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
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(block.id, block.saved ?? false)}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleBlocks < storedBlocks.length && (
        <div className="flex justify-center mt-4">
          <Button onClick={loadMore} variant="outline">
            Meer laden
          </Button>
        </div>
      )}
      {showActionPlan && selectedBlock && (
        <ActionPlanPanel selectedBlock={selectedBlock} onClose={closeActionPlan} />
      )}
    </div>
  );
}

