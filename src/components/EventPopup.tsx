import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useEvents } from '../hooks/useLocalStorage';
import { Event } from '../types';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupContent = styled.div`
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid #3a3a3a;
`;

const EventTitle = styled.li`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

interface EventPopupProps {
  date: Date;
  onClose: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({ date, onClose }) => {
  const [events] = useEvents();

  const formatEventTime = (event: Event): string => {
    try {
      if (!event.time) return '';
      const [hours, minutes] = event.time.split(':');
      if (!hours || !minutes) return '';
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'HH:mm');
    } catch (e) {
      console.error('Invalid time format:', e);
      return '';
    }
  };

  const eventsForDate = events.filter((event: Event) => 
    format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );
  
  return (
    <PopupOverlay onClick={onClose}>
      <PopupContent onClick={e => e.stopPropagation()}>
        <h3 className="mb-3">{format(date, 'MMMM d, yyyy', { locale: de })}</h3>
        {eventsForDate.length > 0 ? (
          <ul className="list-group mb-3">
            {eventsForDate.map((event: Event) => (
              <EventTitle key={event.id} className="list-group-item bg-dark text-light">
                {event.title} <br />
                <small>{formatEventTime(event)}</small>
              </EventTitle>
            ))}
          </ul>
        ) : (
          <p>Keine Veranstaltungen für dieses Datum.</p>
        )}
      </PopupContent>
    </PopupOverlay>
  );
};

export default EventPopup;
