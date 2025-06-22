// src/csv/output/adbe/index.js
import priceRaw  from './price.json';
import volumeRaw from './volume.json';
import areaRaw   from './area.json';

/** ISO → epoch seconds */
function toEpoch(iso) {
  return Math.floor(new Date(iso).getTime() / 1000);
}

/** Candlestick data */
export const priceData = priceRaw.map(({ time, open, high, low, close }) => ({
  time:  toEpoch(time),
  open:  +open,
  high:  +high,
  low:   +low,
  close: +close,
}));

/** Volume histogram data */
export const volumeData = volumeRaw.map(({ time, value }) => ({
  time:  toEpoch(time),
  value: +value,
}));

/** (Optional) Area data */
export const areaData = areaRaw.map(({ time, value }) => ({
  time:  toEpoch(time),
  value: +value,
}));
