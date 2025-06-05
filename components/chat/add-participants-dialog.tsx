"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Search, Loader2, UserPlus, CheckCircle } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
}

interface AddParticipantsDialogProps {
  open: boolean
  onClose: () => void
  onAddParticipants: (participantIds: string[]) => Promise<void>
  token: string
  existingParticipants: string[]
  chatName: string
}

export default function AddParticipantsDialog({
  open,
  onClose,
  onAddParticipants,
  token,
  existingParticipants,
  chatName,
}: AddParticipantsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const searchUsers = async () => {
    setSearching(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filter out users who are already participants
        const availableUsers = data.users.filter((user: User) => !existingParticipants.includes(user.id))
        setSearchResults(availableUsers)
      } else {
        setError("Failed to search users")
      }
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to search users")
    } finally {
      setSearching(false)
    }
  }

  const addUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchTerm("")
    setSearchResults([])
  }

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId))
  }

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to add")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const participantIds = selectedUsers.map((u) => u.id)
      await onAddParticipants(participantIds)

      setSuccess(
        `Successfully added ${selectedUsers.length} participant${selectedUsers.length > 1 ? "s" : ""} to ${chatName}`,
      )
      setSelectedUsers([])
      setSearchTerm("")
      setSearchResults([])

      // Close dialog after a brief delay to show success message
      setTimeout(() => {
        setSuccess(null)
        onClose()
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to add participants")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedUsers([])
    setSearchTerm("")
    setSearchResults([])
    setError(null)
    setSuccess(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Add Participants to {chatName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Input */}
          <div>
            <Label htmlFor="user-search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="user-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
                disabled={loading}
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => addUser(user)}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-gray-600">{user.email}</div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && !searching && (
              <div className="mt-2 p-3 text-center text-gray-500 text-sm">No available users found</div>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <Label>Selected Users ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                    {user.name}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => removeUser(user.id)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedUsers.length === 0}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    Add {selectedUsers.length} Participant{selectedUsers.length > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
