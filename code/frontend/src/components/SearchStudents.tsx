"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample student data
const STUDENTS = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@binus.ac.id",
    department: "Computer Science",
    year: "2021",
    following: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.c@binus.ac.id",
    department: "Information Systems",
    year: "2022",
    following: false,
  },
  {
    id: 3,
    name: "Emily Wong",
    email: "emily.w@binus.ac.id",
    department: "Design",
    year: "2023",
    following: true,
  },
  {
    id: 4,
    name: "David Lee",
    email: "david.l@binus.ac.id",
    department: "Business",
    year: "2021",
    following: false,
  },
  {
    id: 5,
    name: "Anna Kim",
    email: "anna.k@binus.ac.id",
    department: "Computer Science",
    year: "2022",
    following: true,
  },
];

const DEPARTMENTS = [
  "All Departments",
  "Computer Science",
  "Information Systems",
  "Design",
  "Business",
  "Engineering",
];

export default function SearchStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [students, setStudents] = useState(STUDENTS);

  const handleFollow = (id: number) => {
    setStudents(
      students.map((student) =>
        student.id === id
          ? { ...student, following: !student.following }
          : student
      )
    );
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      department === "All Departments" || student.department === department;

    return matchesSearch && matchesDepartment;
  });

  return (
    <Card className="border-gray-800 bg-gray-900 text-gray-100 shadow-xl">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-pink-400">Search Students</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full md:w-[200px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {DEPARTMENTS.map((dept) => (
                <SelectItem
                  key={dept}
                  value={dept}
                  className="text-white hover:bg-gray-700"
                >
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                <div>
                  <h3 className="font-medium text-white">{student.name}</h3>
                  <p className="text-sm text-gray-400">{student.email}</p>
                  <div className="text-xs text-gray-500">
                    {student.department} • {student.year}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:bg-gray-800 text-white"
                  onClick={() =>
                    window.alert(`View ${student.name}'s schedule`)
                  }
                >
                  View Schedule
                </Button>
                <Button
                  size="sm"
                  className={
                    student.following
                      ? "bg-pink-800 hover:bg-pink-700"
                      : "bg-pink-600 hover:bg-pink-500"
                  }
                  onClick={() => handleFollow(student.id)}
                >
                  {student.following ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
