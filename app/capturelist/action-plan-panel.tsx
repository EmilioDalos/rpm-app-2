
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ActionPlan = {
  id: number;
  text: string;
  leverage: string;
  durationAmount: number;
  durationUnit: string;
  priority: number;
  key: string;
};

type ActionPlanPanelProps = {
  group: {
    id: number
    title: string
    actions: { id: number; text: string; checked: boolean }[]
  }
  onClose: (deletedGroupId?: number) => void
}

export default function ActionPlanPanel({ group, onClose}: ActionPlanPanelProps) {
  const [massiveActions, setMassiveActions] = useState<ActionPlan[]>([])
  const [purposes, setPurposes] = useState<string[]>([])
  const [result, setResult] = useState('')
  const [activeColumn, setActiveColumn] = useState('massiveActions')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [categories] = useState(['Personal', 'Work', 'Fitness', 'Learning'])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedOption, setSelectedOption] = useState<string>('Day')
  
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!group || !group.id) {
      console.warn('Group did not load properly!'); // Early exit if group is invalid
      return;
    }
  
    const savedData = localStorage.getItem(`actionPlan-${group.id}`);
    console.log(`SavedData actionPlan-${group.id}`, savedData);
  
    if (savedData) {
      console.log('Saved Data Found'); // Load data from localStorage
      try {
        const parsedData = JSON.parse(savedData);
        setMassiveActions(parsedData.massiveActions || []);
        setPurposes(parsedData.purposes || []);
        setResult(parsedData.result || '');
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    } else if (group?.actions?.length) {
      console.log('Data was empty. Initializing group actions.'); // Initialize with group actions
      const newActions = group.actions.map((action, index) => ({
        id: Date.now() + index,
        text: action.text,
        leverage: '',
        durationAmount: 0,
        durationUnit: 'min',
        priority: index + 1,
        key: '✘',
        category: selectedCategory || '',
      }));
  
      setMassiveActions(newActions);
      setResult(group.title);
  
      const initialData = {
        id: group.id, // Add group.id to the initialized data
        massiveActions: newActions,
        purposes: [],
        result: group.title,
      };
  
      localStorage.setItem(`actionPlan-${group.id}`, JSON.stringify(initialData));
      console.log('Initialized and saved new data:', initialData);
    }
  }, [group, selectedCategory]);
  
  
 // Save to localStorage only when state is fully initialized
