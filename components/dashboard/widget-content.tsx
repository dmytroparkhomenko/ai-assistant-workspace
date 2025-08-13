"use client"

import type { Widget } from "@/types/widget"
import { Calendar, FolderOpen, Sparkles } from "lucide-react"
import TodoWidget from "@/components/widgets/todo-widget"
import NotesWidget from "@/components/widgets/notes-widget"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface WidgetContentProps {
  widget: Widget
}

export default function WidgetContent({ widget }: WidgetContentProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [supabase])

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "todo":
        return userId ? (
          <TodoWidget userId={userId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        )

      case "notes":
        return userId ? (
          <NotesWidget userId={userId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        )

      case "calendar":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Calendar className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Smart Calendar</h3>
            <p className="text-slate-400 text-sm mb-4">
              Intelligent scheduling with conflict detection and AI suggestions
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="h-3 w-3" />
              Coming soon
            </div>
          </div>
        )

      case "files":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FolderOpen className="h-12 w-12 text-orange-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">File Intelligence</h3>
            <p className="text-slate-400 text-sm mb-4">Smart file organization with AI-powered search and tagging</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="h-3 w-3" />
              Coming soon
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Widget content</p>
          </div>
        )
    }
  }

  return <div className="h-full">{renderWidgetContent()}</div>
}
