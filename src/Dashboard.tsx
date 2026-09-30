import { useState } from 'react';
import { useData } from './DataProvider';
import { AHP_WEIGHTS, type Project } from './data';
import MapView from './MapView';

const LAYER_OPTIONS = [
  { id: 'demand', label: 'Citizen Demand', color: '#1B4FD8' },
  { id: 'vulnerability', label: 'Vulnerability', color: '#D97706' },
  { id: 'deficit', label: 'Infrastructure Deficit', color: '#B91C1C' },
  { id: 'investment', label: 'Investment Gap', color: '#7C3AED' },
  { id: 'recommended', label: 'Recommended Projects', color: '#3B82F6' },
];

function EvidenceBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#6B6963', letterSpacing: '0.02em' }}>{label}</span>
        <span style={{ fontSize: '12px', fontFamily: "'DM Mono', monospace", color: '#191918', fontWeight: 500 }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: '#E0DDD6', borderRadius: '1px', overflow: 'hidden' }}>
        <div
          className="evidence-bar-fill"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

function MetricStrip() {
  const { projects, hexCells } = useData() as any;
  const demandCount = hexCells ? hexCells.filter((c: any) => c.demand > 0).length : 0;
  const maxTopsis = projects && projects.length > 0 ? Math.max(...projects.map((p: any) => p.topsis)) : 0;

  const metrics = [
    { label: 'Citizen Demand Zones', value: demandCount.toLocaleString(), unit: '' },
    { label: 'Priority Zones', value: projects ? projects.length.toString() : '0', unit: '' },
    { label: 'Recommended Projects', value: projects ? projects.length.toString() : '0', unit: '' },
    { label: 'Highest Priority', value: maxTopsis > 0 ? maxTopsis.toFixed(3) : '0.000', unit: 'TOPSIS' },
  ];
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid #E0DDD6',
      background: '#FAFAF8',
      padding: '0 24px',
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          padding: '10px 24px 10px 0',
          marginRight: '24px',
          borderRight: i < metrics.length - 1 ? '1px solid #E0DDD6' : 'none',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6963', fontWeight: 500, marginBottom: '2px' }}>
            {m.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '22px', fontFamily: "'DM Mono', monospace", fontWeight: 400, color: '#191918', letterSpacing: '-0.02em' }}>
              {m.value}
            </span>
            {m.unit && (
              <span style={{ fontSize: '9px', color: '#9B9690', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.unit}</span>
            )}
          </div>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '10px', color: '#9B9690', letterSpacing: '0.04em' }}>
          AHP → TOPSIS · Synthetic Dataset
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D' }} />
          <span style={{ fontSize: '9px', color: '#15803D', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            Models Active
          </span>
        </div>
      </div>
    </div>
  );
}

