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

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`

const EditModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const EditModalContent = styled.div`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`

const AdminInterface: React.FC = () => {
  const [events, setEvents] = useEvents()
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'> & { rawCustomDates: string }>({ 
    title: '', 
    date: '', 
    time: '', 
    recurring: 'none', 
    customDates: [],
    recurrenceEndDate: '',
    rawCustomDates: ''
  })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [customDateError, setCustomDateError] = useState<string>('')
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

  const validateCustomDate = (dateStr: string): boolean => {
    const formats = ['dd.MM.yyyy', 'dd/MM/yyyy']
    return formats.some(format => {
      try {
        const parsedDate = parse(dateStr.trim(), format, new Date())
        return isValid(parsedDate)
      } catch {
        return false
      }
    })
  }

  const formatEventTime = (time: string): string => {
    try {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      if (!hours || !minutes) return ''
      const date = new Date()
      date.setHours(parseInt(hours, 10))
      date.setMinutes(parseInt(minutes, 10))
      return format(date, 'HH:mm')
    } catch (e) {
      console.error('Invalid time format:', e)
      return ''
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const newTime = e.target.value
    if (!newTime || validateTime(newTime)) {
      if (isEditing && editingEvent) {
        setEditingEvent({ ...editingEvent, time: newTime })
      } else {
        setNewEvent(prev => ({
          ...prev,
          time: newTime
        }))
      }
    }
  }

  const handleCustomDatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    setNewEvent(prev => ({
      ...prev,
      rawCustomDates: input,
      customDates: input ? input.split(',').map(date => date.trim()) : []
    }))
    
    if (input) {
      const dates = input.split(',').map(date => date.trim()).filter(date => date.length > 0)
      const invalidDates = dates.filter(date => !validateCustomDate(date))
      
      if (invalidDates.length > 0) {
        setCustomDateError(`Invalid date format: ${invalidDates.join(', ')}. Please use dd.mm.yyyy or dd/mm/yyyy format.`)
      } else {
        setCustomDateError('')
      }
    } else {
      setCustomDateError('')
    }
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateTime(newEvent.time)) {
      alert('Please enter a valid time in 24-hour format (HH:mm)')
      return
    }

    if (newEvent.recurring === 'custom') {
      const invalidDates = newEvent.customDates.filter(date => !validateCustomDate(date.trim()))
      
      if (invalidDates.length > 0) {
        setCustomDateError(`Invalid date format: ${invalidDates.join(', ')}. Please use dd.mm.yyyy or dd/mm/yyyy format.`)
        return
      }
      
      if (newEvent.customDates.length === 0) {
        setCustomDateError('Please enter at least one date for custom recurrence.')
        return
      }
    }
    
    const id = Date.now().toString()
    const { rawCustomDates, ...eventWithoutRaw } = newEvent
    const generatedEvents = generateRecurringEvents({ ...eventWithoutRaw, id })
    setEvents([...events, ...generatedEvents])
    setNewEvent({ 
      title: '', 
      date: '', 
      time: '', 
      recurring: 'none', 
      customDates: [],
      recurrenceEndDate: '',
      rawCustomDates: ''
    })
    setCustomDateError('')
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
        .map(date => {
          try {
            let parsedDate = parse(date.trim(), 'dd.MM.yyyy', new Date())
            if (!isValid(parsedDate)) {
              parsedDate = parse(date.trim(), 'dd/MM/yyyy', new Date())
            }
            if (isValid(parsedDate)) {
              return {
                ...event,
                id: `${event.id}-custom-${format(parsedDate, 'yyyy-MM-dd')}`,
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
      
      if (validCustomDates.length === 0) {
        throw new Error('No valid dates provided for custom recurrence')
      }
      
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

  const handleEditEvent = (event: Event) => {
    if (!validateTime(event.time)) {
      alert('Please enter a valid time in 24-hour format (HH:mm)')
      return
    }

    setEvents(events.map(e => e.id === event.id ? event : e))
    setEditingEvent(null)
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
            onChange={e => handleTimeChange(e)}
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
          onChange={e => {
            setNewEvent({ ...newEvent, recurring: e.target.value as Event['recurring'] })
            setCustomDateError('')
          }}
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
          <label className="form-label">Custom Dates (comma-separated dd.mm.yyyy or dd/mm/yyyy)</label>
          <input
            type="text"
            className="form-control bg-dark text-light"
            placeholder="25.10.2024, 26/10/2024, ..."
            value={newEvent.rawCustomDates}
            onChange={handleCustomDatesChange}
            aria-describedby="customDatesHelp"
          />
          {customDateError && (
            <ErrorMessage>{customDateError}</ErrorMessage>
          )}
          <small id="customDatesHelp" className="form-text text-muted">
            Enter dates separated by commas in either format: dd.mm.yyyy or dd/mm/yyyy
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
            <button className="btn btn-sm btn-outline-warning me-2" onClick={() => setEditingEvent(event)}>Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )

  const renderEditModal = () => {
    if (!editingEvent) return null;

    return (
      <EditModal onClick={() => setEditingEvent(null)}>
        <EditModalContent onClick={e => e.stopPropagation()} className="text-light">
          <h4 className="mb-3">Edit Event</h4>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleEditEvent(editingEvent);
          }}>
            <div className="mb-2">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control bg-dark text-light"
                value={editingEvent.title}
                onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control bg-dark text-light"
                value={editingEvent.date}
                onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Time (24-hour format)</label>
              <TimeInputContainer>
                <input
                  type="time"
                  className="form-control bg-dark text-light"
                  value={editingEvent.time}
                  onChange={e => handleTimeChange(e, true)}
                  required
                  step="60"
                />
                <span className="time-format-hint">HH:mm</span>
              </TimeInputContainer>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary me-2">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingEvent(null)}>Cancel</button>
            </div>
          </form>
        </EditModalContent>
      </EditModal>
    );
  };

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
      {renderEditModal()}
    </AdminContainer>
  )
}

export default AdminInterface
