import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore } from '@/store';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  X
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';

export function CalendarApp() {
  const { calendarEvents, addCalendarEvent, removeCalendarEvent } = useDesktopStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.date, date));
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;

    const colors = ['#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2'];
    addCalendarEvent({
      title: newEventTitle,
      date: selectedDate,
      time: newEventTime,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    setNewEventTitle('');
    setShowAddEvent(false);
  };

  return (
    <div className="flex h-full">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="text-center text-xs text-white/50 py-2">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const events = getEventsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => setSelectedDate(date)}
                className={`p-1 rounded-lg text-left transition-all min-h-[60px] ${
                  isSelected
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'hover:bg-white/5 border border-transparent'
                } ${!isCurrentMonth && 'opacity-30'}`}
              >
                <div className={`text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday(date)
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70'
                }`}>
                  {format(date, 'd')}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className="text-[10px] px-1 py-0.5 rounded truncate"
                      style={{ backgroundColor: `${event.color}30`, color: event.color }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[10px] text-white/40 px-1">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Event Sidebar */}
      <div className="w-64 border-l border-white/10 p-4 bg-black/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">
            {selectedDate ? format(selectedDate, 'MMMM d') : 'Events'}
          </h3>
          <button
            onClick={() => setShowAddEvent(true)}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add Event Form */}
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Event title..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 outline-none focus:border-blue-500/50 mb-2"
              autoFocus
            />
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500/50 mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEvent}
                className="flex-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddEvent(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Events List */}
        <div className="space-y-2">
          {selectedDate && getEventsForDay(selectedDate).length > 0 ? (
            getEventsForDay(selectedDate).map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${event.color}20` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{event.title}</p>
                    {event.time && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-white/50">
                        <Clock className="w-3 h-3" />
                        {event.time}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeCalendarEvent(event.id)}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">No events</p>
              <p className="text-white/30 text-xs mt-1">Click + to add one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
