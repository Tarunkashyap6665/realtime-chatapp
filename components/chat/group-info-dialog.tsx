"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Crown,
  Calendar,
  MoreVertical,
  UserMinus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chat } from "@/lib/models";
import PresenceIndicator from "./presence-indicator";

interface GroupInfoDialogProps {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  currentUserId: string;
  onAddParticipants: () => void;
  onRemoveParticipant?: (participantId: string) => void;
}

export default function GroupInfoDialog({
  open,
  onClose,
  chat,
  currentUserId,
  onAddParticipants,
  onRemoveParticipant,
}: GroupInfoDialogProps) {
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  const isCreator = chat.createdBy === currentUserId;
  const participants = chat.participantDetails || [];
  const displayedParticipants = showAllParticipants
    ? participants
    : participants.slice(0, 5);

  const handleRemoveParticipant = (
    participantId: string,
    participantName: string
  ) => {
    if (confirm(`Remove ${participantName} from this group?`)) {
      onRemoveParticipant?.(participantId);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Group Info</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Details */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">{chat.name}</h3>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="default">Group Chat</Badge>
              <Badge variant="outline">
                {participants.length} member
                {participants.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 flex items-center justify-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDate(chat.createdAt)}</span>
            </p>
          </div>

          {/* Participants Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Participants</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddParticipants}
                className="flex items-center space-x-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>Add</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {displayedParticipants.map((participant) => {
                const isCurrentUser = participant._id === currentUserId;
                const isParticipantCreator = participant._id === chat.createdBy;

                return (
                  <div
                    key={participant._id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {participant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          <PresenceIndicator
                            isOnline={participant.isOnline || false}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">
                            {participant.name}
                            {isCurrentUser && " (You)"}
                          </p>
                          {isParticipantCreator && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {participant.email}
                        </p>
                      </div>
                    </div>

                    {/* Actions for non-current users */}
                    {!isCurrentUser &&
                      (isCreator || isCurrentUser) &&
                      onRemoveParticipant && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveParticipant(
                                  participant._id!,
                                  participant.name
                                )
                              }
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove from group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                );
              })}

              {/* Show More/Less Button */}
              {participants.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllParticipants(!showAllParticipants)}
                  className="w-full"
                >
                  {showAllParticipants
                    ? "Show Less"
                    : `Show ${participants.length - 5} More Participant${
                        participants.length - 5 !== 1 ? "s" : ""
                      }`}
                </Button>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
