import React, { useState } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import DeckGL from '@deck.gl/react';
import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { TextLayer } from '@deck.gl/layers';
import { cellToLatLng } from 'h3-js';
import { useData } from './DataProvider';

// Dark background, no labels – matches the reference image exactly
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: 72.8777,
  latitude: 19.0760,
  zoom: 11,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

interface MapViewProps {
  activeLayers: Set<string>;
  selectedProjectId: number | null;
  onSelectProject: (id: number | null) => void;
  hoveredProjectId: number | null;
  onHoverProject: (id: number | null) => void;
}

export default function MapView({ activeLayers, selectedProjectId, onSelectProject, hoveredProjectId, onHoverProject }: MapViewProps) {
  const { hexCells, projects } = useData() as any;
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  // Compute label data for recommended projects (rank + TOPSIS score)
  const projectLabelData = projects.map((p: any) => {
    const [lat, lng] = cellToLatLng(p.h3);
    return {
      id: p.id,
      coordinates: [lng, lat],
      rank: String(p.rank).padStart(2, '0'),
      score: typeof p.topsis === 'number' ? p.topsis.toFixed(3) : '0.000',
      selected: p.id === selectedProjectId,
    };
  });

  const layers = [
    // ── Citizen Demand ─────────────────────────────────────────────────────
    activeLayers.has('demand') && new H3HexagonLayer({
      id: 'demand-layer',
      data: hexCells.filter((c: any) => c.demand > 0),
      pickable: false,
      wireframe: false,
      filled: true,
      extruded: false,
      getHexagon: (d: any) => d.h3,
      // Dark navy fill with opacity proportional to demand intensity
      getFillColor: (d: any) => {
        const intensity = Math.min(d.demand, 1);
        return [15 + Math.round(intensity * 40), 40 + Math.round(intensity * 60), 100 + Math.round(intensity * 80), 180];
      },
      getLineColor: [30, 60, 120, 60],
      lineWidthMinPixels: 1,
      updateTriggers: { getFillColor: [] }
    }),

    // ── Vulnerability ───────────────────────────────────────────────────────
    activeLayers.has('vulnerability') && new H3HexagonLayer({
      id: 'vulnerability-layer',
      data: hexCells.filter((c: any) => c.vulnerability > 0),
      pickable: false,
      wireframe: false,
      filled: true,
      extruded: false,
      getHexagon: (d: any) => d.h3,
      getFillColor: (d: any) => [180, 100, 10, Math.round(d.vulnerability * 180 + 40)],
      updateTriggers: { getFillColor: [] }
    }),

    // ── Infrastructure Deficit ──────────────────────────────────────────────
    activeLayers.has('deficit') && new H3HexagonLayer({
      id: 'deficit-layer',
      data: hexCells.filter((c: any) => c.deficit > 0),
      pickable: false,
      wireframe: false,
      filled: true,
      extruded: false,
      getHexagon: (d: any) => d.h3,
      getFillColor: (d: any) => [160, 20, 20, Math.round(d.deficit * 180 + 40)],
      updateTriggers: { getFillColor: [] }
    }),

    // ── Investment Gap ──────────────────────────────────────────────────────
    activeLayers.has('investment') && new H3HexagonLayer({
      id: 'investment-layer',
      data: hexCells.filter((c: any) => c.investmentGap > 0),
      pickable: false,
      wireframe: false,
      filled: true,
      extruded: false,
      getHexagon: (d: any) => d.h3,
      getFillColor: (d: any) => [100, 40, 200, Math.round(Math.min(d.investmentGap * 160, 200))],
      updateTriggers: { getFillColor: [] }
    }),

    // ── Recommended Projects — hex fill ────────────────────────────────────
    activeLayers.has('recommended') && new H3HexagonLayer({
      id: 'projects-fill-layer',
      data: projects,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: false,
      getHexagon: (d: any) => d.h3,
      getFillColor: (d: any) =>
        d.id === selectedProjectId
          ? [80, 160, 255, 220]          // bright selected
          : d.id === hoveredProjectId
          ? [60, 130, 230, 180]          // hover
          : [30, 80, 180, 140],         // default bright blue
      onClick: ({ object }: any) => onSelectProject(object?.id || null),
      onHover: ({ object }: any) => onHoverProject(object?.id || null),
      updateTriggers: { getFillColor: [selectedProjectId, hoveredProjectId] }
    }),

    // ── Recommended Projects — bright outline ──────────────────────────────
    activeLayers.has('recommended') && new H3HexagonLayer({
      id: 'projects-outline-layer',
      data: projects,
      pickable: false,
      wireframe: true,
      filled: false,
      extruded: false,
      getHexagon: (d: any) => d.h3,
      getLineColor: (d: any) =>
        d.id === selectedProjectId
          ? [120, 200, 255, 255]
          : [60, 140, 240, 200],
      lineWidthMinPixels: 2,
      updateTriggers: { getLineColor: [selectedProjectId] }
    }),

    // ── Recommended Projects — rank label (top: "01") ─────────────────────
    activeLayers.has('recommended') && new TextLayer({
      id: 'projects-rank-label',
      data: projectLabelData,
      getPosition: (d: any) => d.coordinates,
      getText: (d: any) => d.rank,
      getSize: 13,
      getColor: [255, 255, 255, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      getPixelOffset: [0, -8],
      fontFamily: "'DM Mono', 'Courier New', monospace",
      fontWeight: 700,
      pickable: false,
    }),

    // ── Recommended Projects — TOPSIS score label (bottom: "0.788") ────────
    activeLayers.has('recommended') && new TextLayer({
      id: 'projects-score-label',
      data: projectLabelData,
      getPosition: (d: any) => d.coordinates,
      getText: (d: any) => d.score,
      getSize: 10,
      getColor: [180, 220, 255, 220],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      getPixelOffset: [0, 8],
      fontFamily: "'DM Mono', 'Courier New', monospace",
      fontWeight: 400,
      pickable: false,
    }),
  ].filter(Boolean);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#0D1B2A' }}>
      <DeckGL
        layers={layers}
        initialViewState={viewState}
        controller={true}
        onViewStateChange={({ viewState: vs }: any) => setViewState(vs as typeof INITIAL_VIEW_STATE)}
        style={{ zIndex: '1' }}
      >
        <Map
          {...viewState}
          mapStyle={MAP_STYLE}
          reuseMaps
        />
      </DeckGL>
    </div>
  );
}
