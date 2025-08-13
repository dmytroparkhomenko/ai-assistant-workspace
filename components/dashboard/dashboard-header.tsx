"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Brain, Menu, Settings, LogOut, Palette } from "lucide-react"
import { signOut } from "@/lib/auth-actions"

interface DashboardHeaderProps {
  user: User
  onToggleSidebar: () => void
}

export default function DashboardHeader({ user, onToggleSidebar }: DashboardHeaderProps) {
  const userInitials = user.email?.charAt(0).toUpperCase() || "U"

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Brain className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Assistant</h1>
              <p className="text-sm text-slate-400">Your intelligent workspace</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
            <Palette className="h-4 w-4 mr-2" />
            Customize
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-600 text-white">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
              <div className="px-2 py-1.5 text-sm text-slate-300">
                <div className="font-medium">{user.email}</div>
              </div>
              <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 hover:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
