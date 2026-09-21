"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { User } from "@/lib/types";

interface UnfollowConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}

export default function UnfollowConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
}: UnfollowConfirmationDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-pink-400">
            Confirm Unfollow
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-300 mb-4">
            Are you sure you want to unfollow{" "}
            <span className="font-semibold text-white">{user.name}</span>?
          </p>

          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
            <img
              src={user.profilePicture || "/placeholder.svg"}
              alt={user.name}
              className="w-10 h-10 rounded-full bg-gray-700"
            />
            <div>
              <h3 className="font-medium text-white">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="text-xs text-gray-500">
                {user.major} • {user.studentId}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-3">
            You will no longer see their schedule and they will be moved back to
            the discover list.
          </p>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-700 hover:bg-red-600 text-white"
          >
            Unfollow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
