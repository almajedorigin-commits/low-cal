import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SplitButtonProps {
  mainAction: () => void
  mainLabel: string
  mainIcon?: React.ReactNode
  dropdownItems?: {
    label: string
    action: () => void
    icon?: React.ReactNode
  }[]
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SplitButton({
  mainAction,
  mainLabel,
  mainIcon,
  dropdownItems = [],
  variant = "default",
  size = "default",
  className = ""
}: SplitButtonProps) {
  return (
    <div className="flex gap-0 rounded-md overflow-hidden shadow-sm">
      <Button
        onClick={mainAction}
        variant={variant}
        size={size}
        className={`rounded-r-none ${className}`}
      >
        {mainIcon && <span className="mr-2">{mainIcon}</span>}
        {mainLabel}
      </Button>
      
      {dropdownItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className="rounded-l-none border-l-0 px-2"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            {dropdownItems.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={item.action}
                className="flex items-center gap-2"
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}