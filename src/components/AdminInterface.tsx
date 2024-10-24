import React, { useState } from 'react'
import styled from 'styled-components'
import { useEvents } from '../hooks/useLocalStorage'
import { Event } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { addDays, addWeeks, addMonths, format } from 'date-fns'

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
  const { logout } = useAuth()

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
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

  const generateRecurringEvents = (event: Event): Event[] => {
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
      } else if (event.recurring === 'custom') {
        break // Custom dates are handled separately
      }

      if (currentDate <= endDate) {
        events.push({
          ...event,
          id: `${event.id}-${format(currentDate, 'yyyyMMdd')}`,
          date: format(currentDate, 'yyyy-MM-dd'),
          time: format(currentDate, 'HH:mm')
        })
      }
    }

    if (event.recurring === 'custom') {
      event.customDates.forEach((customDate, index) => {
        if (new Date(customDate) <= endDate) {
          events.push({
            ...event,
            id: `${event.id}-custom-${index}`,
            date: customDate,
          })
        }
      })
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
        <input
          type="time"
          className="form-control bg-dark text-light"
          value={newEvent.time}
          onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
          required
        />
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
          <input
            type="text"
            className="form-control bg-dark text-light"
            placeholder="Custom Dates (comma-separated YYYY-MM-DD)"
            value={newEvent.customDates.join(',')}
            onChange={e => setNewEvent({ ...newEvent, customDates: e.target.value.split(',') })}
          />
        </div>
      )}
      <button type="submit" className="btn btn-primary">Add Event</button>
    </form>
  )

  const renderManageEvents = () => (
    <ul className="list-group">
      {events.map((event: Event) => (
        <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center bg-dark text-light">
          <span>{event.title} - {event.date} {event.time} (Recurring: {event.recurring})</span>
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

  const renderChangePassword = () => (
    <form className="mb-3">
      <div className="mb-2">
        <input type="password" className="form-control bg-dark text-light" placeholder="Current Password" />
      </div>
      <div className="mb-2">
        <input type="password" className="form-control bg-dark text-light" placeholder="New Password" />
      </div>
      <div className="mb-2">
        <input type="password" className="form-control bg-dark text-light" placeholder="Confirm New Password" />
      </div>
      <button type="submit" className="btn btn-primary">Change Password</button>
    </form>
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
      {activeSection === 'password' && renderChangePassword()}
    </AdminContainer>
  )
}

export default AdminInterface
