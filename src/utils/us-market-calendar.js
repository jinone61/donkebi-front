const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function parseIsoDate(dateString) {
  const match = String(dateString).match(ISO_DATE_PATTERN)
  if (!match) throw new RangeError(`Invalid ISO date: ${dateString}`)

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
    throw new RangeError(`Invalid ISO date: ${dateString}`)
  }

  return date
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, days) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function nthWeekdayOfMonth(year, month, weekday, occurrence) {
  const first = new Date(Date.UTC(year, month, 1))
  const offset = (weekday - first.getUTCDay() + 7) % 7
  return new Date(Date.UTC(year, month, 1 + offset + (occurrence - 1) * 7))
}

function lastWeekdayOfMonth(year, month, weekday) {
  const last = new Date(Date.UTC(year, month + 1, 0))
  const offset = (last.getUTCDay() - weekday + 7) % 7
  return addDays(last, -offset)
}

function easterSunday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month, day))
}

function addHoliday(holidays, date) {
  holidays.add(formatIsoDate(date))
}

function addObservedFixedHoliday(
  holidays,
  year,
  month,
  day,
  { observeSaturday = true } = {}
) {
  const holiday = new Date(Date.UTC(year, month, day))
  addHoliday(holidays, holiday)

  if (holiday.getUTCDay() === 6 && observeSaturday) {
    addHoliday(holidays, addDays(holiday, -1))
  } else if (holiday.getUTCDay() === 0) {
    addHoliday(holidays, addDays(holiday, 1))
  }
}

function getUsMarketHolidays(year) {
  const holidays = new Set()

  addObservedFixedHoliday(holidays, year, 0, 1, {
    observeSaturday: false
  })
  addHoliday(holidays, nthWeekdayOfMonth(year, 0, 1, 3))
  addHoliday(holidays, nthWeekdayOfMonth(year, 1, 1, 3))
  addHoliday(holidays, addDays(easterSunday(year), -2))
  addHoliday(holidays, lastWeekdayOfMonth(year, 4, 1))

  if (year >= 2022) {
    addObservedFixedHoliday(holidays, year, 5, 19)
  }

  addObservedFixedHoliday(holidays, year, 6, 4)
  addHoliday(holidays, nthWeekdayOfMonth(year, 8, 1, 1))
  addHoliday(holidays, nthWeekdayOfMonth(year, 10, 4, 4))
  addObservedFixedHoliday(holidays, year, 11, 25)

  return holidays
}

export function isUsMarketDate(dateString) {
  const date = parseIsoDate(dateString)
  const weekday = date.getUTCDay()
  if (weekday === 0 || weekday === 6) return false
  return !getUsMarketHolidays(date.getUTCFullYear()).has(dateString)
}

export function getNextUsMarketDate(dateString) {
  let date = parseIsoDate(dateString)

  do {
    date = addDays(date, 1)
  } while (!isUsMarketDate(formatIsoDate(date)))

  return formatIsoDate(date)
}
