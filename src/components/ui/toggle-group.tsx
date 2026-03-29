import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleGroupProps {
  type?: "single" | "multiple"
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

const ToggleGroupContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

function ToggleGroup({ 
  value = "", 
  onValueChange, 
  className, 
  children 
}: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange: onValueChange || (() => {}) }}>
      <div className={cn("inline-flex items-center justify-center rounded-md bg-muted p-1 gap-1", className)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

interface ToggleGroupItemProps {
  value: string
  children: React.ReactNode
  className?: string
  "aria-label"?: string
}

function ToggleGroupItem({ value, children, className, "aria-label": ariaLabel }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  if (!context) throw new Error("ToggleGroupItem must be used within ToggleGroup")
  
  const isActive = context.value === value
  
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-state={isActive ? "on" : "off"}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        className
      )}
    >
      {children}
    </button>
  )
}

export { ToggleGroup, ToggleGroupItem }
