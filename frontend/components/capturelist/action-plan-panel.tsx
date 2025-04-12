"use client"

import { useState, useEffect, ReactElement } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RpmBlock, MassiveAction, CalendarEvent } from "@/types"
import { v4 as uuidv4 } from 'uuid';

type ActionPlan = MassiveAction & {
  id: string
}

interface Purpose {
  purpose: string;
}

type ActionPlanPanelProps = {
  group?: {
    id: string
    title: string
    actions: { id: string; text: string; checked: boolean }[]
  }
  onClose: (deletedGroupId?: string) => void
  selectedBlock?: RpmBlock
}

interface Group {
  id: string;
  title: string;
  actions: { id: string; text: string; checked: boolean; }[];
}

// Beschrijvingen voor de actie-statussleutels
const ACTION_KEY_DESCRIPTIONS = {
  "?": "Nieuwe actie die nog geen toewijzing heeft",
  "✘": "Actie is voltooid/afgerond",
  "✔": "Actie is in uitvoering",
  "¡": "Actie met hefboomwerking",
  "■": "Actie bleek niet nodig voor het resultaat",
  "➜": "Actie is doorgeschoven naar een ander plan",
  "📅": "Actie is ingepland in de kalender",
};

export default function ActionPlanPanel({ group, onClose, selectedBlock }: ActionPlanPanelProps): ReactElement {
  const [massiveActions, setMassiveActions] = useState<ActionPlan[]>([])
  const [purposes, setPurposes] = useState<(string | Purpose)[]>([])
  const [result, setResult] = useState("")
  const [activeColumn, setActiveColumn] = useState("massiveActions")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [categories, setCategories] = useState<Array<{id: string, name: string, roles?: any[]}>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedOption, setSelectedOption] = useState<string>("Day")
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  
  // Functie om te controleren of een actie gepland is
  const isActionPlanned = (actionId: string): boolean => {
    return calendarEvents.some(event => 
      event.massiveActions && event.massiveActions.some(action => action.id === actionId)
    );
  };
  
  // Update actiestatussen op basis van planning
  useEffect(() => {
    if (calendarEvents.length > 0 && massiveActions && massiveActions.length > 0) {
      const updatedActions = massiveActions.map(action => {
        // Als de actie gepland is en de key is niet al '📅', '✔' of '✘', update de key
        if (isActionPlanned(action.id) && action.key !== '📅' && action.key !== '✔' && action.key !== '✘') {
          return { ...action, key: '📅' };
        }
        return action;
      });
      
      // Alleen bijwerken als er daadwerkelijk wijzigingen zijn
      if (JSON.stringify(updatedActions) !== JSON.stringify(massiveActions)) {
        setMassiveActions(updatedActions);
      }
    }
  }, [calendarEvents, massiveActions]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        const data = await response.json();
        console.log('Fetched categories:', data);
        
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

  //Luisteren naar vensterresizing
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1024)
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const dataSource: RpmBlock | undefined = group
      ? {
          id: group.id,
          massiveActions: group.actions.map((action) => ({
            id: action.id,
            text: action.text,
            leverage: "",
            durationAmount: 0,
            durationUnit: "min",
            priority: 0,
            key: "✘",
            categoryId: "",
            notes: [],
          })),
          result: group.title,
          purposes: [`Purpose voor ${group.title}`],
          categoryId: "",
          type: "Day",
          createdAt: new Date(),
          updatedAt: new Date(),
          saved: false,
        }
      : selectedBlock

    if (!dataSource?.id) {
      console.warn("❌ Geen geldige dataSource (group of selectedBlock)!")
      return
    }

    // Zorg ervoor dat het ID correct wordt gebruikt
    const sourceId = dataSource.id
    console.log("Loading data with ID:", sourceId)

    const storageKey = `actionPlan-${sourceId}`
    const savedData = localStorage.getItem(storageKey)

    console.log(`Laden van data uit localStorage met key: ${storageKey}`, savedData)

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        console.log("Geparseerde data uit localStorage:", parsedData)
        
        // Controleer of massiveActions aanwezig is en niet leeg is
        if (parsedData.massiveActions && parsedData.massiveActions.length > 0) {
          setMassiveActions(parsedData.massiveActions.map((action: any) => ({
            ...action,
            id: action.id,
          })))
        } else {
          // Als massiveActions leeg is, gebruik dan de acties uit dataSource
          setMassiveActions(dataSource.massiveActions?.map(action => ({
            ...action,
            id: action.id,
            categoryId: dataSource.categoryId || "",
          })))
        }
        
        // Controleer of purposes aanwezig is en niet leeg is
        setPurposes(parsedData.purposes && parsedData.purposes.length > 0 
          ? parsedData.purposes 
          : dataSource.purposes || [])
        
        // Controleer of result aanwezig is en niet leeg is
        setResult(parsedData.result || dataSource.result || "")
        
        // Log alle mogelijke categoryId waarden om te debuggen
        console.log("CategoryId waarden:", {
          parsedDataCategoryId: parsedData.categoryId,
          parsedDataCategory: parsedData.category,
          dataSourceCategoryId: dataSource.categoryId,
          selectedCategory: selectedCategory
        });
        
        // Zorg ervoor dat de categoryId wordt ingesteld, met fallbacks
        const categoryId = parsedData.categoryId || dataSource.categoryId || "";
        console.log("Using categoryId:", categoryId);
        setSelectedCategory(categoryId);
        
        // Zet de selectedOption correct
        const typeMap: { [key: string]: string } = {
          'Day': 'Day',
          'Week': 'Week',
          'Month': 'Month',
          'Quarter': 'Quarter',
          'Project': 'Project',
          'Category': 'Category'
        };
        setSelectedOption(typeMap[parsedData.type || dataSource.type || 'Day'] || 'Day');
        
        // Als er een categoryId is, switch naar Category optie
        if (categoryId) {
          console.log("Setting selectedOption to Category because categoryId exists:", categoryId);
          setSelectedOption("Category");
        }
      } catch (error) {
        console.error("Fout bij het parsen van data uit localStorage:", error)
        // Fallback naar dataSource bij parse error
        setMassiveActions(dataSource.massiveActions.map(action => ({
          ...action,
          id: action.id,
          categoryId: dataSource.categoryId || "",
        })))
        setPurposes(dataSource.purposes || [])
        setResult(dataSource.result || "")
        setSelectedCategory(dataSource.categoryId || "")
        setSelectedOption("Day")
        
        // Als er een categoryId is, switch naar Category optie
        if (dataSource.categoryId) {
          console.log("Setting selectedOption to Category because dataSource.categoryId exists:", dataSource.categoryId);
          setSelectedOption("Category");
        }
      }
    } else {
      // Geen opgeslagen data gevonden, gebruik dataSource
      console.log("Geen opgeslagen data gevonden, gebruik dataSource:", dataSource)
      setMassiveActions(dataSource.massiveActions?.map(action => ({
        ...action,
        id: action.id,
        categoryId: dataSource.categoryId || "",
      })))
      setPurposes(dataSource.purposes || [])
      setResult(dataSource.result || "")
      setSelectedCategory(dataSource.categoryId || "")
      setSelectedOption("Day")
      
      // Als er een categoryId is, switch naar Category optie
      if (dataSource.categoryId) {
        console.log("Setting selectedOption to Category because dataSource.categoryId exists:", dataSource.categoryId);
        setSelectedOption("Category");
      }
    }
  }, [group, selectedBlock])

  // Update hasUnsavedChanges when massiveActions change
  useEffect(() => {
    const hasChanges = massiveActions.length > 0;
    
    // Dispatch event when massiveActions change
    const event = new CustomEvent('rpmBlocksUpdated', { 
      detail: { hasUnsavedChanges: hasChanges } 
    });
    window.dispatchEvent(event);
  }, [massiveActions]);

  // Auto-save when massiveActions, result, purposes, selectedCategory, or selectedOption change
  useEffect(() => {
    const source = group?.id ? group : selectedBlock;
    if (!source?.id) return;

    // Zorg ervoor dat het ID correct wordt gebruikt
    const sourceId = source.id;

    const storageKey = `actionPlan-${sourceId}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        id: sourceId,
        massiveActions,
        result,
        purposes,
        categoryId: selectedCategory,
        type: selectedOption,
        updatedAt: new Date().toISOString(),
      }),
    );
    console.log(`Data automatisch opgeslagen in localStorage onder key: ${storageKey}`);
  }, [massiveActions, result, purposes, selectedCategory, selectedOption, group, selectedBlock]);

  const addMassiveAction = () => {
    const newAction: ActionPlan = {
      id: uuidv4(),
      text: "",
      leverage: "",
      durationAmount: 0,
      durationUnit: "min",
      priority: massiveActions.length + 1,
      key: "?",
      categoryId: selectedCategory || "",
      notes: [],
    }
    
    // Gebruik een callback met de huidige state om race conditions te voorkomen
    setMassiveActions(prevActions => [...prevActions, newAction])
  }

  const updateMassiveAction = (index: number, updatedAction: Partial<ActionPlan>) => {
    setMassiveActions((prev) => prev.map((action, i) => (i === index ? { ...action, ...updatedAction } : action)))
  }

  const removeMassiveAction = (index: number) => {
    setMassiveActions(massiveActions.filter((_, i) => i !== index))
  }

  const addPurpose = () => setPurposes([...purposes, ""])
  const removePurpose = (index: number) => setPurposes(purposes.filter((_, i) => i !== index))

  const toggleColumn = (column: string) => {
    setActiveColumn(activeColumn === column ? "" : column)
  }

  // Calculate total time and must time
  const calculateTotalTime = () => {
    let totalMinutes = 0
    let totalMustMinutes = 0
    massiveActions?.forEach((action) => {
      const minutes = action.durationAmount * (action.durationUnit === "hr" ? 60 : 1)
      totalMinutes += minutes
      if (action.key === "✔") {
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
      totalMustTime: formatTime(totalMustMinutes),
    }
  }

  const handleCapturelistClick = () => {
    // Determine the source (group or selectedBlock)
    const source = group?.id ? group : selectedBlock

    if (!source?.id) {
      console.warn("Neither group nor selectedBlock provided a valid ID!")
      return
    }

    // Controleer of massiveActions en result niet leeg zijn
    if (massiveActions.length === 0) {
      console.warn("massiveActions is leeg! Voeg eerst acties toe.")
    }

    if (!result) {
      console.warn("result is leeg! Voeg eerst een resultaat toe.")
    }

    // Zorg ervoor dat het ID correct wordt overgenomen
    const sourceId = source.id

    // Debug logging
    console.log("handleCapturelistClick - Saving with categoryId:", selectedCategory);
    console.log("handleCapturelistClick - Saving with type:", selectedOption);

    // Create a block based on the selected source
    const blockData = {
      id: sourceId,
      massiveActions: massiveActions,
      result,
      purposes: purposes,
      categoryId: selectedCategory,
      type: selectedOption,
      saved: false,
      updatedAt: new Date().toISOString(),
    }

    console.log("Saving to rpmBlocks with ID:", sourceId)

    // Sla de data op in localStorage onder de key actionPlan-<id>
    const storageKey = `actionPlan-${sourceId}`
    localStorage.setItem(storageKey, JSON.stringify(blockData))
    console.log(`Data opgeslagen in localStorage onder key: ${storageKey}`, blockData)

    // Retrieve existing rpmBlocks from localStorage
    const existingBlocks = JSON.parse(localStorage.getItem("rpmBlocks") || "[]")

    // Check if the block already exists
    const existingBlockIndex = existingBlocks.findIndex((block: any) => block.id === sourceId)

    if (existingBlockIndex !== -1) {
      // Replace the existing block
      existingBlocks.splice(existingBlockIndex, 1) // Remove the old block
    }

    // Add the new block at the beginning of the list
    existingBlocks.unshift(blockData)

    // Save the updated list to localStorage
    localStorage.setItem("rpmBlocks", JSON.stringify(existingBlocks))

    // Emit custom event
    const event = new CustomEvent("rpmBlocksUpdated")
    window.dispatchEvent(event)

    console.log("Updated rpmBlocks:", existingBlocks)

    // Close the panel
    onClose()
  }

  const { totalTime, totalMustTime } = calculateTotalTime()

  useEffect(() => {
    console.log("Selected rpmBlock:", selectedBlock)

    if (selectedBlock?.massiveActions) {
      setMassiveActions(
        selectedBlock.massiveActions.map((action) => ({
          ...action,
          id: action.id,
        })),
      )
      setResult(selectedBlock.result || "")
      setPurposes(selectedBlock.purposes || [])
      
      // Log alle parameters om te debuggen
      console.log("Setting categoryId from selectedBlock:", selectedBlock.categoryId);
      setSelectedCategory(selectedBlock.categoryId || "")
      
      // Als er een categoryId is, switch naar Category optie
      if (selectedBlock.categoryId) {
        console.log("Setting selectedOption to Category because selectedBlock.categoryId exists:", selectedBlock.categoryId);
        setSelectedOption("Category");
      }
    }
  }, [selectedBlock])

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
            <h2 className="text-2xl font-bold mb-4"> Massive Action Plan</h2>

            {/* Column Layout */}
            <div className="flex justify-between gap-4">
              {/* Massive Action Plan Column */}
              <div
                className={`flex-[2] p-4 rounded-lg w-full bg-gray-100 ${isCollapsed && activeColumn !== "massiveActions" ? "hidden" : ""}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">MASSIVE ACTION PLAN</h3>
                  <div className="text-xs text-gray-500 cursor-help" title="Legenda van de actiesymbolen">
                    <span className="mr-2">? (Nieuw)</span>
                    <span className="mr-2">📅 (Gepland)</span>
                    <span className="mr-2">✔ (In uitvoering)</span>
                    <span className="mr-2">✘ (Klaar)</span>
                  </div>
                </div>

                {massiveActions?.map((action, index) => (
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
                      onChange={(e) => updateMassiveAction(index, { durationAmount: Number.parseInt(e.target.value) })}
                      className="w-10 text-xs p-1"
                    />
                    <Select
                      value={action.durationUnit}
                      onValueChange={(value) => updateMassiveAction(index, { durationUnit: value })}
                    >
                      <SelectTrigger className="w-16 text-xs p-1">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
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
                      onChange={(e) => updateMassiveAction(index, { priority: Number.parseInt(e.target.value) })}
                      className="w-10 text-xs p-1"
                    />
                    <Select value={action.key} onValueChange={(value) => updateMassiveAction(index, { key: value })}>
                      <SelectTrigger className="w-14 text-base p-1 flex justify-center">
                        <SelectValue placeholder="Key" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="?">? (Nieuw)</SelectItem>
                        <SelectItem value="✘">✘ (Klaar)</SelectItem>
                        <SelectItem value="✔">✔ (In uitvoering)</SelectItem>
                        <SelectItem value="¡">¡ (Leveraged)</SelectItem>
                        <SelectItem value="■">■ (Niet nodig)</SelectItem>
                        <SelectItem value="➜">➜ (Verplaatst)</SelectItem>
                        <SelectItem value="📅">📅 (Gepland)</SelectItem>
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

                <Button onClick={addMassiveAction} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Action
                </Button>
              </div>

              {/* Result and Purpose Columns */}
              <div
                className={`flex-1 p-4 rounded-lg text-center bg-gray-200 ${isCollapsed && activeColumn !== "result" ? "hidden" : ""}`}
              >
                <h3 className="text-lg font-semibold mb-2">RESULT</h3>
                <Textarea
                  placeholder="What do I want?"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full mt-2 text-xs p-1 bg-white min-h-[100px] resize-none overflow-hidden"
                />
              </div>
              <div
                className={`flex-1 p-4 rounded-lg bg-gray-300 ${isCollapsed && activeColumn !== "purpose" ? "hidden" : ""}`}
              >
                <h3 className="text-lg font-semibold mb-2">PURPOSE</h3>
                {purposes.map((purpose: string | Purpose, index) => (
                  <div key={index} className="flex items-center my-2">
                    <Input
                      placeholder="Purpose"
                      value={typeof purpose === 'string' ? purpose : purpose.purpose}
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
                <Button onClick={addPurpose} className="mt-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Purpose
                </Button>
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
          <Select value={selectedOption} onValueChange={(value) => {
            setSelectedOption(value);
            // Als de optie Category is maar er is geen categoryId, toon dan een waarschuwing
            if (value === "Category" && !selectedCategory) {
              console.warn("Category option selected but no category ID is set!");
            }
          }}>
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

          {/* Toon de categorie selector altijd als selectedOption "Category" is OF als er een categoryId is */}
          {(selectedOption === "Category" || selectedCategory) && (
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                console.log("Category changed to:", value);
                setSelectedCategory(value);
                // Als de categorie verandert naar een geldige waarde, zorg dat selectedOption op "Category" staat
                if (value) {
                  setSelectedOption("Category");
                }
              }}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )
}