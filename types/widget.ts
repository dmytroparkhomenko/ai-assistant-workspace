export type WidgetType = "todo" | "notes" | "calendar" | "files"

export interface Widget {
  id: string
  type: WidgetType
  title: string
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  isMinimized: boolean
  data?: any
}
