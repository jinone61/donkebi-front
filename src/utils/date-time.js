const SEOUL_TIME_ZONE = 'Asia/Seoul'
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_ZONE_PATTERN = /Z$|[+-]\d{2}:?\d{2}$/

function parseApiDateTime(value) {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const input = String(value)
  const normalized = TIME_ZONE_PATTERN.test(input) ? input : `${input}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function seoulDateTimeParts(value) {
  const date = parseApiDateTime(value)
  if (!date) return null

  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: SEOUL_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )
}

export function formatSeoulDate(value) {
  if (DATE_ONLY_PATTERN.test(String(value || ''))) return String(value)

  const parts = seoulDateTimeParts(value)
  if (!parts) return '-'
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function formatSeoulDateTime(value) {
  if (DATE_ONLY_PATTERN.test(String(value || ''))) return String(value)

  const parts = seoulDateTimeParts(value)
  if (!parts) return '-'
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} KST`
}
