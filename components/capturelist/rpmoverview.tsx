'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, BookOpen } from 'lucide-react';
import { RpmBlock } from '@/types';
import ActionPlanPanel from './action-plan-panel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RpmOverview({ blocks }: { blocks: RpmBlock[] }) {
  const [visibleBlocks, setVisibleBlocks] = useState(8);
  const [storedBlocks, setStoredBlocks] = useState<RpmBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<RpmBlock | null>(null);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string, roles?: any[]}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from API...');
        const response = await fetch('/api/categories');
        console.log('Categories API response status:', response.status);
        const data = await response.json();
        console.log('Fetched categories data:', data);
        
        // Controleer of we een array van categorieën hebben of een object met een categories property
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
          console.error('Unexpected categories data format:', data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

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

      // Filter blocks by selected category if one is selected
      const filteredBlocks = selectedCategory !== "all"
        ? combinedBlocks.filter(block => block.categoryId === selectedCategory)
        : combinedBlocks;

      setStoredBlocks(filteredBlocks);
      localStorage.setItem('rpmBlocks', JSON.stringify(combinedBlocks));
    };

    reloadCombinedBlocks();

    window.addEventListener('rpmBlocksUpdated', reloadCombinedBlocks);

    return () => {
      window.removeEventListener('rpmBlocksUpdated', reloadCombinedBlocks);
    };
  }, [blocks, selectedCategory]);

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">RPM List</h1>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-12 gap-2 mb-2 px-3 font-medium text-sm text-gray-600">
        <div className="col-span-4 truncate">Result</div>
        <div className="col-span-2 truncate">Type</div>
        <div className="col-span-2 truncate">Categorie</div>
        <div className="col-span-2 truncate">Datum</div>
        <div className="col-span-2 text-right">Acties</div>
      </div>

      <div className="space-y-2">
        {storedBlocks.slice(0, visibleBlocks).map((block, index) => {
          // Vind de categorie naam op basis van de categoryId
          const category = categories.find(cat => cat.id === block.categoryId);
          const categoryName = category ? category.name : "";
          
          return (
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
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 truncate">{block.result}</div>
                <div className="col-span-2 truncate">{block.type}</div>
                <div className="col-span-2 truncate italic">{categoryName}</div>
                <div className="col-span-2 truncate">
                  {block.updatedAt ? new Date(block.updatedAt).toLocaleDateString('nl-NL') : '-'}
                </div>
                <div className="col-span-2 flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openActionPlan(block)}
                    title="Open RPM Block"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(block.id, !!block.saved)}
                    title="Delete RPM Block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {storedBlocks.length > visibleBlocks && (
        <Button onClick={loadMore} variant="outline" className="w-full mt-4">
          Load More
        </Button>
      )}

      {showActionPlan && selectedBlock && (
        <ActionPlanPanel selectedBlock={selectedBlock} onClose={closeActionPlan} />
      )}
    </div>
  );
}