"use client"

import { useEffect, useState } from "react"

interface TerminalPostProps {
  category: string
  date: string
  title: string
  content: string
  onEdit?: () => void
  onDelete?: () => void
}

export function TerminalPost({ category, date, title, content, onEdit, onDelete }: TerminalPostProps) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("es-ES", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-black p-6 font-mono text-green-400 rounded-none shadow-lg animate-pulse-border">
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-400 to-green-600 rounded-none opacity-60 animate-gradient-shift"></div>
      <div className="absolute inset-[2px] bg-black rounded-none"></div>

      {/* Content container */}
      <div className="relative z-10">
        {/* System prompt line with time */}
        <div className="mb-2">
          <span className="text-green-300">
            [AIFeed@{date} {currentTime} ~]$
          </span>{" "}
          <span className="text-green-400">{category}</span>
        </div>

        {/* User prompt with title */}
        <div className="mb-4">
          <span className="text-green-300">{">"}</span> <span className="text-green-100 font-bold">{title}</span>
        </div>

        {/* Content as system response */}
        <div className="mb-6 pl-2 border-l-2 border-green-400/30">
          <div className="text-green-200 leading-relaxed whitespace-pre-wrap">{content}</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 pt-2 border-t border-green-400/30">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-green-400 hover:text-green-300 hover:underline transition-colors duration-200 cursor-pointer"
            >
              [editar]
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-green-400 hover:text-green-300 hover:underline transition-colors duration-200 cursor-pointer"
            >
              [borrar]
            </button>
          )}
        </div>

        {/* Cursor blink effect */}
        <div className="mt-2">
          <span className="text-green-400 animate-pulse">█</span>
        </div>
      </div>
    </div>
  )
}
