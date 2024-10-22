import { useState, useEffect } from 'react'
import { Event } from '../types'

export const useEvents = (): [Event[], React.Dispatch<React.SetStateAction<Event[]>>] => {
  const [events, setEvents] = useState<Event[]>(() => {
    const storedEvents = localStorage.getItem('events')
    return storedEvents ? JSON.parse(storedEvents) : []
  })

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events))
  }, [events])

  return [events, setEvents]
}
