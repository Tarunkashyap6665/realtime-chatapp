"use client"

import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Database, CloudOff, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useStorage } from "@/contexts/storage-context"

export default function StorageToggle() {
  const { isPersistent, togglePersistence } = useStorage()

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg border">
        <motion.div
          animate={{ scale: isPersistent ? 1 : 0.8, opacity: isPersistent ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {isPersistent ? (
            <Database className="w-4 h-4 text-green-600" />
          ) : (
            <CloudOff className="w-4 h-4 text-orange-600" />
          )}
        </motion.div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="storage-toggle" className="text-sm font-medium cursor-pointer">
            {isPersistent ? "Persistent" : "Temporary"}
          </Label>
          <Switch id="storage-toggle" checked={isPersistent} onCheckedChange={togglePersistence} />
        </div>

        <Tooltip>
          <TooltipTrigger>
            <Info className="w-3 h-3 text-gray-400" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">
              {isPersistent
                ? "Messages are saved to database and persist across sessions"
                : "New messages are temporary and will be cleared when you switch chats"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
