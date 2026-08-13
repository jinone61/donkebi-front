import assert from 'node:assert/strict'
import test from 'node:test'

import { getOperationTargetDates } from '../src/utils/operation-schedule.js'

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
