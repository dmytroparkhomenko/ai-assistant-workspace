"use client";

import React from "react";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Widget } from "@/types/widget";
import {
  MoreVertical,
  Minimize2,
  Maximize2,
  X,
  Move,
  Expand,
  Minimize,
} from "lucide-react";
import WidgetContent from "./widget-content";

interface DraggableWidgetProps {
  widget: Widget;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Widget>) => void;
}

export default function DraggableWidget({
  widget,
  onMove,
  onResize,
  onRemove,
  onUpdate,
}: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target !== e.currentTarget &&
        !(e.target as HTMLElement).closest(".widget-header")
      ) {
        return;
      }

      setIsDragging(true);
      setDragStart({
        x: e.clientX - widget.position.x,
        y: e.clientY - widget.position.y,
      });
    },
    [widget.position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragStart.x);
        const newY = Math.max(0, e.clientY - dragStart.y);
        onMove(widget.id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(200, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        onResize(widget.id, { width: newWidth, height: newHeight });
      }
    },
    [
      isDragging,
      isResizing,
      dragStart,
      resizeStart,
      onMove,
      onResize,
      widget.id,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const toggleMinimize = () => {
    onUpdate(widget.id, { isMinimized: !widget.isMinimized });
  };

  const toggleFullScreen = () => {
    onUpdate(widget.id, { isFullScreen: !widget.isFullScreen });
  };

  // Handle escape key to exit full-screen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && widget.isFullScreen) {
        toggleFullScreen();
      }
    };

    if (widget.isFullScreen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [widget.isFullScreen, toggleFullScreen]);

  return (
    <div
      ref={widgetRef}
      className={`absolute select-none ${
        isDragging ? "z-50" : widget.isFullScreen ? "z-40" : "z-10"
      }`}
      style={{
        left: widget.isFullScreen ? 0 : widget.position.x,
        top: widget.isFullScreen ? 0 : widget.position.y,
        width: widget.isFullScreen ? "100vw" : widget.size.width,
        height: widget.isFullScreen
          ? "100vh"
          : widget.isMinimized
          ? "auto"
          : widget.size.height,
      }}
      onDoubleClick={toggleFullScreen}
    >
      <Card
        className={`h-full bg-slate-800/90 backdrop-blur-sm border-slate-700 shadow-xl hover:shadow-2xl transition-all ${
          !widget.isFullScreen
            ? "hover:scale-[1.02] hover:border-slate-600"
            : ""
        }`}
      >
        <CardHeader
          className={`widget-header flex flex-row items-center justify-between space-y-0 pb-2 cursor-move ${
            widget.isFullScreen ? "bg-slate-700/50" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-slate-400" />
            <h3 className="font-semibold text-white text-sm">{widget.title}</h3>
            {widget.isFullScreen && (
              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                Full Screen
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              {widget.isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullScreen}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
              title={
                widget.isFullScreen
                  ? "Exit full-screen (Esc)"
                  : "Enter full-screen"
              }
            >
              {widget.isFullScreen ? (
                <Minimize className="h-3 w-3" />
              ) : (
                <Expand className="h-3 w-3" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuItem
                  onClick={() => onRemove(widget.id)}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {!widget.isMinimized && (
          <CardContent
            className="p-4 h-[calc(100%-60px)] overflow-y-auto cursor-pointer"
            onClick={(e) => {
              // Only trigger full-screen if clicking on the content area, not on interactive elements
              if (
                e.target === e.currentTarget ||
                (e.target as HTMLElement).tagName === "P"
              ) {
                toggleFullScreen();
              }
            }}
          >
            <WidgetContent widget={widget} />
          </CardContent>
        )}

        {/* Resize handles */}
        {!widget.isMinimized && !widget.isFullScreen && (
          <>
            {/* Bottom-right corner */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-slate-600 hover:bg-slate-500 transition-colors"
              style={{
                clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeStart({
                  x: e.clientX,
                  y: e.clientY,
                  width: widget.size.width,
                  height: widget.size.height,
                });
              }}
            />

            {/* Right edge */}
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-e-resize hover:bg-slate-500 transition-colors"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeStart({
                  x: e.clientX,
                  y: e.clientY,
                  width: widget.size.width,
                  height: widget.size.height,
                });
              }}
            />

            {/* Bottom edge */}
            <div
              className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize hover:bg-slate-500 transition-colors"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
                setResizeStart({
                  x: e.clientX,
                  y: e.clientY,
                  width: widget.size.width,
                  height: widget.size.height,
                });
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
