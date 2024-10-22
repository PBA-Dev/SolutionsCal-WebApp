export interface Event {
  id: string
  title: string
  date: string
  time: string
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  customDates: string[]
}
