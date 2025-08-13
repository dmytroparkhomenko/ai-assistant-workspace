"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Brain, Clock, CheckCircle2, Trash2, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Todo } from "@/types/todo"
import { generateAISuggestions } from "@/lib/ai-suggestions"

interface TodoWidgetProps {
  userId: string
}

export default function TodoWidget({ userId }: TodoWidgetProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState("")
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error("Error fetching todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) return

    setIsAddingTodo(true)
    try {
      // Generate AI suggestions for the new todo
      const aiSuggestions = await generateAISuggestions(newTodo, todos)

      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            user_id: userId,
            title: newTodo,
            priority: aiSuggestions.suggestedPriority || 2,
            ai_priority_score: aiSuggestions.priorityScore,
            ai_suggestions: aiSuggestions,
            estimated_duration: aiSuggestions.estimatedDuration,
            tags: aiSuggestions.suggestedTags || [],
          },
        ])
        .select()

      if (error) throw error

      if (data) {
        setTodos([data[0], ...todos])
        setNewTodo("")
      }
    } catch (error) {
      console.error("Error adding todo:", error)
    } finally {
      setIsAddingTodo(false)
    }
  }

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("todos").update({ completed }).eq("id", id)

      if (error) throw error

      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed } : todo)))
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) throw error

      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error("Error deleting todo:", error)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case 2:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case 3:
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "High"
      case 2:
        return "Medium"
      case 3:
        return "Low"
      default:
        return "Normal"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">AI Tasks</span>
        </div>
        <Badge variant="secondary" className="bg-slate-700 text-slate-300">
          {todos.filter((t) => !t.completed).length} active
        </Badge>
      </div>

      {/* Add new todo */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
        />
        <Button
          onClick={addTodo}
          disabled={isAddingTodo || !newTodo.trim()}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isAddingTodo ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Todo list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`p-3 rounded-lg border transition-all ${
                todo.completed
                  ? "bg-slate-800/30 border-slate-700/50 opacity-60"
                  : "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) => toggleTodo(todo.id, checked as boolean)}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium text-sm ${todo.completed ? "line-through text-slate-400" : "text-white"}`}
                    >
                      {todo.title}
                    </h4>
                    <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
                      {getPriorityLabel(todo.priority)}
                    </Badge>
                  </div>

                  {todo.ai_suggestions && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Brain className="h-3 w-3" />
                      <span>AI Score: {(todo.ai_priority_score * 100).toFixed(0)}%</span>
                      {todo.estimated_duration && (
                        <>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{todo.estimated_duration}min</span>
                        </>
                      )}
                    </div>
                  )}

                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex gap-1 mb-2">
                      {todo.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-slate-700/50 border-slate-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Dialog open={isDialogOpen && selectedTodo?.id === todo.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        onClick={() => setSelectedTodo(todo)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Task Details</DialogTitle>
                      </DialogHeader>
                      {selectedTodo && (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Title</Label>
                            <Input
                              value={selectedTodo.title}
                              className="bg-slate-700 border-slate-600 text-white"
                              readOnly
                            />
                          </div>
                          {selectedTodo.ai_suggestions && (
                            <div>
                              <Label className="text-slate-300">AI Insights</Label>
                              <div className="bg-slate-700/50 p-3 rounded-lg text-sm text-slate-300">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="h-4 w-4 text-emerald-400" />
                                  <span className="font-medium">AI Analysis</span>
                                </div>
                                <p>Priority Score: {(selectedTodo.ai_priority_score * 100).toFixed(0)}%</p>
                                {selectedTodo.estimated_duration && (
                                  <p>Estimated Duration: {selectedTodo.estimated_duration} minutes</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {todos.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No tasks yet. Add one above!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
