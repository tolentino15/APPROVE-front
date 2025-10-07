// calendar.ts

export interface CalendarEventDTO {
  id: string
  title: string
  description?: string
  clientId: string
  startISO: string
  endISO: string
  allDay?: boolean
  status?: 'approved' | 'adjust' | 'pending'
}

export interface FetchCalendarParams {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
  clientId?: string
  view?: 'month' | 'week' | 'day' | '4day'
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

// 👉 Retorne sempre um Record<string,string> (evita Authorization?: undefined)
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchCalendarEvents(
  params: FetchCalendarParams,
): Promise<CalendarEventDTO[]> {
  const url = new URL('/calendar/events', baseURL)
  url.searchParams.set('start', params.start)
  url.searchParams.set('end', params.end)
  if (params.clientId) url.searchParams.set('clientId', params.clientId)
  if (params.view) url.searchParams.set('view', params.view)

  // 👉 Declare um headers com tipo HeadersInit
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders(),
  }

  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<CalendarEventDTO[]>
}
