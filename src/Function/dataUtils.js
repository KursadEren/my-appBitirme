import React, { useEffect } from 'react';

/**
 * Ham CSV satırları üzerinden price/volume/area dizilerini çıkarır.
 */
function parseRowsToSeries(rows) {
  const priceData  = [];
  const volumeData = [];
  const areaData   = [];

  rows.forEach(row => {
    const ts = Math.floor(new Date(row.datetime).getTime() / 1000);
    priceData.push({
      time:  ts,
      open:  parseFloat(row.open),
      high:  parseFloat(row.high),
      low:   parseFloat(row.low),
      close: parseFloat(row.close),
    });
    volumeData.push({
      time:  ts,
      value: parseFloat(row.volume),
    });
    areaData.push({
      time:  ts,
      value: parseFloat(row.close),
    });
  });

  return { priceData, volumeData, areaData };
}

export default function ParsedDataToChart({ csvRows }) {
  useEffect(() => {
    console.log(csvRows)
    if (!csvRows || csvRows.length === 0) return;
    const { priceData, volumeData, areaData } = parseRowsToSeries(csvRows);

    console.log('priceData:',  priceData);
    console.log('volumeData:', volumeData);
    console.log('areaData:',   areaData);
  }, [csvRows]);

  return null;
}
