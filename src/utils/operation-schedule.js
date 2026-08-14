import { getNextUsMarketDate } from './us-market-calendar.js'

const OPERATION_REFRESH_GRACE_MS = 3_000

function operationTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value)
  return date.getTime()
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
