import { Event } from '../types'
import { formatDate, parseDate } from './dateUtils'

export const sortEvents = (events: Event[]): Event[] => {
  return events.sort((a, b) => {
    const dateA = parseDate(a.date)
    const dateB = parseDate(b.date)
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime()
    }
    return 0
  })
}

export const filterEventsByDate = (events: Event[], date: Date): Event[] => {
  const formattedDate = formatDate(date)
  return events.filter(event => event.date === formattedDate)
}
