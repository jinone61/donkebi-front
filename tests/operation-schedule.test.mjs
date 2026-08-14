import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getOperationCountdownState,
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
