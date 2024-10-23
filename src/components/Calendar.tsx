import React, { useState } from 'react';
import styled from 'styled-components';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, getDay  } from 'date-fns';
import { de } from 'date-fns/locale';
import { useEvents } from '../hooks/useLocalStorage';
import { Event } from '../types';

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
`;


const CalendarCell = styled.div<{ $isCurrentMonth: boolean; $hasEvent: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$hasEvent ? '#d8b4ff' : (props.$isCurrentMonth ? '#1e1e1e' : '#0f0f0f')}; /* Light purple for event days */
  color: ${props => (props.$isCurrentMonth ? '#ffffff' : '#808080')};
  cursor: pointer;

  &:hover {
    background-color: ${props => props.$hasEvent ? '#b799e5' : '#2c2c2c'}; /* Slightly darker purple on hover if it has an event */
  }
`;

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useEvents();

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(firstDayOfMonth);

  const hasEvent = (date: Date): boolean => {
    return events.some((event: Event) => isSameDay(new Date(event.date), date));
  };

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };
  const handleDateClick = (date: Date) => {
    onDateSelect(date); // Ensure this is called when a date is clicked
  };
  

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary" onClick={() => handleMonthChange(-1)}>Previous</button>
        <h2>{format(currentDate, 'MMMM yyyy', { locale: de } )}</h2>
        <button className="btn btn-outline-secondary" onClick={() => handleMonthChange(1)}>Next</button>
      </div>
      <CalendarGrid>
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center p-2 text-light">{day}</div>
        ))}
            {/* Empty cells for padding before the first day of the month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="calendar-empty-cell" />
            ))}

            {/* Actual days of the month */}
            {daysInMonth.map(date => (
              <CalendarCell
                key={date.toString()}
                $isCurrentMonth={isSameMonth(date, currentDate)}
                $hasEvent={hasEvent(date)}
                onClick={() => handleDateClick(date)}
              >
                {format(date, 'd')} {/* Display day number */}
          </CalendarCell>
        ))}
      </CalendarGrid>
    </div>
  );
};

export default Calendar;