function LayerControl({ activeLayers, onToggle }: { activeLayers: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      background: 'rgba(14, 18, 28, 0.92)',
      border: '1px solid rgba(42, 53, 80, 0.8)',
      backdropFilter: 'blur(8px)',
      padding: '12px 14px',
      minWidth: '180px',
      zIndex: 10,
    }}>
      <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A5A7A', fontWeight: 600, marginBottom: '10px' }}>
        Map Layers
      </div>
      {LAYER_OPTIONS.map(layer => {
        const active = activeLayers.has(layer.id);
        return (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: active ? layer.color : 'transparent',
              border: `1.5px solid ${active ? layer.color : '#3A4D6A'}`,
              flexShrink: 0,
              transition: 'all 0.15s',
            }} />
            <span style={{
              fontSize: '11px',
              color: active ? '#D4DCF0' : '#5A6E8E',
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.15s',
            }}>
              {layer.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DecisionPanel({ project, onSimulate, showImpact, onBack, isSimulating }: {
  project: Project | null;
  onSimulate: () => void;
  showImpact: boolean;
  onBack: () => void;
  isSimulating?: boolean;
}) {
  const { projects } = useData();
  if (!project) {
    return (
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '8px' }}>
            Priority Intervention
          </div>
          <div style={{ color: '#6B6963', fontSize: '13px', lineHeight: '1.5' }}>
            Select a recommended project on the map to view intervention analysis and priority evidence.
          </div>
        </div>
        <div style={{ borderTop: '1px solid #E0DDD6', paddingTop: '16px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '12px' }}>
            Decision Framework
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            {['Citizen Data', 'Context Data', 'AHP', 'TOPSIS'].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: i < 2 ? '#6B6963' : '#1B4FD8', fontWeight: i >= 2 ? 600 : 400 }}>{item}</span>
                {i < arr.length - 1 && <span style={{ color: '#C4C1BA', fontSize: '10px' }}>+</span>}
              </div>
            ))}
            <span style={{ color: '#C4C1BA', fontSize: '10px' }}>=</span>
            <span style={{ fontSize: '10px', color: '#15803D', fontWeight: 600 }}>Priority</span>
          </div>
          <div style={{ fontSize: '11px', color: '#6B6963', lineHeight: '1.6' }}>
            The AHP model structures decision criteria using pairwise comparisons. TOPSIS ranks alternatives by distance to the ideal solution.
          </div>
        </div>
        <div style={{ borderTop: '1px solid #E0DDD6', paddingTop: '16px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '8px' }}>
            Top Candidates
          </div>
          {projects.slice(0, 5).map(p => (
            <div key={p.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid #F0EEE8',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#9B9690' }}>
                  {String(p.rank).padStart(2, '0')}
                </span>
                <span style={{ fontSize: '11px', color: '#191918' }}>{p.name}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#1B4FD8', fontWeight: 500 }}>
                {p.topsis.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showImpact && project?.impact) {
    return (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '4px' }}>
              Impact Simulation
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#191918' }}>{project.name}</div>
          </div>
          <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 7px' }}>
            Synthetic
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E0DDD6', paddingTop: '14px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '10px' }}>
            Before / After Comparison
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '4px 0', color: '#9B9690', fontWeight: 500, fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Metric</th>
                <th style={{ textAlign: 'center', padding: '4px 0', color: '#9B9690', fontWeight: 500, fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Before</th>
                <th style={{ textAlign: 'center', padding: '4px 0', color: '#9B9690', fontWeight: 500, fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>After</th>
                <th style={{ textAlign: 'center', padding: '4px 0', color: '#9B9690', fontWeight: 500, fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Δ</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'Infra Condition',
                  before: project.impact.beforeCondition.toFixed(2),
                  after: project.impact.afterCondition.toFixed(2),
                  delta: `+${(project.impact.afterCondition - project.impact.beforeCondition).toFixed(2)}`,
                  positive: true,
                },
                {
                  label: 'Deficit Index',
                  before: project.impact.beforeDeficit.toFixed(2),
                  after: project.impact.afterDeficit.toFixed(2),
                  delta: `${(project.impact.afterDeficit - project.impact.beforeDeficit).toFixed(2)}`,
                  positive: false,
                },
                {
                  label: 'Citizen Demand',
                  before: project.impact.beforeDemand,
                  after: project.impact.afterDemand,
                  delta: `${project.impact.afterDemand - project.impact.beforeDemand}`,
                  positive: false,
                },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0EEE8' }}>
                  <td style={{ padding: '8px 0', color: '#191918', fontSize: '11px' }}>{row.label}</td>
                  <td style={{ padding: '8px 0', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6B6963' }}>{row.before}</td>
                  <td style={{ padding: '8px 0', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#191918' }}>{row.after}</td>
                  <td style={{ padding: '8px 0', textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#15803D', fontWeight: 500 }}>
                    {row.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#F0EEE8', padding: '12px', borderLeft: '2px solid #E0DDD6' }}>
          <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '6px' }}>
            Assumptions
          </div>
          {[
            'Intervention is assumed to improve infrastructure condition by +0.35.',
            'Citizen demand is assumed to decrease by 50% following intervention.',
            'This simulation is not a real-world forecast.',
          ].map((note, i) => (
            <div key={i} style={{ fontSize: '10px', color: '#6B6963', lineHeight: '1.5', marginBottom: '3px' }}>
              · {note}
            </div>
          ))}
        </div>

        <button className="btn-secondary" onClick={onBack} style={{ width: '100%', justifyContent: 'center' }}>
          ← Back to Analysis
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E0DDD6', paddingBottom: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '6px' }}>
          Priority Intervention
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '22px',
            fontWeight: 300,
            color: '#9B9690',
            lineHeight: 1,
            paddingTop: '3px',
            minWidth: '30px',
          }}>
            #{String(project.rank).padStart(2, '0')}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#191918', lineHeight: 1.2, marginBottom: '4px' }}>
              {project.name}
            </div>
            <div style={{ fontSize: '10px', color: '#9B9690', fontFamily: "'DM Mono', monospace" }}>
              {project.category} · {project.ward}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Score */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #E0DDD6', paddingBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '3px' }}>
            Priority Score
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '28px', fontWeight: 400, color: '#1B4FD8', letterSpacing: '-0.02em' }}>
            {project.priorityScore.toFixed(4)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '3px' }}>
            H3 Zone
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6B6963', marginTop: '4px', wordBreak: 'break-all' }}>
            {project.h3}
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={project.status === 'High Priority'
              ? { background: '#FEE2E2', color: '#991B1B', fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px' }
              : { background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px' }
            }>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Why this zone */}
      <div style={{ borderBottom: '1px solid #E0DDD6', paddingBottom: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '10px' }}>
          Why This Zone?
        </div>
        <div style={{ fontSize: '10px', color: '#9B9690', marginBottom: '8px', lineHeight: 1.4 }}>
          AHP decision weights — share of priority formula
        </div>
        <EvidenceBar label="Citizen Demand" value={AHP_WEIGHTS.demand} color="#1B4FD8" />
        <EvidenceBar label="Vulnerability" value={AHP_WEIGHTS.vulnerability} color="#D97706" />
        <EvidenceBar label="Infrastructure Deficit" value={AHP_WEIGHTS.deficit} color="#B91C1C" />
        <EvidenceBar label="Investment Gap" value={AHP_WEIGHTS.investment} color="#7C3AED" />

        <div style={{ marginTop: '10px' }}>
          {[
            { label: 'Demand Score', value: project.demand.toFixed(2), color: '#1B4FD8' },
            { label: 'Vulnerability', value: project.vulnerability.toFixed(2), color: '#D97706' },
            { label: 'Infra Deficit', value: project.deficit.toFixed(2), color: '#B91C1C' },
            { label: 'Investment Gap', value: project.investmentGap.toFixed(2), color: '#7C3AED' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F0EEE8' }}>
              <span style={{ fontSize: '11px', color: '#6B6963' }}>{row.label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: row.color, fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Engine */}
      <div style={{ borderBottom: '1px solid #E0DDD6', paddingBottom: '14px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '10px' }}>
          Decision Engine
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#191918', padding: '2px 6px', border: '1px solid #E0DDD6', fontFamily: "'DM Mono', monospace" }}>AHP</span>
          <span style={{ color: '#9B9690', fontSize: '12px' }}>→</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#1B4FD8', padding: '2px 6px', border: '1px solid #C7D7F8', fontFamily: "'DM Mono', monospace" }}>TOPSIS</span>
        </div>
        {[
          { label: 'TOPSIS Score', value: project.topsis.toFixed(4) },
          { label: 'Distance to Ideal', value: project.distanceToIdeal.toFixed(4) },
          { label: 'Distance from Anti-Ideal', value: project.distanceFromIdeal.toFixed(4) },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0EEE8' }}>
            <span style={{ fontSize: '11px', color: '#6B6963' }}>{row.label}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#191918' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div>
        <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9690', fontWeight: 600, marginBottom: '8px' }}>
          Recommended Action
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#191918', marginBottom: '6px' }}>{project.name}</div>
        <div style={{ fontSize: '11px', color: '#6B6963', lineHeight: '1.6', marginBottom: '14px' }}>
          {project.recommendation}
        </div>
        <button className="btn-primary" onClick={onSimulate} style={{ width: '100%', justifyContent: 'center' }}>
          Simulate Impact
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { projects, simulateImpact, loading, error } = useData() as any;
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['demand', 'recommended']));
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null);
  const [showImpact, setShowImpact] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedProject = selectedProjectId ? projects.find((p: any) => p.id === selectedProjectId) ?? null : null;

  function toggleLayer(id: string) {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        if (['demand', 'vulnerability', 'deficit', 'investment'].includes(id)) {
          ['demand', 'vulnerability', 'deficit', 'investment'].forEach(l => next.delete(l));
        }
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <MetricStrip />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', background: '#1A2234', overflow: 'hidden' }}>
          <MapView
            activeLayers={activeLayers}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => { setSelectedProjectId(id); setShowImpact(false); }}
            hoveredProjectId={hoveredProjectId}
            onHoverProject={setHoveredProjectId}
          />
          <LayerControl activeLayers={activeLayers} onToggle={toggleLayer} />

          {/* Hovered project tooltip */}
          {hoveredProjectId && !selectedProjectId && (() => {
            const p = projects.find((pr: any) => pr.id === hoveredProjectId);
            if (!p) return null;
            return (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(14, 18, 28, 0.92)',
                border: '1px solid rgba(42, 53, 80, 0.8)',
                backdropFilter: 'blur(8px)',
                padding: '10px 14px',
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: '9px', color: '#4A5A7A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  #{String(p.rank).padStart(2, '0')} · {p.category}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#D4DCF0', marginBottom: '2px' }}>{p.name}</div>
                <div style={{ fontSize: '10px', color: '#5A6E8E' }}>{p.ward}</div>
                <div style={{ fontSize: '12px', fontFamily: "'DM Mono', monospace", color: '#3B82F6', marginTop: '4px' }}>
                  TOPSIS {p.topsis.toFixed(4)}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right panel */}
        <div style={{
          width: '340px',
          flexShrink: 0,
          borderLeft: '1px solid #E0DDD6',
          background: '#FAFAF8',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          position: 'relative',
        }}>
          {loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(250, 250, 248, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
              <div style={{ fontSize: '13px', color: '#6B6963', fontWeight: 500 }}>Loading spatial intelligence...</div>
            </div>
          )}
          {error && !loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(250, 250, 248, 0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#B91C1C', fontWeight: 500, marginBottom: '12px' }}>Unable to load spatial data</div>
              <div style={{ fontSize: '11px', color: '#6B6963', marginBottom: '16px' }}>{error}</div>
              <button className="btn-secondary" onClick={() => window.location.reload()}>Retry Connection</button>
            </div>
          )}
          {!loading && !error && projects.length === 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(250, 250, 248, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
              <div style={{ fontSize: '13px', color: '#6B6963', fontWeight: 500 }}>No spatial records available</div>
            </div>
          )}
          <DecisionPanel
            project={selectedProject}
            onSimulate={async () => {
                  if (!selectedProject) return;
                  setIsSimulating(true);
                  await simulateImpact(selectedProject.id);
                  setIsSimulating(false);
                  setShowImpact(true);
                }}
                isSimulating={isSimulating}
            showImpact={showImpact}
            onBack={() => setShowImpact(false)}
          />
        </div>
      </div>
    </div>
  );
}
