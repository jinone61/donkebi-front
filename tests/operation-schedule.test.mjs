import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getLatestOperationStartedAt,
  getNextCalendarDate,
  getOperationCountdownState,
  getOperationEstimatedDate,
  getOperationEstimatedDateTime,
  getOperationTargetDates
} from '../src/utils/operation-schedule.js'

const phases = ['PREPARE', 'APPLY', 'PLAN', 'SUBMIT']
const jobsFor = (targetDate, jobTypes) =>
  jobTypes.map((jobType, index) => ({
    id: index + 1,
    targetDate,
    jobType
  }))

test('prepends the next market date after a complete latest date', () => {
  assert.deepEqual(
    getOperationTargetDates(jobsFor('2026-08-13', phases), phases),
    ['2026-08-14', '2026-08-13']
  )
})

test('uses Monday as the upcoming date after a completed Friday', () => {
  assert.deepEqual(
    getOperationTargetDates(jobsFor('2026-08-14', phases), phases),
    ['2026-08-17', '2026-08-14']
  )
})

test('does not add another date while the latest date is in progress', () => {
  assert.deepEqual(
    getOperationTargetDates(
      jobsFor('2026-08-14', ['PREPARE', 'APPLY']),
      phases
    ),
    ['2026-08-14']
  )
})

test('keeps an empty response empty', () => {
  assert.deepEqual(getOperationTargetDates([], phases), [])
})

test('uses the calendar day after the previous target as the fallback date', () => {
  assert.equal(getNextCalendarDate('2026-08-14'), '2026-08-15')
})

test('keeps estimates under 24 hours on the fallback date', () => {
  assert.equal(
    getOperationEstimatedDate({
      previousTargetDate: '2026-08-14',
      nextSessionDate: '2026-08-17',
      candidateTime: '2026-08-15T00:00:00.221Z',
      referenceTime: '2026-08-14T14:30:00.221Z'
    }),
    '2026-08-15'
  )
})

test('moves estimates at least 24 hours away to the next session', () => {
  assert.equal(
    getOperationEstimatedDate({
      previousTargetDate: '2026-08-14',
      nextSessionDate: '2026-08-17',
      candidateTime: '2026-08-15T14:30:00.221Z',
      referenceTime: '2026-08-14T14:30:00.221Z'
    }),
    '2026-08-17'
  )
})

test('keeps weekday estimates unchanged when the fallback is the next session', () => {
  assert.equal(
    getOperationEstimatedDate({
      previousTargetDate: '2026-08-13',
      nextSessionDate: '2026-08-14',
      candidateTime: '2026-08-14T14:30:00.221Z',
      referenceTime: '2026-08-13T14:30:00.221Z'
    }),
    '2026-08-14'
  )
})

test('anchors estimates to the previous target even after a new job starts', () => {
  const jobs = [
    {
      id: 27,
      targetDate: '2026-08-14',
      jobType: 'PLAN',
      startedAt: '2026-08-14T09:20:00.068'
    },
    {
      id: 28,
      targetDate: '2026-08-14',
      jobType: 'SUBMIT',
      startedAt: '2026-08-14T23:30:00.221'
    },
    {
      id: 29,
      targetDate: '2026-08-17',
      jobType: 'PREPARE',
      startedAt: '2026-08-15T09:00:00.421'
    }
  ]

  assert.equal(
    getLatestOperationStartedAt(jobs, '2026-08-14'),
    '2026-08-14T23:30:00.221'
  )
})

test('uses the holiday-adjusted session only after the 24-hour boundary', () => {
  const previousTargetDate = '2026-09-04'
  const nextSessionDate = getOperationTargetDates(
    jobsFor(previousTargetDate, phases),
    phases
  )[0]

  assert.equal(nextSessionDate, '2026-09-08')
  assert.equal(
    getOperationEstimatedDateTime({
      previousTargetDate,
      nextSessionDate,
      previousStartedAt: '2026-09-04T09:00:00.421',
      referenceStartedAt: '2026-09-04T23:30:00.221'
    }).toISOString(),
    '2026-09-05T00:00:00.421Z'
  )
  assert.equal(
    getOperationEstimatedDateTime({
      previousTargetDate,
      nextSessionDate,
      previousStartedAt: '2026-09-04T23:30:00.221',
      referenceStartedAt: '2026-09-04T23:30:00.221'
    }).toISOString(),
    '2026-09-08T14:30:00.221Z'
  )
})

test('keeps pre-submit phases on the fallback execution day', () => {
  assert.equal(
    getOperationEstimatedDateTime({
      previousTargetDate: '2026-08-14',
      nextSessionDate: '2026-08-17',
      previousStartedAt: '2026-08-14T09:00:00.421',
      referenceStartedAt: '2026-08-14T23:30:00.221'
    }).toISOString(),
    '2026-08-15T00:00:00.421Z'
  )
})

test('preserves milliseconds when moving the 24-hour submit estimate', () => {
  assert.equal(
    getOperationEstimatedDateTime({
      previousTargetDate: '2026-08-14',
      nextSessionDate: '2026-08-17',
      previousStartedAt: '2026-08-14T23:30:00.221',
      referenceStartedAt: '2026-08-14T23:30:00.221'
    }).toISOString(),
    '2026-08-17T14:30:00.221Z'
  )
})

test('formats the next operation countdown without dropping partial seconds', () => {
  assert.deepEqual(
    getOperationCountdownState(
      '2026-08-15T03:02:03.500Z',
      '2026-08-14T00:00:00.000Z'
    ),
    {
      phase: 'countdown',
      label: '1일 03:02:04',
      refreshDue: false
    }
  )
})

test('waits three seconds after zero before an operation refresh is due', () => {
  const target = '2026-08-14T01:00:00.000Z'

  assert.deepEqual(
    getOperationCountdownState(target, '2026-08-14T01:00:02.999Z'),
    {
      phase: 'checking',
      label: '',
      refreshDue: false
    }
  )
  assert.deepEqual(
    getOperationCountdownState(target, '2026-08-14T01:00:03.000Z'),
    {
      phase: 'checking',
      label: '',
      refreshDue: true
    }
  )
})
