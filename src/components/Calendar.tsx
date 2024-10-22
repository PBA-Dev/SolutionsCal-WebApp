import React, { useState } from 'react'
import styled from 'styled-components'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay } from 'date-fns'
import { useEvents } from '../hooks/useLocalStorage'
import { Event } from '../types'

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #2a2a2a; // Darker grid background
  border: 1px solid #3a3a3a; // Darker border
`

const CalendarCell = styled.div<{ $isCurrentMonth: boolean; $hasEvent: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isCurrentMonth ? '#1e1e1e' : '#0f0f0f'}; // Darker cell backgrounds
  color: ${props => props.$isCurrentMonth ? '#ffffff' : '#808080'}; // Lighter text for current month, gray for other months
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: #2c2c2c; // Darker hover color
  }

  ${props => props.$hasEvent && `
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #4caf50; // Green dot for events
    }
  `}
`

interface CalendarProps {
  onDateSelect: (date: Date) => void
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events] = useEvents()

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  const hasEvent = (date: Date): boolean => {
    return events.some((event: Event) => isSameDay(new Date(event.date), date))
  }

  const handleDateClick = (date: Date) => {
    onDateSelect(date)
  }

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + increment)
      return newDate
    })
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary" onClick={() => handleMonthChange(-1)}>Previous</button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button className="btn btn-outline-secondary" onClick={() => handleMonthChange(1)}>Next</button>
      </div>
      <CalendarGrid>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center p-2 text-light">{day}</div>
        ))}
        {daysInMonth.map(date => (
          <CalendarCell
            key={date.toString()}
            $isCurrentMonth={isSameMonth(date, currentDate)}
            $hasEvent={hasEvent(date)}
            onClick={() => handleDateClick(date)}
          >
            {format(date, 'd')}
          </CalendarCell>
        ))}
      </CalendarGrid>
    </div>
  )
}

export default Calendar
