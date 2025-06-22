// src/App.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import Papa from 'papaparse';

/* ------------------------------------------------------------------ */
/*  1) CSV dosyalarınızın TAM listesi – her öğe ticker + filename çifti */
/* ------------------------------------------------------------------ */
const API = 'http://localhost:4000';
const MIN_BARS = 60;

const FILES = [
  { ticker: 'ACN',   filename: 'ACN_5min_2023-09-11_to_2025-04-10.csv' },
  { ticker: 'ACN',   filename: 'ACN_5min_2023-09-11_to_2025-04-11.csv' },
  { ticker: 'ADBE',  filename: 'ADBE_5min_2023-09-11_to_2025-04-07.csv' },
  { ticker: 'ADP',   filename: 'ADP_5min_2023-09-11_to_2025-04-10.csv' },
  { ticker: 'ALGN',  filename: 'ALGN_5min_2023-09-11_to_2025-04-11.csv' },
  { ticker: 'ALXN',  filename: 'ALXN_5min_2023-09-11_to_2025-04-12.csv' },
  { ticker: 'AMAT',  filename: 'AMAT_5min_2023-09-11_to_2025-04-12.csv' },
  { ticker: 'AMD',   filename: 'AMD_5min_2023-09-11_to_2025-04-12.csv' },
  { ticker: 'AMZN',  filename: 'AMZN_5min_2023-09-11_to_2025-04-02.csv' },
  { ticker: 'ANET',  filename: 'ANET_5min_2023-09-11_to_2025-04-12.csv' },
  { ticker: 'APH',   filename: 'APH_5min_2023-09-11_to_2025-04-13.csv' },
  { ticker: 'ASML',  filename: 'ASML_5min_2023-09-11_to_2025-04-13.csv' },
  { ticker: 'ATVI',  filename: 'ATVI_5min_2023-09-11_to_2025-04-14.csv' },
  { ticker: 'AVB',   filename: 'AVB_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'AVGO',  filename: 'AVGO_5min_2023-09-11_to_2025-04-14.csv' },
  { ticker: 'AVY',   filename: 'AVY_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'AXP',   filename: 'AXP_5min_2023-09-11_to_2025-04-14.csv' },
  { ticker: 'AXTA',  filename: 'AXTA_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'BAC',   filename: 'BAC_5min_2023-09-11_to_2025-04-05.csv' },
  { ticker: 'BDX',   filename: 'BDX_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'BIIB',  filename: 'BIIB_5min_2023-09-11_to_2025-04-14.csv' },
  { ticker: 'BKNG',  filename: 'BKNG_5min_2023-09-11_to_2025-04-15.csv' },
  { ticker: 'BKR',   filename: 'BKR_5min_2023-09-11_to_2025-04-15.csv' },
  { ticker: 'BKR',   filename: 'BKR_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'BLK',   filename: 'BLK_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'BMY',   filename: 'BMY_5min_2023-09-11_to_2025-04-15.csv' },
  { ticker: 'BRK.A', filename: 'BRK.A_5min_2023-09-11_to_2025-04-03.csv' },
  { ticker: 'BRK.B', filename: 'BRK.B_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'BSX',   filename: 'BSX_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'CAT',   filename: 'CAT_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CB',    filename: 'CB_5min_2023-09-11_to_2025-05-10.csv' },
  { ticker: 'CCI',   filename: 'CCI_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CDNS',  filename: 'CDNS_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CERN',  filename: 'CERN_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CF',    filename: 'CF_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CHTR',  filename: 'CHTR_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CINF',  filename: 'CINF_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CI',    filename: 'CI_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CLX',   filename: 'CLX_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CL',    filename: 'CL_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CMCSA', filename: 'CMCSA_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CME',   filename: 'CME_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CMG',   filename: 'CMG_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CNXN',  filename: 'CNXN_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'COF',   filename: 'COF_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'COP',   filename: 'COP_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'COST',  filename: 'COST_5min_2023-09-11_to_2025-04-17.csv' },
  { ticker: 'CPB',   filename: 'CPB_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'CRM',   filename: 'CRM_5min_2023-09-11_to_2025-04-06.csv' },
  { ticker: 'CSX',   filename: 'CSX_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'CTAS',  filename: 'CTAS_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'CTSH',  filename: 'CTSH_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'CVS',   filename: 'CVS_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'CVX',   filename: 'CVX_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'C',     filename: 'C_5min_2023-09-11_to_2025-04-15.csv' },
  { ticker: 'DD',    filename: 'DD_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'DG',    filename: 'DG_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'DHR',   filename: 'DHR_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'DIS',   filename: 'DIS_5min_2023-09-11_to_2025-04-05.csv' },
  { ticker: 'DLR',   filename: 'DLR_5min_2023-09-11_to_2025-04-18.csv' },
  { ticker: 'DLTR',  filename: 'DLTR_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'DOW',   filename: 'DOW_5min_2023-09-11_to_2025-04-19.csv' },
  { ticker: 'EA',    filename: 'EA_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'EBAY',  filename: 'EBAY_5min_2023-09-11_to_2025-04-19.csv' },
  { ticker: 'EBAY',  filename: 'EBAY_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'EL',    filename: 'EL_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'EMN',   filename: 'EMN_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'EMR',   filename: 'EMR_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'EQIX',  filename: 'EQIX_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'ETN',   filename: 'ETN_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'ETR',   filename: 'ETR_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'EW',    filename: 'EW_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'EXC',   filename: 'EXC_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'EXPE',  filename: 'EXPE_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'EXR',   filename: 'EXR_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'FAST',  filename: 'FAST_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'FDX',   filename: 'FDX_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'FISV',  filename: 'FISV_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'FISV',  filename: 'FISV_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'FIS',   filename: 'FIS_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'FTNT',  filename: 'FTNT_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'FTV',   filename: 'FTV_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'F',     filename: 'F_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'GD',    filename: 'GD_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'GE',    filename: 'GE_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'GILD',  filename: 'GILD_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'GM',    filename: 'GM_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'GOOGL', filename: 'GOOGL_5min_2023-09-11_to_2025-04-02.csv' },
  { ticker: 'GOOG',  filename: 'GOOG_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'GPN',   filename: 'GPN_5min_2023-09-11_to_2025-05-14.csv' },
  { ticker: 'GS',    filename: 'GS_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'HAL',   filename: 'HAL_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'HON',   filename: 'HON_5min_2023-09-11_to_2025-04-16.csv' },
  { ticker: 'IBM',   filename: 'IBM5min2023-09-11to2025-04-18.csv' },
  { ticker: 'ICE',   filename: 'ICE5min2023-09-11to2025-04-17.csv' },
  { ticker: 'ILMN',  filename: 'ILMN_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'INTC',  filename: 'INTC_5min_2023-09-11_to_2025-04-03.csv' },
  { ticker: 'ISRG',  filename: 'ISRG5min2023-09-11to2025-04-13.csv' },
  { ticker: 'ITW',   filename: 'ITW5min2023-09-11to2025-04-14.csv' },
  { ticker: 'ITW',   filename: 'ITW_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'JNJ',   filename: 'JNJ_5min_2023-09-11_to_2025-04-12.csv' },
  { ticker: 'KLAC',  filename: 'KLAC_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'KMB',   filename: 'KMB_5min_2023-09-11_to_2025-04-20 copy.csv' },
  { ticker: 'KMB',   filename: 'KMB_5min_2023-09-11_to_2025-04-20.csv' },
  { ticker: 'KMB',   filename: 'KMB_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'KO',    filename: 'KO_5min_2023-09-11_to_2025-04-02.csv' },
  { ticker: 'LHX',   filename: 'LHX_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'LMT',   filename: 'LMT_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'LOW',   filename: 'LOW_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'LRCX',  filename: 'LRCX_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'LULU',  filename: 'LULU5min2023-09-11to2025-04-19.csv' },
  { ticker: 'LULU',  filename: 'LULU_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'MAR',   filename: 'MAR5min2023-09-11to2025-04-19.csv' },
  { ticker: 'MAR',   filename: 'MAR_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'MA',    filename: 'MA_5min_2023-09-11_to_2025-04-03.csv' },
  { ticker: 'MCO',   filename: 'MCO_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'MDLZ',  filename: 'MDLZ_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'MDT',   filename: 'MDT_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'MET',   filename: 'MET_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'MNST',  filename: 'MNST_5min_2023-09-11_to_2025-04-23.csv' },
  { ticker: 'NKE',   filename: 'NKE_5min_2023-09-11_to_2025-04-06.csv' },
  { ticker: 'NVDA',  filename: 'NVDA_5min_2023-09-11_to_2025-04-02.csv' },
  { ticker: 'PG',    filename: 'PG_5min_2023-09-11_to_2025-04-04.csv' },
  { ticker: 'RTX',   filename: 'RTX5min2023-09-11to2025-04-18.csv' },
  { ticker: 'SYK',   filename: 'SYK5min2023-09-11to2025-04-21.csv' },
  { ticker: 'TRV',   filename: 'TRV5min2023-09-11to2025-04-20.csv' },
  { ticker: 'TSLA',  filename: 'TSLA_5min_2023-09-11_to_2025-04-01.csv' },
  { ticker: 'TXN',   filename: 'TXN5min2023-09-11to2025-04-14.csv' },
  { ticker: 'UAL',   filename: 'UAL5min2023-09-11to2025-04-14.csv' },
  { ticker: 'UBER',  filename: 'UBER5min2023-09-11to2025-04-20.csv' },
  { ticker: 'UPS',   filename: 'UPS5min2023-09-11to2025-04-20.csv' },
  { ticker: 'VRTX',  filename: 'VRTX5min2023-09-11to2025-04-20.csv' },
  { ticker: 'V',     filename: 'V_5min_2023-09-11_to_2025-04-03.csv' },
  { ticker: 'WBA',   filename: 'WBA5min2023-09-11to2025-04-20.csv' },
  { ticker: 'WMT',   filename: 'WMT_5min_2023-09-11_to_2025-04-03.csv' }
];

/* ------------------------------------------------------------------ */
/*  2) Yardımcı fonksiyon – CSV dosyasını yükle ve parse et          */
/* ------------------------------------------------------------------ */
async function loadCsv(filename) {
  const response = await fetch(`/orjinal_hisse/${filename}`);
  if (!response.ok) throw new Error(`Fetch failed: ${filename}`);
  const text = await response.text();

  return new Promise((resolve) =>
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      complete: ({ data }) => {
        const rows = data.filter((r) => r.datetime);
        rows.forEach((r) => {
          r.time = Math.floor(new Date(r.datetime).getTime() / 1000);
          r.date = r.datetime.slice(0, 10); // YYYY-MM-DD
        });
        resolve(rows);
      },
    })
  );
}

/* ---------------- İki basit POST wrapper'ı ---------------- */
async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${url} → ${res.status} ${res.statusText}\n${txt.slice(0, 120)}`);
  }
  return res.json().catch(() => ({}));
}

const saveJson = (tag, filename, obj) =>
  postJson(`${API}/api/saveJson`, {
    tag,
    filename,
    jsonData: JSON.stringify(obj, null, 2)
  });

/* ------------------------------------------------------------------ */
/*  3) React Bileşeni                                                 */
/* ------------------------------------------------------------------ */
export default function App() {
  const chartContainer = useRef();
  const chartRef = useRef();
  const candle = useRef();
  const volume = useRef();

  const [selIdx, setSelIdx] = useState(0);
  const [data, setData] = useState([]);

  /* CSV yükle */
  useEffect(() => {
    loadCsv(FILES[selIdx].filename)
      .then(setData)
      .catch((err) => alert(err.message));
  }, [selIdx]);

  /* Grafik oluştur & veriyi çiz */
  useEffect(() => {
    if (!data.length) return;

    chartContainer.current.innerHTML = '';
    chartRef.current = createChart(chartContainer.current, {
      width: chartContainer.current.clientWidth,
      height: 600,
      layout: { backgroundColor: '#fff', textColor: '#000' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#ccc' },
      timeScale: { borderColor: '#ccc', timeVisible: true }
    });

    candle.current = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    });

    volume.current = chartRef.current.addHistogramSeries({
      overlay: true,
      priceFormat: { type: 'volume' },
      scaleMargins: { top: 0.7, bottom: 0 },
      color: '#2196f3'
    });

    candle.current.setData(
      data.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }))
    );
    volume.current.setData(
      data.map(({ time, volume }) => ({ time, value: volume }))
    );
    chartRef.current.timeScale().fitContent();
  }, [data]);

  /* Günlük verileri işle – PNG + JSON kaydet */
  const processDaily = useCallback(async () => {
    if (!data.length) return alert('⏳ Veri hâlâ yükleniyor...');

    const { ticker } = FILES[selIdx];
    const dates = Array.from(new Set(data.map((d) => d.date))).sort();
    const days = [];

    for (const date of dates) {
      const seg = data.filter((d) => d.date === date);
      const dow = new Date(date).getUTCDay(); // 0 = Pazar, 6 = Cumartesi
      if (dow === 0 || dow === 6) continue;
      if (seg.length < MIN_BARS) continue;

      seg.forEach((b) => {
        b.direction = b.close >= b.open ? 'up' : 'down';
      });
      const dayDirection =
        seg.at(-1).close >= seg[0].open ? 'up' : 'down';

      candle.current.setData(seg);
      volume.current.setData(seg.map(({ time, volume }) => ({ time, value: volume })));
      chartRef.current.timeScale().setVisibleRange({ from: seg[0].time, to: seg.at(-1).time });
      await new Promise((r) => setTimeout(r, 250));

      const canvas = chartContainer.current.querySelector('canvas');
      const imageData = canvas.toDataURL('image/png');
      const shotFile = `${ticker}_${date}.png`;
      await postJson(`${API}/api/saveScreenshot`, {
        tag: ticker,
        imageData,
        filename: shotFile
      });

      days.push({
        ticker,
        date,
        dayDirection,
        bars: seg.map(({ time, open, high, low, close, volume, direction }) => ({
          time,
          open,
          high,
          low,
          close,
          volume,
          direction
        })),
        screenshot: shotFile
      });
    }

    if (days.length)
      await saveJson(ticker, `${ticker}_daily.json`, days);

    
  }, [data, selIdx]);

  /* ------------------------------------------------------------ */
  /*  4) Tüm hisseleri otomatik işleme fonksiyonu                  */
  /* ------------------------------------------------------------ */
  const processAll = useCallback(async () => {
    for (let i = 0; i < FILES.length; i++) {
      // 1) Yeni dosya seç
      setSelIdx(i);
      // 2) CSV’i manuel olarak yükleyip state’e koy
      const rows = await loadCsv(FILES[i].filename);
      setData(rows);
      // 3) Kısa bekleme
      await new Promise((r) => setTimeout(r, 500));
      // 4) Günlük işlemi çalıştır
      await processDaily();
    }
    alert('✅ Tüm hisseler işlendi.');
  }, [processDaily]);

  /* ---------------------------------------------------------------- */
  /*  UI                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <div style={{ margin: 20 }}>
      <select value={selIdx} onChange={(e) => setSelIdx(Number(e.target.value))}>
        {FILES.map((f, i) => (
          <option key={f.filename} value={i}>
            {f.ticker} — {f.filename}
          </option>
        ))}
      </select>

      <button style={{ marginLeft: 12 }} onClick={processDaily}>
        Günlük Segmentleri İşle
      </button>
      <button style={{ marginLeft: 12 }} onClick={processAll}>
        Tüm Hisseleri Otomatik İşle
      </button>

      <div
        ref={chartContainer}
        style={{ width: '100%', height: 600, marginTop: 10 }}
      />
    </div>
  );
}
