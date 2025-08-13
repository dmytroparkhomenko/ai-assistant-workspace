"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, FileText, Calendar, FolderOpen, X, Plus } from "lucide-react"
import type { WidgetType } from "@/types/widget"

interface WidgetSidebarProps {
  isOpen: boolean
  onAddWidget: (type: WidgetType) => void
  onClose: () => void
}

const widgetTypes = [
  {
    type: "todo" as WidgetType,
    title: "Todo List",
    description: "AI-powered task management",
    icon: CheckSquare,
    color: "text-emerald-400",
  },
  {
    type: "notes" as WidgetType,
    title: "Notes",
    description: "Rich text editor with AI",
    icon: FileText,
    color: "text-cyan-400",
  },
  {
    type: "calendar" as WidgetType,
    title: "Calendar",
    description: "Smart scheduling assistant",
    icon: Calendar,
    color: "text-purple-400",
  },
  {
    type: "files" as WidgetType,
    title: "File Manager",
    description: "Intelligent file organization",
    icon: FolderOpen,
    color: "text-orange-400",
  },
]

export default function WidgetSidebar({ isOpen, onAddWidget, onClose }: WidgetSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="w-80 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Add Widgets</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {widgetTypes.map((widget) => {
          const Icon = widget.icon
          return (
            <Card
              key={widget.type}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer"
              onClick={() => onAddWidget(widget.type)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${widget.color}`} />
                  <CardTitle className="text-sm text-white">{widget.title}</CardTitle>
                  <Plus className="h-4 w-4 text-slate-400 ml-auto" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-slate-400 text-xs">{widget.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
        <h3 className="text-sm font-medium text-white mb-2">Pro Tip</h3>
        <p className="text-xs text-slate-400">
          Drag widgets around to organize your workspace. Right-click for more options.
        </p>
      </div>
    </div>
  )
}
