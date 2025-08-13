"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Star,
  StarOff,
  Brain,
  Clock,
  FileText,
  Trash2,
  Sparkles,
  BookOpen,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/types/note";
import { generateNoteAI } from "@/lib/ai-notes";
import RichTextEditor from "./rich-text-editor";

interface NotesWidgetProps {
  userId: string;
}

export default function NotesWidget({ userId }: NotesWidgetProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  const supabase = createClient();
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id: userId,
            title: "New Note",
            content: {
              type: "doc",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "" }] },
              ],
            },
            plain_text: "",
          },
        ])
        .select();

      if (error) throw error;

      if (data) {
        const newNote = data[0];
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setIsEditorOpen(true);
      }
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      try {
        const { error } = await supabase
          .from("notes")
          .update(updates)
          .eq("id", noteId);

        if (error) throw error;

        setNotes(
          notes.map((note) =>
            note.id === noteId ? { ...note, ...updates } : note
          )
        );

        if (selectedNote?.id === noteId) {
          setSelectedNote({ ...selectedNote, ...updates });
        }
      } catch (error) {
        console.error("Error updating note:", error);
      }
    },
    [notes, selectedNote, supabase]
  );

  const debouncedUpdate = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        updateNote(noteId, updates);
      }, 1000); // Auto-save after 1 second of inactivity
    },
    [updateNote]
  );

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditorOpen(false);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const toggleFavorite = async (noteId: string, isFavorite: boolean) => {
    await updateNote(noteId, { is_favorite: !isFavorite });
  };

  const generateAISuggestions = async (content: string) => {
    if (!content.trim()) return;

    try {
      const suggestions = await generateNoteAI(content);
      setAiSuggestions(suggestions.suggestions || []);
      setShowAiPanel(true);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.plain_text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">AI Notes</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
            {notes.length} notes
          </Badge>
          <Button
            onClick={createNote}
            disabled={isCreating}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isCreating ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.close()}
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/20"
            title="Close widget"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>

      {/* Notes list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg border bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer"
              onClick={() => {
                setSelectedNote(note);
                setIsEditorOpen(true);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white text-sm truncate flex-1">
                  {note.title}
                </h4>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(note.id, note.is_favorite);
                    }}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-yellow-400"
                  >
                    {note.is_favorite ? (
                      <Star className="h-3 w-3 fill-current" />
                    ) : (
                      <StarOff className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                {note.plain_text || "No content"}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {note.word_count > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{note.word_count} words</span>
                    </div>
                  )}
                  {note.reading_time > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{note.reading_time}min read</span>
                    </div>
                  )}
                </div>
                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
              </div>

              {note.ai_tags && note.ai_tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {note.ai_tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {searchQuery
                  ? "No notes found matching your search"
                  : "No notes yet. Create your first note!"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Note Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl h-[80vh] bg-slate-800 border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">
                <Input
                  value={selectedNote?.title || ""}
                  onChange={(e) => {
                    if (selectedNote) {
                      const newTitle = e.target.value;
                      setSelectedNote({ ...selectedNote, title: newTitle });
                      debouncedUpdate(selectedNote.id, { title: newTitle });
                    }
                  }}
                  className="bg-transparent border-none text-lg font-semibold text-white p-0 h-auto focus-visible:ring-0"
                  placeholder="Note title..."
                />
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    selectedNote &&
                    generateAISuggestions(selectedNote.plain_text || "")
                  }
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI Assist
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex gap-4">
            <div className="flex-1">
              {selectedNote && (
                <RichTextEditor
                  content={selectedNote.content}
                  onChange={(content, plainText) => {
                    const updatedNote = {
                      ...selectedNote,
                      content,
                      plain_text: plainText,
                    };
                    setSelectedNote(updatedNote);
                    debouncedUpdate(selectedNote.id, {
                      content,
                      plain_text: plainText,
                    });
                  }}
                />
              )}
            </div>

            {/* AI Suggestions Panel */}
            {showAiPanel && aiSuggestions.length > 0 && (
              <div className="w-80 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">
                    AI Suggestions
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAiPanel(false)}
                    className="ml-auto h-6 w-6 p-0 text-slate-400"
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 bg-slate-800/50 rounded text-xs text-slate-300"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
