"use client"

import { useRef, useCallback } from "react"
import type { Widget } from "@/types/widget"
import DraggableWidget from "./draggable-widget"

interface WidgetGridProps {
  widgets: Widget[]
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void
  onRemoveWidget: (id: string) => void
}

export default function WidgetGrid({ widgets, onUpdateWidget, onRemoveWidget }: WidgetGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  const handleWidgetMove = useCallback(
    (id: string, position: { x: number; y: number }) => {
      onUpdateWidget(id, { position })
    },
    [onUpdateWidget],
  )

  const handleWidgetResize = useCallback(
    (id: string, size: { width: number; height: number }) => {
      onUpdateWidget(id, { size })
    },
    [onUpdateWidget],
  )

  return (
    <div ref={gridRef} className="relative w-full h-[calc(100vh-120px)] overflow-hidden" style={{ minHeight: "600px" }}>
      {widgets.map((widget) => (
        <DraggableWidget
          key={widget.id}
          widget={widget}
          onMove={handleWidgetMove}
          onResize={handleWidgetResize}
          onRemove={onRemoveWidget}
          onUpdate={onUpdateWidget}
        />
      ))}

      {widgets.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl text-slate-600 mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Your workspace is empty</h3>
            <p className="text-slate-400">Click the menu button to add your first widget</p>
          </div>
        </div>
      )}
    </div>
  )
}
