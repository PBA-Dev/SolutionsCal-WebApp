import React, { useState } from 'react'
import styled from 'styled-components'
import { useEvents } from '../hooks/useLocalStorage'
import { Event } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { addDays, addWeeks, addMonths, format, parse, isValid } from 'date-fns'

const AdminContainer = styled.div`
  margin-top: 20px;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
`

const MenuContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`

const MenuItem = styled.button`
  background-color: #2c2c2c;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3c3c3c;
  }
`

const TimeInputContainer = styled.div`
  position: relative;
  
  .time-format-hint {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    pointer-events: none;
  }
`

const AdminInterface: React.FC = () => {
  const [events, setEvents] = useEvents()
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({ 
    title: '', 
    date: '', 
    time: '', 
    recurring: 'none', 
    customDates: [],
    recurrenceEndDate: ''
  })
  const [activeSection, setActiveSection] = useState<'add' | 'manage' | 'password'>('add')
  const { logout, changePassword } = useAuth()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const validateTime = (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
  }

  const formatEventTime = (time: string): string => {
    try {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
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

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (!newTime || validateTime(newTime)) {
      setNewEvent(prev => ({
        ...prev,
        time: newTime
      }));
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateTime(newEvent.time)) {
      alert('Please enter a valid time in 24-hour format (HH:mm)')
      return
    }

    if (newEvent.recurring === 'custom') {
      const invalidDates = newEvent.customDates.filter(date => {
        const trimmedDate = date.trim()
        return !trimmedDate.match(/^\d{4}-\d{2}-\d{2}$/) || !isValid(parse(trimmedDate, 'yyyy-MM-dd', new Date()))
      })
      
      if (invalidDates.length > 0) {
        alert(`Invalid date format found: ${invalidDates.join(', ')}\nPlease use YYYY-MM-DD format (e.g., 2024-10-25)`)
        return
      }
    }
    
    const id = Date.now().toString()
    const generatedEvents = generateRecurringEvents({ ...newEvent, id })
    setEvents([...events, ...generatedEvents])
    setNewEvent({ 
      title: '', 
      date: '', 
      time: '', 
      recurring: 'none', 
      customDates: [],
      recurrenceEndDate: ''
    })
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      alert('New password must be at least 8 characters long')
      return
    }

    if (changePassword(passwordForm.currentPassword, passwordForm.newPassword)) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }

  const generateRecurringEvents = (event: Event): Event[] => {
    if (event.recurring === 'custom') {
      const validCustomDates = event.customDates
        .map(date => date.trim())
        .filter(date => date.match(/^\d{4}-\d{2}-\d{2}$/))
        .map(date => {
          try {
            const parsedDate = parse(date, 'yyyy-MM-dd', new Date())
            if (isValid(parsedDate)) {
              return {
                ...event,
                id: `${event.id}-custom-${date}`,
                date: format(parsedDate, 'yyyy-MM-dd'),
                time: event.time
              }
            }
            return null
          } catch (e) {
            console.error('Error parsing date:', e)
            return null
          }
        })
        .filter(Boolean) as Event[]
      
      return validCustomDates
    }

    const events = [event]
    if (event.recurring === 'none') return events

    const startDate = new Date(`${event.date}T${event.time}`)
    const endDate = event.recurrenceEndDate ? new Date(event.recurrenceEndDate) : addMonths(startDate, 3)

    let currentDate = startDate
    while (currentDate <= endDate) {
      if (event.recurring === 'daily') {
        currentDate = addDays(currentDate, 1)
      } else if (event.recurring === 'weekly') {
        currentDate = addWeeks(currentDate, 1)
      } else if (event.recurring === 'monthly') {
        currentDate = addMonths(currentDate, 1)
      }

      if (currentDate <= endDate) {
        events.push({
          ...event,
          id: `${event.id}-${format(currentDate, 'yyyyMMdd')}`,
          date: format(currentDate, 'yyyy-MM-dd'),
          time: event.time
        })
      }
    }

    return events
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id))
  }

  const handleDuplicateEvent = (event: Event) => {
    const newId = Date.now().toString()
    setEvents([...events, { ...event, id: newId }])
  }

  const handleEditEvent = (id: string, updatedEvent: Omit<Event, 'id'>) => {
    setEvents(events.map(event => event.id === id ? { ...event, ...updatedEvent } : event))
  }

  const renderAddEventForm = () => (
    <form onSubmit={handleAddEvent} className="mb-3">
      <div className="mb-2">
        <input
          type="text"
          className="form-control bg-dark text-light"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
          required
        />
      </div>
      <div className="mb-2">
        <input
          type="date"
          className="form-control bg-dark text-light"
          value={newEvent.date}
          onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
          required
        />
      </div>
      <div className="mb-2">
        <label className="form-label">Time (24-hour format)</label>
        <TimeInputContainer>
          <input
            type="time"
            className="form-control bg-dark text-light"
            value={newEvent.time}
            onChange={handleTimeChange}
            required
            step="60"
          />
          <span className="time-format-hint">HH:mm</span>
        </TimeInputContainer>
      </div>
      <div className="mb-2">
        <select
          className="form-control bg-dark text-light"
          value={newEvent.recurring}
          onChange={e => setNewEvent({ ...newEvent, recurring: e.target.value as Event['recurring'] })}
        >
          <option value="none">No Recurrence</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      {newEvent.recurring !== 'none' && newEvent.recurring !== 'custom' && (
        <div className="mb-2">
          <label htmlFor="recurrenceEndDate" className="form-label">Recurrence End Date</label>
          <input
            type="date"
            id="recurrenceEndDate"
            className="form-control bg-dark text-light"
            value={newEvent.recurrenceEndDate}
            onChange={e => setNewEvent({ ...newEvent, recurrenceEndDate: e.target.value })}
          />
        </div>
      )}
      {newEvent.recurring === 'custom' && (
        <div className="mb-2">
          <label className="form-label">Custom Dates (comma-separated YYYY-MM-DD)</label>
          <input
            type="text"
            className="form-control bg-dark text-light"
            placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
            value={newEvent.customDates.join(', ')}
            onChange={e => {
              const dates = e.target.value
                .split(/[,\n]/)
                .map(date => date.trim())
                .filter(date => date.length > 0)
              setNewEvent({ ...newEvent, customDates: dates })
            }}
          />
          <small className="form-text text-muted">
            Enter dates in YYYY-MM-DD format, separated by commas (e.g., 2024-10-25, 2024-10-26)
          </small>
        </div>
      )}
      <button type="submit" className="btn btn-primary">Add Event</button>
    </form>
  )

  const renderManageEvents = () => (
    <ul className="list-group">
      {events.map((event: Event) => (
        <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center bg-dark text-light">
          <span>{event.title} - {event.date} {formatEventTime(event.time)} (Recurring: {event.recurring})</span>
          <div>
            <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleDuplicateEvent(event)}>Duplicate</button>
            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => {
              const updatedTitle = prompt('Enter new title', event.title)
              if (updatedTitle) handleEditEvent(event.id, { ...event, title: updatedTitle })
            }}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )

  return (
    <AdminContainer>
      <MenuContainer>
        <MenuItem onClick={() => setActiveSection('add')}>Add Event</MenuItem>
        <MenuItem onClick={() => setActiveSection('manage')}>Manage Events</MenuItem>
        <MenuItem onClick={() => setActiveSection('password')}>Change Password</MenuItem>
        <MenuItem onClick={logout}>Log Out</MenuItem>
      </MenuContainer>
      <h3 className="mb-3">
        {activeSection === 'add' && 'Add Event'}
        {activeSection === 'manage' && 'Manage Events'}
        {activeSection === 'password' && 'Change Password'}
      </h3>
      {activeSection === 'add' && renderAddEventForm()}
      {activeSection === 'manage' && renderManageEvents()}
      {activeSection === 'password' && (
        <form onSubmit={handlePasswordChange} className="mb-3">
          <div className="mb-2">
            <input
              type="password"
              className="form-control bg-dark text-light"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="password"
              className="form-control bg-dark text-light"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="password"
              className="form-control bg-dark text-light"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Change Password</button>
        </form>
      )}
    </AdminContainer>
  )
}

export default AdminInterface
