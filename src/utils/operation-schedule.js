import { getNextUsMarketDate } from './us-market-calendar.js'

const OPERATION_REFRESH_GRACE_MS = 3_000
const OPERATION_DAY_MS = 86_400_000
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function operationTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value)
  return date.getTime()
}

export function parseOperationDateTime(value) {
  if (value instanceof Date) return value

  const stringValue = String(value)
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(stringValue)) {
    return new Date(stringValue)
  }

  const parts = stringValue.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/
  )
  if (!parts) return new Date(stringValue)

  const [, year, month, day, hour, minute, second = '0', fraction = ''] = parts
  const millisecond = Number(fraction.padEnd(3, '0').slice(0, 3))

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - 9,
      Number(minute),
      Number(second),
      millisecond
    )
  )
}

function operationId(value) {
  const id = Number(value)
  return Number.isFinite(id) ? id : -Infinity
}

export function getNextCalendarDate(dateString) {
  const match = String(dateString || '').match(ISO_DATE_PATTERN)
  if (!match) return null

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText) - 1
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

export function getLatestOperationStartedAt(jobs = [], targetDate) {
  return (
    jobs
      .filter(job => job.targetDate === targetDate && job.startedAt)
      .sort((left, right) => operationId(right.id) - operationId(left.id))[0]
      ?.startedAt || null
  )
}

export function getOperationEstimatedDate({
  previousTargetDate,
  nextSessionDate,
  candidateTime,
  referenceTime
}) {
  const fallbackDate = getNextCalendarDate(previousTargetDate)
  if (!fallbackDate) return nextSessionDate || null
  if (!nextSessionDate || fallbackDate === nextSessionDate) return fallbackDate

  const candidateTimestamp = operationTimestamp(candidateTime)
  const referenceTimestamp = operationTimestamp(referenceTime)
  const elapsedMilliseconds = candidateTimestamp - referenceTimestamp

  return Number.isFinite(elapsedMilliseconds) &&
    elapsedMilliseconds >= OPERATION_DAY_MS
    ? nextSessionDate
    : fallbackDate
}

export function getOperationEstimatedDateTime({
  previousTargetDate,
  nextSessionDate,
  previousStartedAt,
  referenceStartedAt
}) {
  const fallbackDate = getNextCalendarDate(previousTargetDate)
  if (!fallbackDate || !nextSessionDate || !previousStartedAt) return null

  const previousDateTime = parseOperationDateTime(previousStartedAt)
  if (Number.isNaN(previousDateTime.getTime())) return null

  const timeParts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hourCycle: 'h23'
    })
      .formatToParts(previousDateTime)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )
  const estimatedClock = `${timeParts.hour}:${timeParts.minute}:${timeParts.second}.${timeParts.fractionalSecond}`
  const candidateTime = parseOperationDateTime(
    `${fallbackDate}T${estimatedClock}`
  )
  const estimatedDate = getOperationEstimatedDate({
    previousTargetDate,
    nextSessionDate,
    candidateTime,
    referenceTime: parseOperationDateTime(referenceStartedAt)
  })

  return estimatedDate
    ? parseOperationDateTime(`${estimatedDate}T${estimatedClock}`)
    : null
}

function padCountdownUnit(value) {
  return String(value).padStart(2, '0')
}

function formatOperationCountdown(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1_000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60
  const time = [hours, minutes, seconds].map(padCountdownUnit).join(':')

  return days > 0 ? `${days}일 ${time}` : time
}

export function getOperationCountdownState(targetValue, nowValue = new Date()) {
  const targetTime = operationTimestamp(targetValue)
  const nowTime = operationTimestamp(nowValue)
  if (!Number.isFinite(targetTime) || !Number.isFinite(nowTime)) {
    return { phase: 'unavailable', label: '', refreshDue: false }
  }

  const remainingMilliseconds = targetTime - nowTime
  if (remainingMilliseconds > 0) {
    return {
      phase: 'countdown',
      label: formatOperationCountdown(remainingMilliseconds),
      refreshDue: false
    }
  }

  return {
    phase: 'checking',
    label: '',
    refreshDue: Math.abs(remainingMilliseconds) >= OPERATION_REFRESH_GRACE_MS
  }
}

export function getOperationTargetDates(jobs = [], requiredJobTypes = []) {
  const dates = [
    ...new Set(jobs.map(job => job.targetDate).filter(Boolean))
  ].sort((left, right) => right.localeCompare(left))
  const latestDate = dates[0]
  if (!latestDate) return dates

  const latestTypes = new Set(
    jobs.filter(job => job.targetDate === latestDate).map(job => job.jobType)
  )
  const isComplete = requiredJobTypes.every(jobType => latestTypes.has(jobType))

  return isComplete ? [getNextUsMarketDate(latestDate), ...dates] : dates
}