useEffect(() => {
  if (!massiveActions.length && !purposes.length && !result) {
    console.log('State not yet initialized. Skipping save.');
    return;
  }

  const dataToSave = {
    id: group.id, // Add the group ID here
    massiveActions,
    purposes,
    result,
  };

  localStorage.setItem(`actionPlan-${group.id}`, JSON.stringify(dataToSave));
  console.log(`Saved actionPlan-${group.id}:`, dataToSave);
}, [massiveActions, purposes, result, group.id]);
  

  const addMassiveAction = () => {
    const newAction: ActionPlan = {
      id: Date.now(),
      text: '',
      leverage: '',
      durationAmount: 0,
      durationUnit: 'min',
      priority: massiveActions.length + 1,
      key: '✘',

    }
    setMassiveActions([...massiveActions, newAction])
    setResult(group.title)
   
  }

  const updateMassiveAction = (index: number, updatedAction: Partial<ActionPlan>) => {
    const updatedActions = massiveActions.map((action, i) => 
      i === index ? { ...action, ...updatedAction } : action
    )
    setMassiveActions(updatedActions)
  }

  const updateRpmBlocksInLocalStorage = (newBlock: any) => {
    // Haal bestaande rpmBlocks op uit localStorage
    const savedBlocks = localStorage.getItem('rpmBlocks');
    const rpmBlocks = savedBlocks ? JSON.parse(savedBlocks) : []; // Parse de opgeslagen blocks of gebruik een lege array
  
    // Voeg het nieuwe blok toe aan de array
    const updatedBlocks = [...rpmBlocks, newBlock];
  
    // Sla de bijgewerkte array op in localStorage
    localStorage.setItem('rpmBlocks', JSON.stringify(updatedBlocks));
  
    // Log voor debugging
    console.log('Updated rpmBlocks in localStorage:', updatedBlocks);
  };

  const handleSave = async () => {
    try {
      const rpmBlockData = {
        actions: massiveActions,
        result,
        category: selectedCategory,
        type: selectedOption,
        createdAt: new Date(),
        updatedAt: new Date(),
        saved : true
      };

      const response = await fetch('api/rpmblocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rpmBlockData),
      });

      if (!response.ok) {
        throw new Error('Netwerkfout bij het opslaan van het actieplan');
      }

      const data = await response.json();
      console.log('Actieplan succesvol opgeslagen:', data);

  
      localStorage.removeItem(`actionPlan-${group.id}`);

      onClose(group.id);
      console.log('Sluit het ActionPlanPanel');

       // Verwijder het blok uit de rpmBlocks in localStorage
    const existingBlocks = JSON.parse(localStorage.getItem('rpmBlocks') || '[]');
    const updatedBlocks = existingBlocks.filter((block: any) => block.id !== newBlock.id);
    localStorage.setItem('rpmBlocks', JSON.stringify(updatedBlocks));


    // Zorg ervoor dat de parent component ook de nieuwe groepen ontvangt
     onClose(); // Verwijder deze regel, omdat onClose geen argumenten verwacht

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Fout bij het opslaan van het actieplan:', error.message);
      } else {
        console.error('Fout bij het opslaan van het actieplan:', error);
      }
    }
  }


  const removeMassiveAction = (index: number) => {
    setMassiveActions(massiveActions.filter((_, i) => i !== index))
    
  }

  const addPurpose = () => setPurposes([...purposes, ''])
  const removePurpose = (index: number) => setPurposes(purposes.filter((_, i) => i !== index))

  const toggleColumn = (column: string) => {
    setActiveColumn(activeColumn === column ? '' : column)
  }

  // Calculate total time and must time
  const calculateTotalTime = () => {
    let totalMinutes = 0
    let totalMustMinutes = 0
    massiveActions.forEach(action => {
      const minutes = action.durationAmount * (action.durationUnit === 'hr' ? 60 : 1)
      totalMinutes += minutes
      if (action.key === '✔') {
        totalMustMinutes += minutes
      }
    })
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h${mins}m`
    }
    return {
      totalTime: formatTime(totalMinutes),
      totalMustTime: formatTime(totalMustMinutes)
    }
  }

  const handleCapturelistClick = () => {
    const newBlock = {
      id: group.id, // Gebruik het ID van de groep/actionPlan
      actions: massiveActions,
      result,
      category: selectedCategory,
      type: selectedOption,
      saved: false,
    };
  
    // Haal bestaande rpmBlocks op uit localStorage
    const existingBlocks = JSON.parse(localStorage.getItem('rpmBlocks') || '[]');
  
    // Controleer of het blok al bestaat
    const existingBlockIndex = existingBlocks.findIndex((block: any) => block.id === newBlock.id);
  
    if (existingBlockIndex !== -1) {
      // Vervang het bestaande blok
      existingBlocks[existingBlockIndex] = newBlock;
    } else {
      // Voeg het nieuwe blok toe als het niet bestaat
      existingBlocks.push(newBlock);
    }
  
    // Sla de bijgewerkte lijst op in localStorage
    localStorage.setItem('rpmBlocks', JSON.stringify(existingBlocks));
  
    // Emit custom event
    const event = new CustomEvent('rpmBlocksUpdated');
    window.dispatchEvent(event);
  
    console.log('Updated rpmBlocks:', existingBlocks);
  
    // Sluit het paneel
    onClose();
  };
  
  
    
  const { totalTime, totalMustTime } = calculateTotalTime()

  return (
    <div className="fixed inset-0 bg-gray-1000 bg-opacity-75 flex flex-col">
      <div className="flex flex-grow overflow-hidden">
        {/* Capturelist Return Bar */}
        <div
  className="bg-gray-900 text-white w-16 flex items-center justify-center cursor-pointer"
  onClick={handleCapturelistClick}
  title="Terug naar Capturelist"
>
          <span className="transform -rotate-90 text-xs font-bold tracking-widest">CAPTURELIST</span>
        </div>
        
        {/* Action Plan Panel */}
        <div className="flex-grow bg-white shadow-lg overflow-hidden flex flex-col">
          {/* Main Content */}
          <div className="flex-grow p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{group.title} - Massive Action Plan</h2>

            {/* Column Layout */}
            <div className="flex justify-between gap-4">
              {/* Massive Action Plan Column */}
              <div className={`flex-[2] p-4 rounded-lg w-full bg-gray-100 ${isCollapsed && activeColumn !== 'massiveActions' ? 'hidden' : ''}`}>
                <h3 className="text-lg font-semibold mb-2">MASSIVE ACTION PLAN</h3>
                
                {massiveActions.map((action, index) => (
                  <div key={action.id} className="flex items-center my-2 rounded  w-full">
                    <Input
                      placeholder="LB"
                      value={action.leverage}
                      onChange={(e) => updateMassiveAction(index, { leverage: e.target.value })}
                      className="w-10 text-xs p-1"
                    />
                    <Input
                      placeholder="1"
                      type="number"
                      value={action.durationAmount}
                      onChange={(e) => updateMassiveAction(index, { durationAmount: parseInt(e.target.value) })}
                      className="w-10 text-xs p-1"
                    />
                    <Select
                      value={action.durationUnit}
                      onValueChange={(value) => updateMassiveAction(index, { durationUnit: value })}
                    >
                      <SelectTrigger className="w-16 text-xs p-1"><SelectValue placeholder="Unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="min">min</SelectItem>
                        <SelectItem value="hr">hr</SelectItem>
                        <SelectItem value="d">d</SelectItem>
                        <SelectItem value="wk">wk</SelectItem>
                        <SelectItem value="mo">mo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="P"
                      type="number"
                      value={action.priority}
                      onChange={(e) => updateMassiveAction(index, { priority: parseInt(e.target.value) })}
                      className="w-10 text-xs p-1"
                    />
                    <Select
                      value={action.key}
                      onValueChange={(value) => updateMassiveAction(index, { key: value })}
                    >
                      <SelectTrigger className="w-10 text-xs p-1"><SelectValue placeholder="Key" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="✘">✘</SelectItem>
                        <SelectItem value="✔">✔</SelectItem>
                        <SelectItem value="O">O</SelectItem>
                        <SelectItem value="➜">➜</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      value={action.text} 
                      placeholder="Test Action" 
                      onChange={(e) => updateMassiveAction(index, { text: e.target.value })}
                      className="flex-grow text-xs p-1"
                    />
                    <Button onClick={() => removeMassiveAction(index)} variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}

                <Button onClick={addMassiveAction} className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Action</Button>
              
              </div>

              {/* Result and Purpose Columns */}
              <div className={`flex-1 p-4 rounded-lg text-center bg-gray-200 ${isCollapsed && activeColumn !== 'result' ? 'hidden' : ''}`}>
                <h3 className="text-lg font-semibold mb-2">RESULT</h3>
                <Textarea
                  placeholder="What do I want?"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full mt-2 text-xs p-1 bg-white min-h-[100px] resize-none overflow-hidden"
                />
              </div>
              <div className={`flex-1 p-4 rounded-lg bg-gray-300 ${isCollapsed && activeColumn !== 'purpose' ? 'hidden' : ''}`}>
                <h3 className="text-lg font-semibold mb-2">PURPOSE</h3>
                {purposes.map((purpose, index) => (
                  <div key={index} className="flex items-center my-2">
                    <Input
                      placeholder="Purpose"
                      value={purpose}
                      onChange={(e) => {
                        const newPurposes = [...purposes]
                        newPurposes[index] = e.target.value
                        setPurposes(newPurposes)
                      }}
                      className="flex-grow text-xs p-1 bg-white"
                    />
                    <Button onClick={() => removePurpose(index)} variant="ghost" size="sm" className="ml-1">
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
                <Button  className="mt-2"><Plus className="h-4 w-4 mr-1" /> Add Purpose</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Bar */}
      <div className="bg-white shadow-lg p-4 flex flex-wrap items-center justify-between">
        <h4 className="text-sm font-semibold mr-4">
          Total Time: {totalTime} Total Must Time: {totalMustTime}
        </h4>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value)}
          >
            <SelectTrigger className="w-[140px] text-xs">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Day">Day</SelectItem>
              <SelectItem value="Week">Week</SelectItem>
              <SelectItem value="Month">Month</SelectItem>
              <SelectItem value="Quarter">Quarter</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Category">Category</SelectItem>
            </SelectContent>
          </Select>

          {selectedOption === 'Category' && (
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
           {/* Save button */}
           <Button 
              onClick={handleSave}
              className="bg-black text-white hover:bg-gray-800"
            >
              Save
            </Button>
        </div>
      </div>
         
    </div>
  )
}