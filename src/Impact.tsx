import { useState } from 'react';
import { useData } from './DataProvider';

function BeforeAfterBar({ label, before, after, max = 1, color }: {
  label: string;
  before: number;
  after: number;
  max?: number;
  color: string;
}) {
  const safeBefore = typeof before === 'number' && !isNaN(before) ? before : 0;
  const safeAfter = typeof after === 'number' && !isNaN(after) ? after : 0;
  const improvement = safeAfter - safeBefore;
  
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#6B6963' }}>{label}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: improvement > 0 ? '#15803D' : '#B91C1C' }}>
          {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}
        </span>
      </div>
      <div style={{ position: 'relative', height: '6px', background: '#E0DDD6', borderRadius: '2px', overflow: 'visible', marginBottom: '2px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(safeBefore / max) * 100}%`, background: '#C4C1BA', borderRadius: '2px', opacity: 0.5 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(safeAfter / max) * 100}%`, background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '9px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>Before: {safeBefore.toFixed(2)}</span>
        <span style={{ fontSize: '9px', color: '#191918', fontFamily: "'DM Mono', monospace" }}>After: {safeAfter.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function Impact() {
  const { projects, simulateImpact } = useData();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const summaryStats = [
    { label: 'Projects Simulated', value: '10', unit: '' },
    { label: 'Population Affected', value: '2.4M', unit: 'est.' },
    { label: 'Avg Infra Improvement', value: '+0.39', unit: 'index pts' },
    { label: 'Projected Demand Reduction', value: '−48%', unit: '' },
  ];

  const selectedProject = projects.find(p => p.id === selectedId);

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#F4F3EF' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid #E0DDD6', background: '#FAFAF8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '6px' }}>
                Impact Measurement
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#191918', marginBottom: '4px' }}>
                Simulated Intervention Outcomes
              </h1>
              <p style={{ fontSize: '12px', color: '#6B6963', maxWidth: '520px', lineHeight: '1.5' }}>
                Projected before/after comparison for all recommended interventions. Not a real-world forecast — synthetic simulation using configured assumptions.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px', display: 'inline-block', marginBottom: '6px' }}>
                Synthetic Simulation
              </div>
              <div style={{ fontSize: '10px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>
                Assumption: +0.35 condition improvement
              </div>
              <div style={{ fontSize: '10px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>
                Demand reduction: −50%
              </div>
            </div>
          </div>

          {/* Summary metrics */}
          <div style={{ display: 'flex', gap: '0', marginTop: '24px', border: '1px solid #E0DDD6' }}>
            {summaryStats.map((stat, i) => (
              <div key={i} style={{
                flex: 1,
                padding: '14px 20px',
                borderRight: i < summaryStats.length - 1 ? '1px solid #E0DDD6' : 'none',
              }}>
                <div style={{ fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', color: '#191918' }}>{stat.value}</span>
                  {stat.unit && <span style={{ fontSize: '10px', color: '#9B9690' }}>{stat.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project grid */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '16px' }}>
            Individual Project Simulations
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {projects.map(project => {
              const isSelected = project.id === selectedId;
              const conditionImprovement = project.impact.afterCondition - project.impact.beforeCondition;
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedId(project.id === selectedId ? null : project.id)}
                  style={{
                    border: `1px solid ${isSelected ? '#1B4FD8' : '#E0DDD6'}`,
                    background: isSelected ? '#F5F8FF' : '#FAFAF8',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#9B9690' }}>
                          #{String(project.rank).padStart(2, '0')}
                        </span>
                        <span className={project.status === 'High Priority' ? 'priority-badge-high' : 'priority-badge-medium'}>
                          {project.status === 'High Priority' ? 'High' : 'Medium'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#191918' }}>{project.name}</div>
                      <div style={{ fontSize: '10px', color: '#9B9690', marginTop: '1px' }}>{project.ward.split(' (')[0]}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '16px', color: '#15803D', fontWeight: 500 }}>
                        +{conditionImprovement.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '9px', color: '#9B9690', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Condition
                      </div>
                    </div>
                  </div>

                  <BeforeAfterBar
                    label="Infrastructure Condition"
                    before={project.impact.beforeCondition}
                    after={project.impact.afterCondition}
                    color="#15803D"
                  />

                  {isSelected && (
                    <>
                      <BeforeAfterBar
                        label="Deficit Index"
                        before={project.impact.beforeDeficit}
                        after={project.impact.afterDeficit}
                        color="#B91C1C"
                      />
                      <div style={{ marginTop: '10px', borderTop: '1px solid #E0DDD6', paddingTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#6B6963' }}>Citizen Demand (scale)</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#15803D' }}>
                            {project.impact.beforeDemand} → {project.impact.afterDemand}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#6B6963' }}>TOPSIS Score</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#1B4FD8' }}>
                            {project.topsis.toFixed(4)}
                          </span>
                        </div>
                        <div style={{ marginTop: '8px', padding: '8px', background: '#F0EEE8', fontSize: '10px', color: '#6B6963', lineHeight: '1.5' }}>
                          {project.recommendation}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: '24px', padding: '14px 16px', border: '1px solid #E0DDD6', background: '#FAFAF8', borderLeft: '3px solid #B45309' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B45309', fontWeight: 600, marginBottom: '6px' }}>
              Simulation Disclaimer
            </div>
            <div style={{ fontSize: '11px', color: '#6B6963', lineHeight: '1.6' }}>
              All impact projections are based on synthetic demonstration data and configured assumptions. Intervention is assumed to improve infrastructure condition by +0.35 index points. Citizen demand is assumed to decrease by 50% following successful intervention. These simulations are not real-world forecasts and should not be used for actual policy decisions without validated data and stakeholder review.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
