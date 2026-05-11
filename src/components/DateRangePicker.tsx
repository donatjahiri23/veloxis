"use client";

import { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "Yesterday", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This week", days: -1 },
  { label: "Last week", days: -2 },
  { label: "This month", days: -3 },
  { label: "Last month", days: -4 },
  { label: "This year", days: -5 },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getPresetRange(preset: typeof PRESETS[number]): [string, string] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  switch (preset.days) {
    case 0: return [fmt(today), fmt(today)];
    case 1: {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return [fmt(y), fmt(y)];
    }
    case -1: {
      const start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      return [fmt(start), fmt(today)];
    }
    case -2: {
      const end = new Date(today);
      end.setDate(end.getDate() - end.getDay() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return [fmt(start), fmt(end)];
    }
    case -3: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return [fmt(start), fmt(today)];
    }
    case -4: {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return [fmt(start), fmt(end)];
    }
    case -5: {
      const start = new Date(today.getFullYear(), 0, 1);
      return [fmt(start), fmt(today)];
    }
    default: {
      const start = new Date(today);
      start.setDate(start.getDate() - preset.days);
      return [fmt(start), fmt(today)];
    }
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDisplay(from: string, to: string) {
  if (!from || !to) return "Select dates";
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const fmt = (d: Date) =>
    `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}/${d.getFullYear().toString().slice(2)}`;
  return `${fmt(f)} - ${fmt(t)}`;
}

function CalendarMonth({
  year,
  month,
  selectedFrom,
  selectedTo,
  hoverDate,
  onDateClick,
  onDateHover,
}: {
  year: number;
  month: number;
  selectedFrom: string | null;
  selectedTo: string | null;
  hoverDate: string | null;
  onDateClick: (date: string) => void;
  onDateHover: (date: string | null) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().toISOString().split("T")[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (day: number) => `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

  const isInRange = (ds: string) => {
    if (!selectedFrom) return false;
    const end = selectedTo || hoverDate;
    if (!end) return ds === selectedFrom;
    const [a, b] = selectedFrom <= end ? [selectedFrom, end] : [end, selectedFrom];
    return ds >= a && ds <= b;
  };

  const isStart = (ds: string) => {
    if (!selectedFrom) return false;
    const end = selectedTo || hoverDate;
    if (!end) return ds === selectedFrom;
    return ds === (selectedFrom <= end ? selectedFrom : end);
  };

  const isEnd = (ds: string) => {
    if (!selectedFrom) return false;
    const end = selectedTo || hoverDate;
    if (!end) return ds === selectedFrom;
    return ds === (selectedFrom <= end ? end : selectedFrom);
  };

  return (
    <div className="w-[280px]">
      <div className="text-center mb-4">
        <span className="text-base font-semibold text-text-primary">{MONTH_NAMES[month]}</span>
        <span className="text-base text-muted ml-2">{year}</span>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs text-muted font-medium py-2">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const ds = dateStr(day);
          const inRange = isInRange(ds);
          const start = isStart(ds);
          const end = isEnd(ds);
          const isToday = ds === today;

          return (
            <div
              key={ds}
              className={`relative flex items-center justify-center ${inRange && !start && !end ? "bg-accent/10" : ""} ${start ? "rounded-l-md bg-accent/10" : ""} ${end ? "rounded-r-md bg-accent/10" : ""}`}
            >
              <button
                onClick={() => onDateClick(ds)}
                onMouseEnter={() => onDateHover(ds)}
                className={`w-9 h-9 text-sm rounded-md transition-all relative z-10 ${
                  start || end
                    ? "bg-accent text-white font-semibold"
                    : inRange
                    ? "text-text-primary hover:bg-accent/30"
                    : isToday
                    ? "text-accent-light font-semibold ring-1 ring-accent/40 hover:bg-accent/20"
                    : "text-muted-light hover:bg-white/10 hover:text-text-primary"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<string | null>(from);
  const [tempTo, setTempTo] = useState<string | null>(to);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>("Last 90 days");
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [leftMonth, setLeftMonth] = useState(today.getMonth() - 1 < 0 ? 11 : today.getMonth() - 1);
  const [leftYear, setLeftYear] = useState(today.getMonth() - 1 < 0 ? today.getFullYear() - 1 : today.getFullYear());

  const rightMonth = (leftMonth + 1) % 12;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateClick = (date: string) => {
    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(date);
      setTempTo(null);
      setActivePreset(null);
    } else {
      if (date < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(date);
      } else {
        setTempTo(date);
      }
    }
  };

  const handlePreset = (preset: typeof PRESETS[number]) => {
    const [f, t] = getPresetRange(preset);
    setTempFrom(f);
    setTempTo(t);
    setActivePreset(preset.label);

    const fromDate = new Date(f + "T00:00:00");
    setLeftMonth(fromDate.getMonth());
    setLeftYear(fromDate.getFullYear());
  };

  const handleApply = () => {
    if (tempFrom && tempTo) {
      onChange(tempFrom, tempTo);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setTempFrom(from);
    setTempTo(to);
    setOpen(false);
  };

  const goLeft = () => {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); }
    else setLeftMonth(m => m - 1);
  };

  const goRight = () => {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); }
    else setLeftMonth(m => m + 1);
  };

  const displayFrom = tempFrom || from;
  const displayTo = tempTo || to;
  const rangeLabel = displayFrom && displayTo
    ? `${new Date(displayFrom + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${new Date(displayTo + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "";

  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-muted uppercase tracking-wider font-medium">Date Range</label>
        <button
          onClick={() => { setOpen(!open); setTempFrom(from); setTempTo(to); }}
          className="flex items-center gap-2 bg-card-bg border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary hover:border-accent/30 transition-all min-w-[200px]"
        >
          <svg className="w-4 h-4 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="truncate">{formatDisplay(from, to)}</span>
          <svg className={`w-3.5 h-3.5 text-muted ml-auto transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-[100] bg-sidebar-bg border border-card-border rounded-xl shadow-2xl shadow-black/40 flex animate-slide-up">
          {/* Presets */}
          <div className="w-48 border-r border-card-border p-4">
            <p className="text-xs text-muted uppercase tracking-wider font-medium mb-3 px-2">Date Presets</p>
            <div className="space-y-0.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                    activePreset === preset.label
                      ? "bg-accent/15 text-accent-light font-medium border-l-2 border-accent"
                      : "text-muted-light hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-5 px-2">
              <button onClick={goLeft} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-light hover:text-text-primary hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="flex-1" />
              <button onClick={goRight} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-light hover:text-text-primary hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            <div className="flex gap-10" onMouseLeave={() => setHoverDate(null)}>
              <CalendarMonth
                year={leftYear}
                month={leftMonth}
                selectedFrom={tempFrom}
                selectedTo={tempTo}
                hoverDate={!tempTo ? hoverDate : null}
                onDateClick={handleDateClick}
                onDateHover={setHoverDate}
              />
              <CalendarMonth
                year={rightYear}
                month={rightMonth}
                selectedFrom={tempFrom}
                selectedTo={tempTo}
                hoverDate={!tempTo ? hoverDate : null}
                onDateClick={handleDateClick}
                onDateHover={setHoverDate}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-card-border">
              <span className="text-sm text-accent-light font-medium">{rangeLabel}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 text-sm text-muted-light border border-card-border rounded-lg hover:text-text-primary hover:border-accent/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!tempFrom || !tempTo}
                  className="px-5 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
