export function parseTimeToMinutes(t: string) {
  // t like "14:30"
  const [hh, mm] = t.split(':').map(Number)
  return hh * 60 + mm
}

export function timesOverlap(start1: string, end1: string, start2: string, end2: string) {
  const s1 = parseTimeToMinutes(start1)
  const e1 = parseTimeToMinutes(end1)
  const s2 = parseTimeToMinutes(start2)
  const e2 = parseTimeToMinutes(end2)
  return Math.max(s1, s2) < Math.min(e1, e2)
}