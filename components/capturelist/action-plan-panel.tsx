"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RpmBlock, MassiveAction } from "@/types"

type ActionPlan = MassiveAction & {
  id: string
}

type ActionPlanPanelProps = {
  group?: {
    id: number
    title: string
    actions: { id: number; text: string; checked: boolean }[]
  }
  onClose: (deletedGroupId?: number) => void
  selectedBlock?: RpmBlock
}

interface Group {
  id: number;
  title: string;
  actions: { id: number; text: string; checked: boolean; }[];
}

export default function ActionPlanPanel({ group, onClose, selectedBlock }: ActionPlanPanelProps) {
  const [massiveActions, setMassiveActions] = useState<ActionPlan[]>([])
  const [purposes, setPurposes] = useState<string[]>([])
  const [result, setResult] = useState("")
  const [activeColumn, setActiveColumn] = useState("massiveActions")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [categories] = useState(["Personal", "Work", "Fitness", "Learning"])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedOption, setSelectedOption] = useState<string>("Day")

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
          id: group.id.toString(),
          massiveActions: group.actions.map((action) => ({
            id: action.id.toString(),
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
    const sourceId = typeof dataSource.id === 'string' ? dataSource.id : String(dataSource.id)
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
            id: typeof action.id === 'string' ? action.id : String(action.id),
          })))
        } else {
          // Als massiveActions leeg is, gebruik dan de acties uit dataSource
          setMassiveActions(dataSource.massiveActions.map(action => ({
            ...action,
            id: typeof action.id === 'string' ? action.id : String(action.id),
            categoryId: dataSource.categoryId || "",
          })))
        }
        
        // Controleer of purposes aanwezig is en niet leeg is
        setPurposes(parsedData.purposes && parsedData.purposes.length > 0 
          ? parsedData.purposes 
          : dataSource.purposes || [])
        
        // Controleer of result aanwezig is en niet leeg is
        setResult(parsedData.result || dataSource.result || "")
        
        setSelectedCategory(parsedData.categoryId || parsedData.category || dataSource.categoryId || "")
        setSelectedOption(parsedData.type || dataSource.type || "Day")
      } catch (error) {
        console.error("Fout bij het parsen van data uit localStorage:", error)
        // Fallback naar dataSource bij parse error
        setMassiveActions(dataSource.massiveActions.map(action => ({
          ...action,
          id: typeof action.id === 'string' ? action.id : String(action.id),
          categoryId: dataSource.categoryId || "",
        })))
        setPurposes(dataSource.purposes || [])
        setResult(dataSource.result || "")
        setSelectedCategory(dataSource.categoryId || "")
        setSelectedOption(dataSource.type || "Day")
      }
    } else {
      // Geen opgeslagen data gevonden, gebruik dataSource
      console.log("Geen opgeslagen data gevonden, gebruik dataSource:", dataSource)
      setMassiveActions(dataSource.massiveActions.map(action => ({
        ...action,
        id: typeof action.id === 'string' ? action.id : String(action.id),
        categoryId: dataSource.categoryId || "",
      })))
      setPurposes(dataSource.purposes || [])
      setResult(dataSource.result || "")
      setSelectedCategory(dataSource.categoryId || "")
      setSelectedOption(dataSource.type || "Day")
    }
  }, [group, selectedBlock])

  useEffect(() => {
    const source = group?.id ? group : selectedBlock
    if (!source?.id) return

    // Zorg ervoor dat het ID correct wordt gebruikt
    const sourceId = typeof source.id === 'string' ? source.id : String(source.id)

    const storageKey = `actionPlan-${sourceId}`
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
    )
    console.log(`Data automatisch opgeslagen in localStorage onder key: ${storageKey}`)
  }, [massiveActions, result, purposes, selectedCategory, selectedOption, group, selectedBlock])

  const addMassiveAction = () => {
    const newAction: ActionPlan = {
      id: Date.now().toString(),
      text: "",
      leverage: "",
      durationAmount: 0,
      durationUnit: "min",
      priority: massiveActions.length + 1,
      key: "✘",
      categoryId: selectedCategory || "",
      notes: [],
    }
    setMassiveActions([...massiveActions, newAction])
  }

  const updateMassiveAction = (index: number, updatedAction: Partial<ActionPlan>) => {
    setMassiveActions((prev) => prev.map((action, i) => (i === index ? { ...action, ...updatedAction } : action)))
  }

  const handleSave = async () => {
    try {
      const source = group?.id ? group : selectedBlock
      if (!source?.id) return

      // Controleer of massiveActions en result niet leeg zijn
      if (massiveActions.length === 0) {
        console.warn("massiveActions is leeg! Voeg eerst acties toe.")
        return; // Stop de functie als er geen acties zijn
      }

      if (!result) {
        console.warn("result is leeg! Voeg eerst een resultaat toe.")
        return; // Stop de functie als er geen resultaat is
      }

      // Zorg ervoor dat het ID correct wordt overgenomen
      const sourceId = typeof source.id === 'string' ? source.id : String(source.id)

      const newBlock = {
        id: sourceId,
        massiveActions,
        result,
        purposes,
        categoryId: selectedCategory,
        type: selectedOption,
        createdAt: new Date(),
        updatedAt: new Date(),
        saved: true,
      }

      console.log("Saving block with data:", newBlock);
      console.log("Using ID:", sourceId);

      let response
      if (selectedBlock) {
        console.log("Checking if selectedBlock exists...GET")
        response = await fetch(`api/rpmblocks/${sourceId}`, {
          method: "GET",
        })

        if (response.ok) {
          console.log("selectedBlock exists. Updating with PUT...")
          // Update the record using PUT
          response = await fetch(`api/rpmblocks/${sourceId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newBlock),
          })
        } else if (response.status === 404) {
          console.log("selectedBlock not found. Creating with POST...")
          // Create a new record using POST
          response = await fetch("api/rpmblocks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newBlock),
          })
        }
      } else {
        // Default behavior for group: Always create a new record using POST
        console.log("Group detected. Creating new record with POST...")
        response = await fetch("api/rpmblocks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBlock),
        })
      }

      if (!response.ok) {
        throw new Error("Error saving the action plan.")
      }

      const savedBlock = await response.json()
      console.log("Action plan successfully saved:", savedBlock)

      // Update localStorage
      const existingBlocks = JSON.parse(localStorage.getItem("rpmBlocks") || "[]")
      const updatedBlocks = existingBlocks.filter((block: any) => block.id !== sourceId)
      updatedBlocks.unshift(savedBlock)
      localStorage.setItem("rpmBlocks", JSON.stringify(updatedBlocks))

      // Remove the corresponding action plan from localStorage
      console.log("Remove the corresponding action plan from localStorage:", savedBlock)
      localStorage.removeItem(`actionPlan-${sourceId}`)

      // Emit custom event
      const event = new CustomEvent("rpmBlocksUpdated")
      window.dispatchEvent(event)

      // Close the panel
      onClose(typeof source.id === "number" ? source.id : Number.parseInt(sourceId))
    } catch (error) {
      console.error("Error saving the action plan:", error)
    }
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
    massiveActions.forEach((action) => {
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
    const sourceId = typeof source.id === 'string' ? source.id : String(source.id)

    // Create a new block based on the selected source
    const newBlock = {
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
    localStorage.setItem(storageKey, JSON.stringify(newBlock))
    console.log(`Data opgeslagen in localStorage onder key: ${storageKey}`, newBlock)

    // Retrieve existing rpmBlocks from localStorage
    const existingBlocks = JSON.parse(localStorage.getItem("rpmBlocks") || "[]")

    // Check if the block already exists
    const existingBlockIndex = existingBlocks.findIndex((block: any) => block.id === sourceId)

    if (existingBlockIndex !== -1) {
      // Replace the existing block
      existingBlocks.splice(existingBlockIndex, 1) // Remove the old block
    }

    // Add the new block at the beginning of the list
    existingBlocks.unshift(newBlock)

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
          id: typeof action.id === "string" ? action.id : String(action.id),
        })),
      )
      setResult(selectedBlock.result || "")
      setPurposes(selectedBlock.purposes || [])
      setSelectedCategory(selectedBlock.categoryId || "")
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
                      <SelectTrigger className="w-10 text-xs p-1">
                        <SelectValue placeholder="Key" />
                      </SelectTrigger>
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
          <Select value={selectedOption} onValueChange={(value) => setSelectedOption(value)}>
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

          {selectedOption === "Category" && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

// Type guard function
function isGroup(data: any): data is Group {
  return "title" in data
}

