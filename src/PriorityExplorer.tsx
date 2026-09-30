import { useState } from 'react';
import { useData } from './DataProvider';

export default function PriorityExplorer() {
  const { projects } = useData();
  const [sortKey, setSortKey] = useState<'topsis' | 'demand' | 'vulnerability' | 'deficit'>('topsis');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const sorted = [...projects].sort((a, b) => b[sortKey] - a[sortKey]);

  const COLS = [
    { key: 'rank', label: 'Rank', width: '52px' },
    { key: 'name', label: 'Project', width: 'auto' },
    { key: 'ward', label: 'Location', width: '160px' },
    { key: 'demand', label: 'Demand', width: '72px', sortable: true },
    { key: 'vulnerability', label: 'Vuln.', width: '72px', sortable: true },
    { key: 'deficit', label: 'Deficit', width: '72px', sortable: true },
    { key: 'topsis', label: 'TOPSIS', width: '80px', sortable: true },
    { key: 'status', label: 'Status', width: '110px' },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#F4F3EF' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', borderBottom: '1px solid #E0DDD6', background: '#FAFAF8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '6px' }}>
              Priority Explorer
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191918', marginBottom: '4px' }}>
              Infrastructure Interventions
            </h1>
            <p style={{ fontSize: '12px', color: '#6B6963' }}>
              Evidence-based infrastructure intervention candidates · AHP–TOPSIS ranking
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px' }}>
              Demo Mode
            </div>
            <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px' }}>
              Synthetic Data
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: '32px', marginBottom: '16px' }}>
          {[
            { label: 'Total Candidates', value: '10' },
            { label: 'High Priority', value: '6' },
            { label: 'Medium Priority', value: '4' },
            { label: 'Avg TOPSIS Score', value: '0.803' },
          ].map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 500, marginBottom: '2px' }}>{m.label}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '18px', color: '#191918' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 32px 32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1px' }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: '#F4F3EF', zIndex: 5 }}>
              {COLS.map(col => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    textAlign: col.key === 'rank' || col.key === 'demand' || col.key === 'vulnerability' || col.key === 'deficit' || col.key === 'topsis' ? 'center' : 'left',
                    padding: '12px 8px',
                    fontSize: '9px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: 'sortable' in col && col.sortable && sortKey === col.key ? '#1B4FD8' : '#9B9690',
                    borderBottom: '1px solid #E0DDD6',
                    cursor: 'sortable' in col && col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => 'sortable' in col && col.sortable && setSortKey(col.key as typeof sortKey)}
                >
                  {col.label}
                  {'sortable' in col && col.sortable && (
                    <span style={{ marginLeft: '4px', opacity: sortKey === col.key ? 1 : 0.3 }}>
                      {sortKey === col.key ? '↓' : '↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((project, idx) => {
              const isSelected = project.id === selectedId;
              return (
                <tr
                  key={project.id}
                  className="table-row"
                  onClick={() => setSelectedId(project.id === selectedId ? null : project.id)}
                  style={{
                    background: isSelected ? '#EEF2FF' : idx % 2 === 0 ? '#FAFAF8' : '#F7F6F2',
                    borderBottom: '1px solid #E0DDD6',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                >
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#9B9690' }}>
                      {String(project.rank).padStart(2, '0')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#191918', marginBottom: '2px' }}>
                      {project.name}
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#9B9690' }}>
                      {project.h3}
                    </div>
                    {isSelected && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#6B6963', lineHeight: '1.5', maxWidth: '400px' }}>
                        {project.recommendation}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ fontSize: '12px', color: '#191918' }}>{project.ward.split(' (')[0]}</div>
                    <div style={{ fontSize: '10px', color: '#9B9690' }}>
                      {project.ward.match(/\(([^)]+)\)/)?.[1] || ''}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#191918' }}>
                        {project.demand.toFixed(2)}
                      </span>
                      <div style={{ width: '36px', height: '2px', background: '#E0DDD6', borderRadius: '1px', overflow: 'hidden' }}>
                        <div style={{ width: `${project.demand * 100}%`, height: '100%', background: '#1B4FD8' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#191918' }}>
                        {project.vulnerability.toFixed(2)}
                      </span>
                      <div style={{ width: '36px', height: '2px', background: '#E0DDD6', borderRadius: '1px', overflow: 'hidden' }}>
                        <div style={{ width: `${project.vulnerability * 100}%`, height: '100%', background: '#D97706' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#191918' }}>
                        {project.deficit.toFixed(2)}
                      </span>
                      <div style={{ width: '36px', height: '2px', background: '#E0DDD6', borderRadius: '1px', overflow: 'hidden' }}>
                        <div style={{ width: `${project.deficit * 100}%`, height: '100%', background: '#B91C1C' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 500,
                      color: project.topsis > 0.85 ? '#1B4FD8' : project.topsis > 0.7 ? '#0F766E' : '#6B6963',
                    }}>
                      {project.topsis.toFixed(4)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={project.status === 'High Priority' ? 'priority-badge-high' : 'priority-badge-medium'}>
                      {project.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: '16px', padding: '12px 0', borderTop: '1px solid #E0DDD6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#9B9690' }}>
            10 interventions · Sorted by {sortKey} score · Click a row to expand
          </div>
          <div style={{ fontSize: '10px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>
            Mumbai Metropolitan Region · Synthetic Demonstration Data
          </div>
        </div>
      </div>
    </div>
  );
}
