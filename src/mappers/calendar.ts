import type { CalendarEventDTO } from '@/api/calendar'

export type CalEvent = {
  name: string
  start: Date
  end: Date
  color: string
  timed: boolean
  client: string
  details?: string
}

/** clientsMap: { [clientId]: { color: string; name: string } } */
export function mapDTOToCalEvent(
  dto: CalendarEventDTO,
  clientsMap: Record<string, { color: string; name: string }>,
): CalEvent {
  const color = clientsMap[dto.clientId]?.color ?? '#1976d2'
  return {
    name: dto.title,
    start: new Date(dto.startISO),
    end: new Date(dto.endISO),
    color,
    timed: !dto.allDay,
    client: dto.clientId,
    details: dto.description ?? '',
  }
}
