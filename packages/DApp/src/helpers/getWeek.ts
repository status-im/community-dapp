export function getWeek(date: Date) {
  return Math.floor((date.getTime() - 259200000) / 604800000)
}
