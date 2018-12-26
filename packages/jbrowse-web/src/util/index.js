import fromEntries from 'object.fromentries'

import { openUrl } from './io/rangeFetcher'
import LocalFile from './io/localFile'

if (!Object.fromEntries) {
  fromEntries.shim()
}

export function assembleLocString({ assembly, refName, start, end }) {
  return `${assembly}:${refName}:${start + 1}-${end}`
}

export function openLocation(location) {
  if (!location) throw new Error(`must provide a location to openLocation`)
  if (location.uri) return openUrl(location.uri)
  if (location.path) {
    return new LocalFile(location.path)
  }
  throw new Error('local files not yet supported by openLocation')
}

export function clamp(val, min, max) {
  if (val < min) return min
  if (val > max) return max
  return val
}

export function bpToPx(bp, region, bpPerPx, flipped = false) {
  if (flipped) {
    return (region.end - bp) / bpPerPx
  }
  return (bp - region.start) / bpPerPx
}

export const objectFromEntries = Object.fromEntries.bind(Object)

// do an array map of an iterable
export function iterMap(iterable, func, sizeHint) {
  const results = sizeHint ? new Array(sizeHint) : []
  let counter = 0
  for (const item of iterable) {
    results[counter] = func(item)
    counter += 1
  }
  return results
}
