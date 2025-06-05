"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Search, Loader2, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateChat: (
    name: string,
    type: "personal" | "group",
    participants: string[]
  ) => Promise<void>;
  token: string;
}

export default function CreateChatDialog({
  open,
  onClose,
  onCreateChat,
  token,
}: CreateChatDialogProps) {
  const [chatName, setChatName] = useState("");
  const [chatType, setChatType] = useState<"personal" | "group">("personal");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const addUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (chatType === "personal" && selectedUsers.length !== 1) {
      setError("Please select exactly one user for a personal chat");
      return;
    }

    if (
      chatType === "group" &&
      (!chatName.trim() || selectedUsers.length < 1)
    ) {
      setError("Please enter a group name and select at least one participant");
      return;
    }

    setLoading(true);

    try {
      const name =
        chatType === "personal" ? selectedUsers[0].name : chatName.trim();
      const participants = selectedUsers.map((u) => u.id);

      await onCreateChat(name, chatType, participants);

      // Reset form
      setChatName("");
      setChatType("personal");
      setSelectedUsers([]);
      setSearchTerm("");
      setSearchResults([]);
      setError(null);
      onClose();
    } catch (error: any) {
      // Handle specific error for duplicate group names
      if (error.message?.includes("group chat with this name already exists")) {
        setError(
          "A group chat with this name already exists. Please choose a different name."
        );
      } else {
        setError(error.message || "Failed to create chat");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setChatName("");
    setChatType("personal");
    setSelectedUsers([]);
    setSearchTerm("");
    setSearchResults([]);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Type Selection */}
          <div>
            <Label htmlFor="chat-type">Chat Type</Label>
            <Select
              value={chatType}
              onValueChange={(value: "personal" | "group") =>
                setChatType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Chat</SelectItem>
                <SelectItem value="group">Group Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Name Input */}
          {chatType === "group" && (
            <div>
              <Label htmlFor="chat-name">Group Name</Label>
              <Input
                id="chat-name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter group name"
                required
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                {chatName.length}/50 characters
              </p>
            </div>
          )}

          {/* User Search */}
          <div>
            <Label htmlFor="user-search">
              {chatType === "personal" ? "Find User" : "Add Participants"}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="user-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
                disabled={chatType === "personal" && selectedUsers.length == 1}
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
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <Label>Selected Users</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {user.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeUser(user.id)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (chatType === "personal" && selectedUsers.length !== 1) ||
                (chatType === "group" &&
                  (!chatName.trim() || selectedUsers.length < 2))
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Chat"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
