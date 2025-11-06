/**
 * Simple scaffold for ICS import using ical.js
 * This is a stubbed import action — parse an .ics string and map to schedule blocks.
 * Expand this to create schedule_blocks insert actions.
 */
import ICAL from 'ical.js'

export function parseICS(icsString: string) {
  try {
    const jcal = ICAL.parse(icsString)
    const comp = new ICAL.Component(jcal)
    const events = comp.getAllSubcomponents('vevent')
    const parsed = events.map((ev) => {
      const e = new ICAL.Event(ev)
      return {
        uid: e.uid,
        summary: e.summary,
        description: e.description,
        start: e.startDate.toJSDate().toISOString(),
        end: e.endDate.toJSDate().toISOString(),
      }
    })
    return parsed
  } catch (e) {
    console.error('ics parse failed', e)
    return []
  }
}