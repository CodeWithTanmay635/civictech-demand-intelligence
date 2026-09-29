import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: 72.8777,
  latitude: 19.0760,
  zoom: 11,
  maxZoom: 20,
  pitch: 50,
  bearing: 0
};

export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [demandData, setDemandData] = useState<any[]>([]);
  const [demoData, setDemoData] = useState<any[]>([]);
  const [infraData, setInfraData] = useState<any[]>([]);
  const [investData, setInvestData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any[]>([]);
  
  const [showDemand, setShowDemand] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [showInfra, setShowInfra] = useState(false);
  const [showInvest, setShowInvest] = useState(false);
  const [showProjects, setShowProjects] = useState(true);

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Reset simulation when selected project changes
    setSimulationData(null);
  }, [selectedProject]);

  useEffect(() => {
    fetch('http://localhost:8081/api/v1/hotspots').then(r => r.json()).then(setDemandData).catch(e => console.error("API Error:", e));
    fetch('http://localhost:8081/api/v1/layers/demographics').then(r => r.json()).then(setDemoData).catch(e => console.error("API Error:", e));
    fetch('http://localhost:8081/api/v1/layers/infrastructure').then(r => r.json()).then(setInfraData).catch(e => console.error("API Error:", e));
    fetch('http://localhost:8081/api/v1/layers/investments').then(r => r.json()).then(setInvestData).catch(e => console.error("API Error:", e));
    fetch('http://localhost:8081/api/v1/projects/recommendations?limit=10').then(r => r.json()).then(setProjectData).catch(e => console.error("API Error:", e));
  }, []);

  const layers = [
    showDemand && new H3HexagonLayer({
      id: 'demand-layer',
      data: demandData,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 20,
      getHexagon: (d: any) => d.hex,
      getFillColor: [255, 0, 255, 180], // Magenta
      getElevation: (d: any) => d.count
    }),
    showDemo && new H3HexagonLayer({
      id: 'demo-layer',
      data: demoData,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 500,
      getHexagon: (d: any) => d.h3Index,
      getFillColor: [241, 224, 90, 180], // Yellow
      getElevation: (d: any) => d.vulnerabilityScore
    }),
    showInfra && new H3HexagonLayer({
      id: 'infra-layer',
      data: infraData,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 500,
      getHexagon: (d: any) => d.h3Index,
      getFillColor: [0, 240, 255, 180], // Cyan
      getElevation: (d: any) => (1 - d.conditionScore)
    }),
    showInvest && new H3HexagonLayer({
      id: 'invest-layer',
      data: investData,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 0.1,
      getHexagon: (d: any) => d.h3Index,
      getFillColor: [46, 160, 67, 180], // Green
      getElevation: (d: any) => Math.max(d.plannedBudget - d.spentBudget, 0)
    }),
    showProjects && new H3HexagonLayer({
      id: 'projects-layer',
      data: projectData,
      pickable: true,
      wireframe: true,
      filled: true,
      extruded: true,
      elevationScale: 800,
      getHexagon: (d: any) => d.h3_index,
      getFillColor: [255, 255, 255, 200], // White
      getElevation: (d: any) => d.priority_score,
      onClick: ({object}: any) => setSelectedProject(object)
    })
  ].filter(Boolean);

  const totalReports = demandData.reduce((acc: number, val: any) => acc + val.count, 0);
  const highestScore = projectData.length > 0 ? projectData[0].priority_score.toFixed(4) : "0.0000";

  return (
    <>
      <DeckGL
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onViewStateChange={({ viewState }: any) => setViewState(viewState)}
      >
        <Map
          mapLib={maplibregl as any}
          mapStyle={MAP_STYLE}
          reuseMaps
        />
      </DeckGL>

      <div className="dashboard-overlay">
        <div className="left-panel">
          <div className="sidebar">
            <h1>Demand Intelligence</h1>
            <div className="demo-warning">
              DEMO MODE — SYNTHETIC DATA
              <div style={{fontWeight:'normal', marginTop:'5px', fontSize:'0.7rem'}}>Citizen feedback & datasets are simulated for demonstration.</div>
            </div>
            
            <div className="metric-grid">
              <div className="metric-card">
                <div className="metric-title">Citizen Reports</div>
                <div className="metric-value" style={{ color: 'var(--accent-magenta)' }}>{totalReports || '...'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Priority Zones</div>
                <div className="metric-value" style={{ color: 'var(--accent-yellow)' }}>{demandData.length || '...'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Recommended Projects</div>
                <div className="metric-value" style={{ color: 'white' }}>{projectData.length || '...'}</div>
              </div>
              <div className="metric-card">
                <div className="metric-title">Highest Priority</div>
                <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>{highestScore}</div>
              </div>
            </div>

            <div className="layer-controls">
              <h3 style={{fontSize: '0.8rem', color:'var(--text-secondary)', textTransform:'uppercase'}}>Map Layers</h3>
              <label>
                <input type="checkbox" checked={showDemand} onChange={e => setShowDemand(e.target.checked)} />
                Citizen Demand
              </label>
              <label>
                <input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} />
                Vulnerability / Demographics
              </label>
              <label>
                <input type="checkbox" checked={showInfra} onChange={e => setShowInfra(e.target.checked)} />
                Infrastructure Deficit
              </label>
              <label>
                <input type="checkbox" checked={showInvest} onChange={e => setShowInvest(e.target.checked)} />
                Public Investment
              </label>
              <label>
                <input type="checkbox" checked={showProjects} onChange={e => setShowProjects(e.target.checked)} />
                Recommended Projects
              </label>
            </div>
          </div>
        </div>

        {selectedProject && (
          <div className="recommendation-panel">
            <h2>PROJECT RECOMMENDATION</h2>
            
            <div className="rec-section">
              <div className="rec-row"><span>Project:</span> <span className="val" style={{color: 'var(--accent-cyan)'}}>{selectedProject.project_type}</span></div>
              <div className="rec-row"><span>H3 Zone:</span> <span className="val">{selectedProject.h3_index}</span></div>
              <div className="rec-row"><span>Priority Rank:</span> <span className="val">#{selectedProject.rank}</span></div>
              <div className="rec-row"><span>TOPSIS Score:</span> <span className="val">{selectedProject.priority_score.toFixed(4)}</span></div>
            </div>

            <div className="rec-section">
              <h3>Why This Region? (Raw Inputs)</h3>
              <div className="rec-row"><span>Citizen Demand:</span> <span className="val">{selectedProject.criteria.citizen_demand?.toFixed(4) || '0.00'}</span></div>
              <div className="rec-row"><span>Vulnerability:</span> <span className="val">{selectedProject.criteria.vulnerability?.toFixed(4) || '0.00'}</span></div>
              <div className="rec-row"><span>Infrastructure Deficit:</span> <span className="val">{selectedProject.criteria.infrastructure_deficit?.toFixed(4) || '0.00'}</span></div>
              <div className="rec-row"><span>Investment Gap:</span> <span className="val">{selectedProject.criteria.investment_gap?.toFixed(4) || '0.00'}</span></div>
            </div>

            <div className="rec-section">
              <h3>AHP Weights</h3>
              <div className="rec-row"><span>Demand:</span> <span className="val">{(selectedProject.ahp_weights.citizen_demand * 100).toFixed(2)}%</span></div>
              <div className="rec-row"><span>Vulnerability:</span> <span className="val">{(selectedProject.ahp_weights.vulnerability * 100).toFixed(2)}%</span></div>
              <div className="rec-row"><span>Infrastructure:</span> <span className="val">{(selectedProject.ahp_weights.infrastructure_deficit * 100).toFixed(2)}%</span></div>
              <div className="rec-row"><span>Investment Gap:</span> <span className="val">{(selectedProject.ahp_weights.investment_gap * 100).toFixed(2)}%</span></div>
            </div>

            <div className="rec-section">
              <h3>TOPSIS Math</h3>
              <div className="rec-row"><span>Distance to Ideal (D+):</span> <span className="val">{selectedProject.topsis.distance_to_positive.toFixed(4)}</span></div>
              <div className="rec-row"><span>Distance to Negative (D-):</span> <span className="val">{selectedProject.topsis.distance_to_negative.toFixed(4)}</span></div>
              <div className="rec-row"><span>Closeness Coefficient:</span> <span className="val">{selectedProject.topsis.closeness_coefficient.toFixed(4)}</span></div>
            </div>

            <div className="rec-section">
              <h3>Justification</h3>
              <div className="justification-text">"{selectedProject.justification}"</div>
            </div>

            {!simulationData && (
              <button 
                className="simulate-btn" 
                onClick={async () => {
                  setIsSimulating(true);
                  try {
                    const res = await fetch(`http://localhost:8081/api/v1/projects/${selectedProject.id}/simulate-impact`, { method: 'POST' });
                    if (res.ok) {
                      const data = await res.json();
                      setSimulationData(data);
                    } else {
                      alert("Simulation API failed");
                    }
                  } catch (e) {
                    alert("Error reaching Simulation API");
                  } finally {
                    setIsSimulating(false);
                  }
                }}
                disabled={isSimulating}
              >
                {isSimulating ? 'Simulating...' : 'Simulate Project Impact'}
              </button>
            )}

            {simulationData && (
              <div className="impact-simulation">
                <h3>Impact Simulation</h3>
                <div className="impact-subtitle">Synthetic Demonstration</div>
                
                <table className="impact-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Before</th>
                      <th>After</th>
                      <th>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Condition</td>
                      <td>{simulationData.simulation.baseline.infrastructure_condition.toFixed(2)}</td>
                      <td>{simulationData.simulation.projected.infrastructure_condition.toFixed(2)}</td>
                      <td className={`impact-change ${simulationData.simulation.change.infrastructure_condition > 0 ? 'positive' : 'negative'}`}>
                        {simulationData.simulation.change.infrastructure_condition > 0 ? '+' : ''}{simulationData.simulation.change.infrastructure_condition.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Deficit</td>
                      <td>{simulationData.simulation.baseline.infrastructure_deficit.toFixed(2)}</td>
                      <td>{simulationData.simulation.projected.infrastructure_deficit.toFixed(2)}</td>
                      <td className={`impact-change ${simulationData.simulation.change.infrastructure_deficit < 0 ? 'positive' : 'negative'}`}>
                        {simulationData.simulation.change.infrastructure_deficit > 0 ? '+' : ''}{simulationData.simulation.change.infrastructure_deficit.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Demand</td>
                      <td>{simulationData.simulation.baseline.citizen_demand}</td>
                      <td>{simulationData.simulation.projected.citizen_demand}</td>
                      <td className={`impact-change ${simulationData.simulation.change.citizen_demand < 0 ? 'positive' : 'negative'}`}>
                        {simulationData.simulation.change.citizen_demand > 0 ? '+' : ''}{simulationData.simulation.change.citizen_demand}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="rec-section" style={{marginBottom: 0}}>
                  <h3>Assumptions</h3>
                  <ul className="assumptions-list">
                    {simulationData.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
