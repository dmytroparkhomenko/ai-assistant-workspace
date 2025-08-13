"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import DashboardHeader from "./dashboard-header"
import WidgetGrid from "./widget-grid"
import WidgetSidebar from "./widget-sidebar"
import type { Widget, WidgetType } from "@/types/widget"

interface DashboardLayoutProps {
  user: User
}

export default function DashboardLayout({ user }: DashboardLayoutProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "todo-1",
      type: "todo",
      title: "My Tasks",
      position: { x: 0, y: 0 },
      size: { width: 400, height: 300 },
      isMinimized: false,
    },
    {
      id: "notes-1",
      type: "notes",
      title: "Quick Notes",
      position: { x: 420, y: 0 },
      size: { width: 400, height: 300 },
      isMinimized: false,
    },
    {
      id: "calendar-1",
      type: "calendar",
      title: "Calendar",
      position: { x: 0, y: 320 },
      size: { width: 400, height: 300 },
      isMinimized: false,
    },
    {
      id: "files-1",
      type: "files",
      title: "File Manager",
      position: { x: 420, y: 320 },
      size: { width: 400, height: 300 },
      isMinimized: false,
    },
  ])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      size: { width: 400, height: 300 },
      isMinimized: false,
    }
    setWidgets([...widgets, newWidget])
  }

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map((widget) => (widget.id === id ? { ...widget, ...updates } : widget)))
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== id))
  }

  const getWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case "todo":
        return "Tasks"
      case "notes":
        return "Notes"
      case "calendar":
        return "Calendar"
      case "files":
        return "Files"
      default:
        return "Widget"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5"></div>

      <div className="relative z-10">
        <DashboardHeader user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <WidgetSidebar isOpen={sidebarOpen} onAddWidget={addWidget} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6">
            <WidgetGrid widgets={widgets} onUpdateWidget={updateWidget} onRemoveWidget={removeWidget} />
          </main>
        </div>
      </div>
    </div>
  )
}
