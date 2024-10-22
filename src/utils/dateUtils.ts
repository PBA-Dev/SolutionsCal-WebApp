import { format, parse, isValid } from 'date-fns'

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

export const parseDate = (dateString: string): Date | null => {
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date())
  return isValid(parsedDate) ? parsedDate : null
}
