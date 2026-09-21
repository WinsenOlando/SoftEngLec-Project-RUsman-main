"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { User, Schedule } from "@/lib/types"
import EventCreationForm from "@/components/EventCreationForm"
import ScheduleLegend from "@/components/ScheduleLegend"
import ScheduleDetailPopup from "./ScheduleDetailPopup"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ScheduleViewProps {
  schedules: Schedule[]
  currentView: "day" | "week" | "month"
  setCurrentView: (view: "day" | "week" | "month") => void
  currentDate: Date
  setCurrentDate: (date: Date) => void
  selectedFriends: User[]
  currentUser: User
  following: User[]
  mutualFollow: User[]
}

// Full 24-hour time slots (00:00 to 23:00)
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})

// Days of the week labels
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

/**
 * Hati‐hati: Tailwind "h-14" = 3.5rem = 56px, bukan 14px
 *           Tailwind "h-16" = 4rem   = 64px
 *
 * Jadi untuk week view, setiap baris slot ("h-14") sebenarnya 56 px tingginya.
 */
const TIME_SLOT_HEIGHT = 56 // px per jam di week view (harus sama dengan h-14)
const DAY_SLOT_HEIGHT = 64 // px per jam di day view  (harus sama dengan h-16)

// Add this style object at the top of the component
const getEventStyle = (event: any, isHovered: boolean) => ({
  backgroundColor: event.color + "33",
  borderColor: event.color + "66",
  boxShadow: isHovered ? `0 8px 25px ${event.color}40, 0 0 0 2px ${event.color}80` : `0 2px 8px ${event.color}20`,
})

