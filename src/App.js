// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { priceData, volumeData }      from './csv/output/amzn';

export default function App() {
  const chartContainer = useRef();
  const chartRef       = useRef();
  const candleSeries   = useRef();
  const volumeSeries   = useRef();

  // Ham 5-dk verisini "detailed" dizisine taşı
  const [detailed] = useState(() =>
    priceData.map((p, i) => ({
      time:   p.time,
      open:   p.open,
      high:   p.high,
      low:    p.low,
      close:  p.close,
      volume: volumeData[i].value,
      date:   new Date(p.time * 1000).toISOString().slice(0,10),
    }))
  );

  // Grafik bir kere kurulsun
  useEffect(() => {
    chartRef.current = createChart(chartContainer.current, {
      width:  chartContainer.current.clientWidth,
      height: 600,
      layout: {
        backgroundColor: '#ffffff',
        textColor:       '#000000',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      crosshair:       { mode: CrosshairMode.Normal },
      rightPriceScale:{ borderColor: '#ccc' },
      timeScale: {
        borderColor:    '#ccc',
        timeVisible:    true,
        secondsVisible: false,
      },
    });

    // Mum serisi
    candleSeries.current = chartRef.current.addCandlestickSeries({
      upColor:        '#26a69a',
      downColor:      '#ef5350',
      borderUpColor:   '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor:     '#26a69a',
      wickDownColor:   '#ef5350',
    });

    volumeSeries.current = chartRef.current.addHistogramSeries({
      // bu satır volume'u mum serisinin aynı pane’ında çizer,
      // ayrı bir alt grafik (pane) oluşturmaz
      overlay: true,
      priceFormat: { type: 'volume' },
    });
    
    // Window resize olunca sığdır
    const ro = new ResizeObserver(() => {
      chartRef.current.applyOptions({ width: chartContainer.current.clientWidth });
      chartRef.current.timeScale().fitContent();
    });
    ro.observe(chartContainer.current);
    return () => ro.disconnect();
  }, []);

  // Tüm Pzt–Cum haftalarını bul
  const getWeeklyRanges = () => {
    const dates = Array.from(new Set(detailed.map(d => d.date))).sort();
    const ranges = [];
    dates.forEach((d, i) => {
      // yalnızca pazartesi başlangıç
      if (new Date(d).getDay() !== 1) return;
      // arka arkaya 5 işgünü al
      const segDates = [];
      let idx = detailed.findIndex(x => x.date === d);
      while (idx < detailed.length && segDates.length < 5) {
        const w = new Date(detailed[idx].date).getDay();
        if (w !== 0 && w !== 6) segDates.push(detailed[idx].date);
        idx++;
      }
      if (segDates.length === 5) {
        ranges.push({
          start: segDates[0],
          end:   segDates[4],
        });
      }
    });
    return ranges;
  };

  // Butona basınca sırayla işle
  const processFiveDayWindows = async () => {
    const ranges = getWeeklyRanges();
    const summary = [];

    for (const { start, end } of ranges) {
      // 5-dk barlarını filtrele
      const seg = detailed.filter(d => d.date >= start && d.date <= end);

      // Mum + hacim verisini ayarla
      candleSeries.current.setData(seg.map(d=>({
        time:  d.time,
        open:  d.open,
        high:  d.high,
        low:   d.low,
        close: d.close,
      })));
      volumeSeries.current.setData(seg.map(d=>({
        time:  d.time,
        value: d.volume,
      })));

      // görünür aralığı sabitle
      chartRef.current.timeScale().setVisibleRange({
        from: seg[0].time,
        to:   seg[seg.length-1].time,
      });

      // render tamamlanana kadar bekle
      await new Promise(r=>setTimeout(r, 300));

      // ekran görüntüsü
      const canvases = chartContainer.current.getElementsByTagName('canvas');
      [0] = grid+axes, [1] = data katmanı
      const priceCanvas = canvases[1] || canvases[0];
      const imageData = canvas.toDataURL('image/png');
      const filename  = `ASELS_${start}_${end}.png`;
      await fetch('http://localhost:4000/api/saveScreenshot', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ tag:'ASELS', imageData, filename }),
      });

      // kapanış değerlerini hesapla
      const findClose = date => {
        const m = detailed.find(x=>x.date===date);
        return m ? m.close : '';
      };
      const nextFri  = new Date(end); nextFri.setDate(nextFri.getDate()+7);
      const fourFri = new Date(end); fourFri.setDate(fourFri.getDate()+28);

      summary.push({
        mondayDate:          start,
        openMonday:          seg[0].open,
        fridayDate:          end,
        closeFriday:         seg[seg.length-1].close,
        nextFridayDate:      nextFri.toISOString().slice(0,10),
        closeNextFriday:     findClose(nextFri.toISOString().slice(0,10)),
        fourWeeksFridayDate: fourFri.toISOString().slice(0,10),
        closeFourWeeksFriday:findClose(fourFri.toISOString().slice(0,10)),
        screenshot:          filename,
      });
    }

    // CSV’e çevir ve gönder
    if (summary.length) {
      const headers = Object.keys(summary[0]).join(',');
      const rows    = summary.map(r=>Object.values(r).join(',')).join('\n');
      const csvData = headers + '\n' + rows;
      await fetch('http://localhost:4000/api/saveCsv', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          tag:'ASELS',
          csvData,
          filename:'ASELS_5day_summary.csv',
        }),
      });
    }

    alert('✅ Haftalık segmentler işlendi ve kaydedildi.');
  };

  // Uygulama ilk açıldığında tüm veriyi göster
  useEffect(() => {
    candleSeries.current.setData(detailed.map(d=>({
      time: d.time, open:d.open, high:d.high, low:d.low, close:d.close
    })));
    volumeSeries.current.setData(detailed.map(d=>({
      time: d.time, value:d.volume
    })));
    chartRef.current.timeScale().fitContent();
  }, [detailed]);

  return (
    <div style={{ margin:20 }}>
      <button onClick={processFiveDayWindows}>
        5 Günlük (Pzt–Cum) Segmentleri İşle ve Kaydet
      </button>
      <div
        ref={chartContainer}
        style={{ width:'100%', height:600, marginTop:10 }}
      />
    </div>
  );
}
