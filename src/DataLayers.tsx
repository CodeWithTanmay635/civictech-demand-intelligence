import { useState } from 'react';
import { useData } from './DataProvider';

const LAYERS = [
  {
    id: 'demand',
    label: 'Citizen Demand',
    description: 'Aggregated citizen service requests and complaint density by H3 zone.',
    color: '#1B4FD8',
    bgColor: '#EEF2FF',
    field: 'demand' as const,
    unit: 'Demand Index',
    source: '2,847 citizen reports · Jan–Sep 2024 (Synthetic)',
    stats: { mean: 0.61, median: 0.65, high: 0.91, low: 0.21 },
  },
  {
    id: 'vulnerability',
    label: 'Vulnerability Index',
    description: 'Composite vulnerability score derived from socioeconomic indicators, population density, and informal settlement data.',
    color: '#D97706',
    bgColor: '#FFFBEB',
    field: 'vulnerability' as const,
    unit: 'Vulnerability Index',
    source: 'Census 2011 + 2024 synthetic socioeconomic dataset',
    stats: { mean: 0.56, median: 0.60, high: 0.81, low: 0.18 },
  },
  {
    id: 'deficit',
    label: 'Infrastructure Deficit',
    description: 'Normalized infrastructure condition deficit index across water, transport, sanitation, and education assets.',
    color: '#B91C1C',
    bgColor: '#FEF2F2',
    field: 'deficit' as const,
    unit: 'Deficit Index',
    source: 'MCGM asset register (synthetic) · 2024',
    stats: { mean: 0.55, median: 0.63, high: 0.88, low: 0.15 },
  },
  {
    id: 'investment',
    label: 'Investment Gap',
    description: 'Estimated gap between required investment and historical public capital expenditure per H3 zone.',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    field: 'investmentGap' as const,
    unit: 'Gap Index',
    source: 'BMC budget allocations (synthetic) · FY 2022–24',
    stats: { mean: 0.44, median: 0.48, high: 0.72, low: 0.12 },
  },
];

function MiniBar({ value, color, maxValue = 1 }: { value: number; color: string; maxValue?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
      <div style={{ flex: 1, height: '3px', background: '#E0DDD6', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{ width: `${(value / maxValue) * 100}%`, height: '100%', background: color }} />
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6B6963', minWidth: '28px', textAlign: 'right' }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}
import type { HexCell } from './data';

function Histogram({ field, color }: { field: keyof HexCell; color: string }) {
  const { hexCells } = useData();
  const values = hexCells.map((c: any) => c[field] as number);
  const BINS = 8;
  const counts = Array(BINS).fill(0);
  values.forEach((v: any) => {
    const bin = Math.min(BINS - 1, Math.floor(v * BINS));
    counts[bin]++;
  });
  const maxCount = Math.max(...counts);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '40px' }}>
      {counts.map((count, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(count / maxCount) * 100}%`,
            background: color,
            opacity: 0.3 + (i / BINS) * 0.7,
            minHeight: count > 0 ? '2px' : '0',
          }}
        />
      ))}
    </div>
  );
}

export default function DataLayers({ defaultLayer = 'demand' }: { defaultLayer?: string }) {
  const { hexCells } = useData();
  const [activeLayer, setActiveLayer] = useState(defaultLayer);
  const layer = LAYERS.find(l => l.id === activeLayer) ?? LAYERS[0];

  const sortedCells = [...hexCells].sort((a, b) => (b[layer.field] as number) - (a[layer.field] as number));

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#F4F3EF' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid #E0DDD6',
        background: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
      }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, padding: '0 16px 12px', borderBottom: '1px solid #E0DDD6' }}>
          Data Layers
        </div>
        {LAYERS.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: activeLayer === l.id ? l.bgColor : 'transparent',
              border: 'none',
              borderLeft: `2px solid ${activeLayer === l.id ? l.color : 'transparent'}`,
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: '1px solid #E0DDD6',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: activeLayer === l.id ? '#191918' : '#6B6963', fontWeight: activeLayer === l.id ? 600 : 400 }}>
              {l.label}
            </span>
          </button>
        ))}

        <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #E0DDD6' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '6px' }}>
            H3 Resolution
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#191918' }}>Level 9</div>
          <div style={{ fontSize: '10px', color: '#9B9690', marginTop: '2px' }}>~0.105 km² per cell</div>
          <div style={{ fontSize: '10px', color: '#9B9690', marginTop: '4px' }}>{hexCells.length} active zones</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {/* Layer header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: layer.color }} />
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#191918' }}>{layer.label}</h1>
            </div>
            <p style={{ fontSize: '12px', color: '#6B6963', maxWidth: '480px', lineHeight: '1.5' }}>
              {layer.description}
            </p>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>
              Source: {layer.source}
            </div>
          </div>
          <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px' }}>
            Synthetic Data
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Mean', value: layer.stats.mean.toFixed(2) },
            { label: 'Median', value: layer.stats.median.toFixed(2) },
            { label: 'Maximum', value: layer.stats.high.toFixed(2) },
            { label: 'Minimum', value: layer.stats.low.toFixed(2) },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '14px', border: '1px solid #E0DDD6', background: '#FAFAF8' }}>
              <div style={{ fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', color: '#191918' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Distribution histogram */}
        <div style={{ border: '1px solid #E0DDD6', padding: '16px', background: '#FAFAF8', marginBottom: '24px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '8px' }}>
            Distribution — {hexCells.length} H3 Zones
          </div>
          <Histogram field={layer.field} color={layer.color} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '9px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>0.00</span>
            <span style={{ fontSize: '9px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>0.50</span>
            <span style={{ fontSize: '9px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>1.00</span>
          </div>
        </div>

        {/* Zone ranking */}
        <div style={{ border: '1px solid #E0DDD6', background: '#FAFAF8' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0DDD6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600 }}>
              Zone Rankings — {layer.label}
            </div>
            <div style={{ fontSize: '10px', color: '#9B9690' }}>Sorted by {layer.unit}</div>
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {sortedCells.slice(0, 20).map((cell, i) => {
              const val = cell[layer.field] as number;
              const hasProject = !!cell.projectId;
              return (
                <div key={`${cell.q}-${cell.r}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  gap: '12px',
                  borderBottom: '1px solid #F0EEE8',
                  background: hasProject ? '#F0F4FF' : 'transparent',
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#9B9690', width: '24px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#9B9690' }}>
                        ({cell.q},{cell.r})
                      </span>
                      {cell.ward && (
                        <span style={{ fontSize: '11px', color: '#191918' }}>{cell.ward}</span>
                      )}
                      {hasProject && (
                        <span style={{ background: '#EEF2FF', color: '#1B4FD8', fontSize: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '1px 5px' }}>
                          Project
                        </span>
                      )}
                    </div>
                    <MiniBar value={val} color={layer.color} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
