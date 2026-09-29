import React, { useState } from 'react';
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

// Dummy data removed
export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [data, setData] = useState([]);

  React.useEffect(() => {
    fetch('http://localhost:8081/api/v1/hotspots')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const layers = [
    new H3HexagonLayer({
      id: 'h3-hexagon-layer',
      data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 20,
      getHexagon: (d: any) => d.hex,
      getFillColor: (d: any) => [255, 0, 255, 200], // Magenta
      getElevation: (d: any) => d.count
    })
  ];

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
          preventStyleDiffing={true}
        />
      </DeckGL>

      <div className="dashboard-overlay">
        <div className="sidebar">
          <h1>Demand Intelligence</h1>
          
          <div className="metric-card">
            <div className="metric-title">Demand Index</div>
            <div className="metric-value">84%</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-title">Active Requests</div>
            <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>14.2k</div>
          </div>
        </div>
      </div>
    </>
  );
}
