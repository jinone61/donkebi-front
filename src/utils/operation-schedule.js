import { getNextUsMarketDate } from './us-market-calendar.js'

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