export default function ScheduleView({
  schedules,
  currentView,
  setCurrentView,
  currentDate,
  setCurrentDate,
  selectedFriends,
  currentUser,
  following,
  mutualFollow,
}: ScheduleViewProps) {
  const [showEventForm, setShowEventForm] = useState(false)
  const [initialScrollDone, setInitialScrollDone] = useState(false)
  const [showDetailPopup, setShowDetailPopup] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<(Schedule & { user?: User }) | null>(null)
  const [localSchedules, setLocalSchedules] = useState(schedules)

  // Refs untuk auto‐scroll
  const weekScrollRef = useRef<HTMLDivElement>(null)
  const dayScrollRef = useRef<HTMLDivElement>(null)

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)

  const [events, setEvents] = useState<Schedule[]>(schedules)

  // State untuk pre‐fill EventCreationForm
  const [eventFormData, setEventFormData] = useState<{
    date: Date
    startTime: string
    endTime: string
  } | null>(null)

  // Update localSchedules when schedules prop changes
  useEffect(() => {
    setLocalSchedules(schedules)
  }, [schedules])

  // Function to refresh schedules
  const refreshSchedules = async () => {
    const response = await fetch("http://localhost:8888/get-schedules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
      }),
    })

    const data = await response.json()
    setLocalSchedules(data)
  }

  // Set initialScrollDone = false saat view atau date berubah
  useEffect(() => {
    setInitialScrollDone(false)
  }, [currentView, currentDate])

  // Auto‐scroll ke "waktu sekarang" jika melihat hari ini
  useEffect(() => {
    if (initialScrollDone) return

    const scrollToCurrentTime = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const isViewingToday = isSameDay(currentDate, now)

      if (isViewingToday) {
        if (currentView === "week" && weekScrollRef.current) {
          // scrollTop = (hour − 2) × HEIGHT_PER_HOUR
          const scrollHour = Math.max(0, currentHour - 2)
          weekScrollRef.current.scrollTop = scrollHour * TIME_SLOT_HEIGHT
        } else if (currentView === "day" && dayScrollRef.current) {
          const scrollHour = Math.max(0, currentHour - 2)
          dayScrollRef.current.scrollTop = scrollHour * DAY_SLOT_HEIGHT
        }
      } else {
        // Default ke jam 08:00
        const businessHour = 8
        if (currentView === "week" && weekScrollRef.current) {
          weekScrollRef.current.scrollTop = businessHour * TIME_SLOT_HEIGHT
        } else if (currentView === "day" && dayScrollRef.current) {
          dayScrollRef.current.scrollTop = businessHour * DAY_SLOT_HEIGHT
        }
      }
      setInitialScrollDone(true)
    }

    const timer = setTimeout(scrollToCurrentTime, 100)
    return () => clearTimeout(timer)
  }, [currentView, currentDate, initialScrollDone])

  // == popup detail handlers ==
  const handleEventClick = (event: Schedule & { user?: User }) => {
    setSelectedEvent(event)
    setShowDetailPopup(true)
  }
  const handleEventDeleted = (deletedId: string) => {
    setShowDetailPopup(false)
    setSelectedEvent(null)
  }

  const handleEventUpdated = (updatedEvent) => {
    setSelectedEvent(updatedEvent)
    setEvents((events) => events.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev)))
  }

  // Navigasi “Today”, “<-“, “->”
  const goToToday = () => {
    setCurrentDate(new Date())
    setInitialScrollDone(false)
  }
  const goToPrevious = () => {
    if (currentView === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (currentView === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (currentView === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }
  const goToNext = () => {
    if (currentView === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (currentView === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (currentView === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  // Judul range (header)
  const getDateRange = () => {
    if (currentView === "day") {
      return format(currentDate, "MMMM d, yyyy")
    } else if (currentView === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(start, "MMMM d")}-${format(end, "d, yyyy")}`
    } else if (currentView === "month") {
      return format(currentDate, "MMMM yyyy")
    }
    return ""
  }

  // Ambil events per‐slot (untuk menampilkan "garis merah" current time)
  const getEventsForTimeSlot = (date: Date, timeSlot: string, schedules: Schedule[]) => {
    const targetDateStr = format(date, "yyyy-MM-dd")

    // Convert "HH:00" → menit
    const [slotHours, slotMinutes] = timeSlot.split(":").map(Number)
    const slotTotalMinutes = slotHours * 60 + slotMinutes

    return schedules.filter((event) => {
      // Ambil tanggal dari event tanpa zona (potong 10 karakter "YYYY-MM-DD")
      const evDateStr = event.startTime.slice(0, 10) // misal "2025-06-03"
      if (evDateStr !== targetDateStr) return false

      // Ambil jam & menit literal dari string
      const timePartStart = event.startTime.slice(11) // misal "11:20:00.000" atau "11:20:00.000Z"
      const [hStart, mStart] = timePartStart.split(":").map((s) => Number.parseInt(s, 10))
      const timePartEnd = event.endTime.slice(11)
      const [hEnd, mEnd] = timePartEnd.split(":").map((s) => Number.parseInt(s, 10))

      const startTotalMinutes = hStart * 60 + mStart
      let endTotalMinutes = hEnd * 60 + mEnd
      if (endTotalMinutes <= startTotalMinutes) {
        endTotalMinutes += 24 * 60
      }

      return slotTotalMinutes >= startTotalMinutes && slotTotalMinutes < endTotalMinutes
    })
  }

  // Ambil events untuk satu hari di month view
  const getEventsForDay = (date: Date, schedules: Schedule[]) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const dayNum = date.getDate()

    return schedules.flatMap((sch) => {
      const evStartDateStr = sch.startTime.slice(0, 10)
      const evStart = sch.startTime.slice(0, 10).split("-").map(Number) // [YYYY,MM,DD]
      const evEnd = sch.endTime.slice(0, 10).split("-").map(Number)
      const [sY, sM, sD] = evStart
      const [eY, eM, eD] = evEnd

      const startsOnDay = sY === year && sM - 1 === month && sD === dayNum
      const endsOnDay = eY === year && eM - 1 === month && eD === dayNum

      // Multi‐day check:
      const evStartObj = new Date(sY, sM - 1, sD)
      const evEndObj = new Date(eY, eM - 1, eD).getTime() + 24 * 60 * 60 * 1000
      const dayObj = new Date(year, month, dayNum).getTime()
      const spansMid = evStartObj.getTime() < dayObj && evEndObj > dayObj

      if (startsOnDay || endsOnDay || spansMid) {
        return { ...sch }
      }
      return []
    })
  }

  function getPositionedEvents(events: Schedule[]) {
    if (events.length === 0) return []

    const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    const positioned: Array<Schedule & { col: number; totalCols: number; width: number; left: number }> = []

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]
      const currentStart = new Date(current.startTime).getTime()
      const currentEnd = new Date(current.endTime).getTime()

      // Find all events that overlap with the current event
      const overlapping = positioned.filter((positioned) => {
        const posStart = new Date(positioned.startTime).getTime()
        const posEnd = new Date(positioned.endTime).getTime()
        return (currentStart < posEnd && currentEnd > posStart) || (posStart < currentEnd && posEnd > currentStart)
      })

      // Find the first available column
      const usedColumns = overlapping.map((e) => e.col)
      let col = 0
      while (usedColumns.includes(col)) {
        col++
      }

      // Calculate total columns needed for this group
      const maxCol = Math.max(col, ...overlapping.map((e) => e.col))
      const totalCols = maxCol + 1

      // Update totalCols for all overlapping events
      overlapping.forEach((event) => {
        event.totalCols = Math.max(event.totalCols, totalCols)
      })

      // Calculate width and position
      const width = Math.max(95 / totalCols, 25) // Minimum 25% width
      const left = (col * 100) / totalCols // Leave some margin

      positioned.push({
        ...current,
        col,
        totalCols,
        width,
        left,
      })
    }

    // Final pass to ensure all overlapping events have consistent totalCols
    positioned.forEach((event) => {
      const overlapping = positioned.filter((other) => {
        if (other.id === event.id) return false
        const eventStart = new Date(event.startTime).getTime()
        const eventEnd = new Date(event.endTime).getTime()
        const otherStart = new Date(other.startTime).getTime()
        const otherEnd = new Date(other.endTime).getTime()
        return eventStart < otherEnd && eventEnd > otherStart
      })

      if (overlapping.length > 0) {
        const maxTotalCols = Math.max(event.totalCols, ...overlapping.map((e) => e.totalCols))
        event.totalCols = maxTotalCols
        overlapping.forEach((e) => (e.totalCols = maxTotalCols))

        // Recalculate width and position with updated totalCols
        event.width = Math.max(95 / event.totalCols, 25)
        event.left = (event.col * 100) / event.totalCols
      }
    })

    return positioned
  }

  // Ambil events untuk satu hari di day view
  const getEventsForSelectedDay = (date: Date, schedules: Schedule[]) => {
    const targetDateStr = format(date, "yyyy-MM-dd")
    return schedules.filter((sch) => sch.startTime.slice(0, 10) === targetDateStr)
  }

  const getDateForDay = (dayIndex: number) => {
    const date = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), dayIndex)
    return format(date, "MMM d, yyyy")
  }
  const isToday = (date: Date) => isSameDay(date, new Date())

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    if (currentView === "month") {
      setCurrentView("day")
    }
  }

  const handleGroupWorkTimeSlotClick = (day: string, startTime: string, endTime: string) => {
    const today = new Date()
    const todayName = format(today, "EEEE")
    const daysArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const todayIdx = daysArr.indexOf(todayName)
    const tgtIdx = daysArr.indexOf(day)

    let delta = tgtIdx - todayIdx
    if (delta <= 0) delta += 7
    const eventDate = addDays(today, delta)

    setEventFormData({
      date: eventDate,
      startTime,
      endTime,
    })
    setShowEventForm(true)
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows: JSX.Element[] = []
    let days: JSX.Element[] = []
    let dayPointer = startDate

    // Header nama hari
    const dayHeaders = DAYS_OF_WEEK.map((d) => (
      <div key={`h-${d}`} className="h-10 flex items-center justify-center font-semibold text-pink-300">
        {d}
      </div>
    ))

    while (dayPointer <= endDate) {
      for (let i = 0; i < 7; i++) {
        const thisDay = dayPointer
        const dayEv = getEventsForDay(thisDay, schedules)
        const isCurrMonth = isSameMonth(thisDay, monthStart)

        days.push(
          <div
            key={thisDay.toString()}
            className={`min-h-[100px] p-1 border border-gray-800 transition-colors hover:bg-pink-950/30 cursor-pointer relative ${
              isToday(thisDay) ? "bg-pink-950/20" : ""
            } ${!isCurrMonth ? "opacity-40" : ""}`}
            onClick={() => handleDayClick(thisDay)}
          >
            <div className="flex justify-between">
              <span className={`font-medium text-sm ${isToday(thisDay) ? "text-pink-400" : ""}`}>
                {format(thisDay, "d")}
              </span>
              <span className="text-xs text-gray-500">{format(thisDay, "MMM yyyy")}</span>
            </div>
            <div className="mt-1 space-y-1">
              {dayEv.slice(0, 3).map((ev, idx) => (
                <div
                  key={idx}
                  className="text-xs truncate rounded px-1 py-0.5 text-white"
                  style={{ backgroundColor: ev.color + "66" }}
                  onClick={() => handleEventClick(ev)}
                >
                  {ev.title.split(":")[1] || ev.title}
                </div>
              ))}
              {dayEv.length > 3 && <div className="text-xs text-pink-400">+{dayEv.length - 3} more</div>}
            </div>
          </div>,
        )

        dayPointer = addDays(dayPointer, 1)
      }

      rows.push(
        <div key={`row-${dayPointer}`} className="grid grid-cols-7">
          {days}
        </div>,
      )
      days = []
    }

    return (
      <div className="overflow-auto">
        <div className="grid grid-cols-7">{dayHeaders}</div>
        {rows}
      </div>
    )
  }

  // =========================
  // RENDER WEEK VIEW (perbaikan)
  // =========================
  const renderWeekView = () => {
    return (
      <div className="h-[calc(100vh-320px)] overflow-hidden flex flex-col">
        {/* HEADER NAMA HARI, STICKY */}
        <div className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800 flex">
          <div className="w-16 h-10 bg-gray-900 border-r border-gray-800 flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-7">
            {DAYS_OF_WEEK.map((dayLabel, idx) => {
              const d = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), idx)
              return (
                <div
                  key={dayLabel}
                  className={`h-10 flex flex-col items-center justify-center ${isToday(d) ? "bg-pink-900/20" : ""}`}
                >
                  <div className="font-medium text-pink-300">{dayLabel}</div>
                  <div className="text-xs text-gray-400">{getDateForDay(idx)}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* KONTEN JAM, SCROLLABLE */}
        <div ref={weekScrollRef} className="overflow-y-auto max-h-[calc(100vh-370px)]">
          <div className="flex">
            {/* KOLOM JAM (00:00–23:00) */}
            <div className="w-16 bg-gray-900 border-r border-gray-800 flex-shrink-0 sticky left-0 z-10">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="h-14 border-b border-gray-800 relative">
                  <div className="absolute -top-[9px] left-2 text-xs text-gray-400">{time}</div>
                </div>
              ))}
            </div>

            {/* KOLOM 7 HARI */}
            <div className="flex-1 grid grid-cols-7">
              {DAYS_OF_WEEK.map((dayLabel, dayIndex) => {
                const columnDate = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), dayIndex)
                const columnDateStr = format(columnDate, "yyyy-MM-dd")

                return (
                  <div key={dayLabel} className="col-span-1 relative">
                    {/* 1) Render baris slot jam sebagai background */}
                    {TIME_SLOTS.map((time) => {
                      // cek apakah ini slot jam saat ini (red line)
                      const now = new Date()
                      const jakartaHour = (now.getUTCHours() + 7) % 24
                      const jakartaMinute = now.getUTCMinutes()
                      const isCurrentSlot =
                        isToday(columnDate) && jakartaHour === Number.parseInt(time.split(":")[0], 10)

                      return (
                        <div
                          key={`${dayLabel}-${time}`}
                          className={`h-14 border-b border-r border-gray-800 ${
                            isToday(columnDate) ? "bg-pink-900/5" : ""
                          }`}
                        >
                          {isCurrentSlot && (
                            <div
                              className="absolute left-0 right-0 border-t-2 border-pink-500 z-10"
                              style={{
                                top: `${((jakartaHour + jakartaMinute / 60) / 24) * 100}%`,
                              }}
                            >
                              <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-pink-500"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* 2) Render overlay event untuk hari ini */}
                    {getPositionedEvents(schedules.filter((ev) => ev.startTime.slice(0, 10) === columnDateStr)).map(
                      (ev) => {
                        const [hS, mS] = ev.startTime
                          .slice(11)
                          .split(":")
                          .map((s) => Number.parseInt(s, 10))
                        const [hE, mE] = ev.endTime
                          .slice(11)
                          .split(":")
                          .map((s: string) => Number.parseInt(s, 10))
                        const startTotalMin = hS * 60 + mS
                        let endTotalMin = hE * 60 + mE
                        if (endTotalMin <= startTotalMin) endTotalMin += 24 * 60
                        const durationMin = endTotalMin - startTotalMin

                        const topPx = (startTotalMin / 60) * TIME_SLOT_HEIGHT
                        const heightPx = (durationMin / 60) * TIME_SLOT_HEIGHT
                        const isHovered = hoveredEventId === ev.id

                        return (
                          <div
                            key={ev.id}
                            className={
                              "absolute rounded overflow-hidden flex flex-col border border-opacity-30 transition-all duration-200" +
                              (isHovered
                                ? " shadow-2xl ring-2 ring-cyan-400 z-20 scale-105"
                                : " hover:shadow-lg hover:z-10")
                            }
                            style={{
                              top: `${topPx}px`,
                              height: `${Math.max(heightPx, 20)}px`, // Minimum height
                              width: `${ev.width}%`,
                              left: `${ev.left}%`,
                              backgroundColor: ev.color + "33",
                              borderColor: ev.color + "66",
                              zIndex: isHovered ? 20 : 5 + ev.col, // Layer based on column
                            }}
                            onMouseEnter={() => setHoveredEventId(ev.id)}
                            onMouseLeave={() => setHoveredEventId(null)}
                            onClick={() => handleEventClick(ev)}
                          >
                            <div className="p-1 text-xs overflow-hidden">
                              <div className="font-medium truncate" style={{ color: ev.color }} title={ev.title}>
                                {ev.title}
                              </div>
                              {heightPx > 30 && (
                                <div className="text-[10px] text-gray-300 truncate" title={ev.description}>
                                  {ev.description}
                                </div>
                              )}
                              {heightPx > 45 && (
                                <div className="text-[9px] text-gray-400 mt-1">{ev.startTime.slice(11, 16)}</div>
                              )}
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // RENDER DAY VIEW (hanya sedikit update)
  // =========================
  const renderDayView = () => {
    const dayEvents = getEventsForSelectedDay(currentDate, schedules)
    const dayName = format(currentDate, "EEEE")

    return (
      <div className="h-[calc(100vh-320px)] overflow-hidden flex flex-col">
        {/* Header hari */}
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 grid grid-cols-[auto_1fr]">
          <div className="h-10 bg-gray-900 border-r border-gray-800"></div>
          <div className={`h-10 flex items-center justify-center ${isToday(currentDate) ? "bg-pink-900/20" : ""}`}>
            <div className="font-medium text-pink-300">
              {dayName} ({format(currentDate, "MMMM d")})
            </div>
          </div>
        </div>

        {/* Grid jam, scrollable */}
        <div ref={dayScrollRef} className="overflow-auto flex-1">
          <div className="grid grid-cols-[auto_1fr] min-w-[600px]">
            {/* Kolom label jam */}
            <div className="bg-gray-900 border-r border-gray-800 w-16">
              {TIME_SLOTS.map((time, idx) => (
                <div key={time} className="h-16 border-b border-gray-800 relative">
                  <div className="absolute -top-[9px] left-2 text-xs text-gray-400">
                    {idx === 0 ? (
                      <span>
                        00:00
                        <br />
                        {format(currentDate, "MMM d, yyyy")}
                      </span>
                    ) : (
                      time
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Kolom event harian */}
            <div>
              {TIME_SLOTS.map((time) => {
                const [slotH] = time.split(":").map(Number)

                // Cari event yang jamnya cocok di slot ini
                const hits = dayEvents.filter((ev) => {
                  // Ambil jam/menit mulai & akhir literal
                  const timeStart = ev.startTime.slice(11)

                  const [hS, mS] = timeStart.split(":").map((s) => Number.parseInt(s, 10))
                  const timeEnd = ev.endTime.slice(11)
                  const [hE, mE] = timeEnd.split(":").map((s) => Number.parseInt(s, 10))

                  const startMin = hS * 60 + mS
                  let endMin = hE * 60 + mE
                  if (endMin <= startMin) endMin += 24 * 60

                  // Jika slotH (jam integer) berada di antara startMin/60 dan endMin/60
                  return hS <= slotH && endMin / 60 > slotH
                })

                return (
                  <div
                    key={time}
                    className={`h-16 border-b border-gray-800 relative ${
                      isToday(currentDate) && new Date().getHours() === slotH ? "bg-pink-900/10" : ""
                    }`}
                  >
                    {/* Indicator red line untuk jam sekarang */}
                    {isToday(currentDate) && new Date().getHours() === slotH && (
                      <div
                        className="absolute left-0 right-0 border-t-2 border-pink-500 z-10"
                        style={{
                          top: `${(new Date().getMinutes() / 60) * 100}%`,
                        }}
                      >
                        <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-pink-500"></div>
                      </div>
                    )}

                    {/* Render events that overlap this time slot */}
                    {getPositionedEvents(
                      dayEvents.filter((ev) => {
                        const timeStart = ev.startTime.slice(11)
                        const [hS, mS] = timeStart.split(":").map((s) => Number.parseInt(s, 10))
                        const timeEnd = ev.endTime.slice(11)
                        const [hE, mE] = timeEnd.split(":").map((s) => Number.parseInt(s, 10))

                        const startMin = hS * 60 + mS
                        let endMin = hE * 60 + mE
                        if (endMin <= startMin) endMin += 24 * 60

                        return hS <= slotH && endMin / 60 > slotH
                      }),
                    ).map((ev) => {
                      const isHovered = hoveredEventId === ev.id
                      
                      return (
                        <div
                          key={`${ev.id}-${slotH}`}
                          className={`absolute rounded overflow-hidden flex flex-col border transition-all duration-200${
                            isHovered ? " shadow-2xl ring-2 ring-cyan-400 z-20" : " hover:shadow-lg"
                          }`}
                          style={{
                            top: "4px",
                            bottom: "4px",
                            width: `${ev.width}%`,
                            left: `${ev.left}%`,
                            backgroundColor: ev.color + "33",
                            borderColor: ev.color + "66",
                            zIndex: isHovered ? 20 : 5 + ev.col,
                          }}
                          onMouseEnter={() => setHoveredEventId(ev.id)}
                          onMouseLeave={() => setHoveredEventId(null)}
                          onClick={() => handleEventClick(ev)}
                        >
                          <div className="h-1.5 w-full" style={{ backgroundColor: ev.color }}></div>
                          <div className="p-2 overflow-hidden flex-1">
                            <div className="font-medium text-sm truncate" style={{ color: ev.color }} title={ev.title}>
                              {ev.title}
                            </div>
                            <div className="text-xs text-gray-300 truncate" title={ev.description}>
                              {ev.description}
                            </div>
                            <div className="text-xs mt-1 flex items-center">
                              <span className="text-gray-400 text-[10px]">
                                {ev.startTime.slice(11, 16)} - {ev.endTime.slice(11, 16)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================
  // RENDER TIME NAVIGATION (00:00, 08:00, 12:00, 18:00)
  // =========================
  const renderTimeNavigation = () => {
    const jumpToTime = (hour: number) => {
      if (currentView === "week" && weekScrollRef.current) {
        weekScrollRef.current.scrollTop = hour * TIME_SLOT_HEIGHT
      } else if (currentView === "day" && dayScrollRef.current) {
        dayScrollRef.current.scrollTop = hour * DAY_SLOT_HEIGHT
      }
    }

    return (
      <div className="flex space-x-1 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-xs px-2"
          onClick={() => jumpToTime(0)}
        >
          00:00
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-xs px-2"
          onClick={() => jumpToTime(8)}
        >
          08:00
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-xs px-2"
          onClick={() => jumpToTime(12)}
        >
          12:00
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-xs px-2"
          onClick={() => jumpToTime(18)}
        >
          18:00
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <Card className="border-gray-800 bg-gray-950 text-gray-100 shadow-xl overflow-clip">
        <CardHeader className="border-b border-gray-800 p-4 pt-0">
          <div className="flex items-center justify-between">
            <h1 className="text-pink-400 text-2xl font-bold tracking-wide">Schedule Dashboard</h1>
            <Button
              className="bg-pink-700 hover:bg-pink-600 text-white"
              size="sm"
              onClick={() => setShowEventForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
              >
                Today
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-700 bg-gray-800 hover:bg-pink-950 hover:text-pink-300 h-8 w-8"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {currentView === "month" ? (
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold min-w-[100px]">{format(currentDate, "MMMM")}</h2>
                    <Select
                      value={currentDate.getFullYear().toString()}
                      onValueChange={(year) => {
                        const newDate = new Date(currentDate)
                        newDate.setFullYear(Number.parseInt(year))
                        setCurrentDate(newDate)
                      }}
                    >
                      <SelectTrigger className="w-[7rem] h-8 border-gray-700 bg-gray-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {Array.from({ length: 10 }, (_, i) => {
                          const yr = new Date().getFullYear() - 5 + i
                          return (
                            <SelectItem key={yr} value={yr.toString()} className="text-white hover:bg-gray-700">
                              {yr}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <h2 className="text-lg font-semibold">{getDateRange()}</h2>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-700 bg-gray-800 hover:bg-pink-950 hover:text-pink-300 h-8 w-8"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex space-x-2 self-end sm:self-auto">
              <Button
                variant={currentView === "month" ? "default" : "outline"}
                size="sm"
                className={
                  currentView === "month"
                    ? "bg-pink-700 hover:bg-pink-600 text-white"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                }
                onClick={() => setCurrentView("month")}
              >
                Month
              </Button>
              <Button
                variant={currentView === "week" ? "default" : "outline"}
                size="sm"
                className={
                  currentView === "week"
                    ? "bg-pink-700 hover:bg-pink-600 text-white"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                }
                onClick={() => setCurrentView("week")}
              >
                Week
              </Button>
              <Button
                variant={currentView === "day" ? "default" : "outline"}
                size="sm"
                className={
                  currentView === "day"
                    ? "bg-pink-700 hover:bg-pink-600 text-white"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                }
                onClick={() => setCurrentView("day")}
              >
                Day
              </Button>
            </div>
          </div>

          {(currentView === "day" || currentView === "week") && renderTimeNavigation()}
        </CardHeader>

        <CardContent className="p-0 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {currentView === "month" && renderMonthView()}
            {currentView === "week" && renderWeekView()}
            {currentView === "day" && renderDayView()}
          </div>

          {/* Legend only, removed CommonFreeTime and GroupWorkRecommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t border-gray-800">
            <ScheduleLegend />
          </div>
        </CardContent>
      </Card>
      <ScheduleDetailPopup
        isOpen={showDetailPopup}
        onClose={() => setShowDetailPopup(false)}
        event={selectedEvent}
        currentUser={currentUser}
        onDeleted={() => selectedEvent && handleEventDeleted(selectedEvent.id)}
        onUpdated={handleEventUpdated}
      />
      {/* Event Creation Form */}
      <EventCreationForm
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false)
          setEventFormData(null)
        }}
        selectedDate={eventFormData?.date || currentDate}
        startTime={eventFormData?.startTime}
        endTime={eventFormData?.endTime}
        currentUser={currentUser}
        following={following}
        mutualFollow={mutualFollow}
        onEventCreated={refreshSchedules}
      />
    </div>
  )
}
