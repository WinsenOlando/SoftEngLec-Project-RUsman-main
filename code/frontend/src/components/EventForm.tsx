"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EventFormProps {
  selectedDate: Date;
  onClose: () => void;
}

const FOLLOWING = [
  { id: 1, name: "Sarah Johnson" },
  { id: 2, name: "Michael Chen" },
  { id: 3, name: "Emily Wong" },
  { id: 4, name: "David Lee" },
  { id: 5, name: "Anna Kim" },
];

export default function EventForm({ selectedDate, onClose }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [category, setCategory] = useState("Study");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      title,
      date: selectedDate.toISOString().split("T")[0],
      time,
      category,
      participants: selectedParticipants,
    });

    setTitle("");
    setTime("09:00");
    setCategory("Study");
    setSelectedParticipants([]);
    onClose();
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(
      selectedParticipants.includes(id)
        ? selectedParticipants.filter((p) => p !== id)
        : [...selectedParticipants, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-200">
          Event Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add title"
          required
          className="bg-gray-800 border-gray-700 text-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date" className="text-gray-200">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          disabled
          className="bg-gray-800 border-gray-700 text-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time" className="text-gray-200">
          Time
        </Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-gray-800 border-gray-700 text-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-gray-200">
          Category
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="Study" className="text-pink-300">
              Study
            </SelectItem>
            <SelectItem value="Work" className="text-pink-300">
              Work
            </SelectItem>
            <SelectItem value="Social" className="text-pink-300">
              Social
            </SelectItem>
            <SelectItem value="Personal" className="text-pink-300">
              Personal
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-200">Invite Participants</Label>
        <div className="bg-gray-800 border border-gray-700 rounded-md p-2 max-h-32 overflow-y-auto">
          {FOLLOWING.map((person) => (
            <div key={person.id} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={`person-${person.id}`}
                checked={selectedParticipants.includes(person.id)}
                onCheckedChange={() => toggleParticipant(person.id)}
                className="border-gray-600 data-[state=checked]:bg-pink-600"
              />
              <Label
                htmlFor={`person-${person.id}`}
                className="text-sm text-gray-300 cursor-pointer"
              >
                {person.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-gray-700 hover:bg-gray-800 text-gray-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-pink-700 hover:bg-pink-600 text-white"
        >
          Save Event
        </Button>
      </div>
    </form>
  );
}
