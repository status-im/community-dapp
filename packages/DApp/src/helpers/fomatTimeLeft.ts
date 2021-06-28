import timeConvert from 'humanize-duration'

export function formatTimeLeft(timeLeft: number) {
  return timeConvert(timeLeft, { largest: 1, round: true }) + (timeLeft < 0 ? ' ago' : ' left')
}
