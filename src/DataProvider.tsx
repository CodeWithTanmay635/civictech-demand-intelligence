import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project, HexCell } from './data';

interface DataContextType {
  projects: Project[];
  hexCells: HexCell[];
  loading: boolean;
  simulateImpact: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType>({ 
  projects: [], 
  hexCells: [], 
  loading: true, 
  simulateImpact: async () => {} 
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Omit<DataContextType, 'simulateImpact'> & { error: string | null }>({ projects: [], hexCells: [], loading: true, error: null });

  const simulateImpact = async (id: number) => {
    // ... logic unchanged ...
    try {
      const res = await fetch(`http://localhost:8081/api/v1/projects/${id}/simulate-impact`, { method: 'POST' });
      if (res.ok) {
        const sim = await res.json();
        setData(prev => ({
          ...prev,
          projects: prev.projects.map(p => {
            if (p.id === id) {
              return {
                ...p,
                impact: {
                  beforeCondition: sim.simulation.baseline.infrastructure_condition,
                  afterCondition: sim.simulation.projected.infrastructure_condition,
                  beforeDeficit: sim.simulation.baseline.infrastructure_deficit,
                  afterDeficit: sim.simulation.projected.infrastructure_deficit,
                  beforeDemand: sim.simulation.baseline.citizen_demand,
                  afterDemand: sim.simulation.projected.citizen_demand,
                  assumptions: sim.assumptions
                }
              };
            }
            return p;
          })
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      console.log("API START: Fetching all layers...");
      const startTime = Date.now();
      
      const fetchJson = async (url: string) => {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP error ${r.status} on ${url}`);
        const text = await r.text();
        if (!text) return [];
        return JSON.parse(text);
      };
      
      const [demandRes, demoRes, infraRes, investRes, projRes] = await Promise.all([
        fetchJson('http://localhost:8081/api/v1/hotspots'),
        fetchJson('http://localhost:8081/api/v1/layers/demographics'),
        fetchJson('http://localhost:8081/api/v1/layers/infrastructure'),
        fetchJson('http://localhost:8081/api/v1/layers/investments'),
        fetchJson('http://localhost:8081/api/v1/projects/recommendations?limit=10')
      ]);
      
      console.log(`API RESPONSE TIME: ${Date.now() - startTime}ms`);
      console.log(`API RESULT COUNT: hotspots=${demandRes.length}, demo=${demoRes.length}, projects=${projRes.length}`);

      const projects: Project[] = projRes.map((p: any) => ({
          id: p.id,
          rank: p.rank,
          name: p.project_type,
          category: 'Infrastructure',
          categoryColor: '#3B82F6',
          h3: p.h3_index,
          ward: 'Mumbai',
          q: 0, r: 0,
          priorityScore: p.priority_score,
          status: 'Recommended',
          demand: p.criteria.citizen_demand || 0.3,
          vulnerability: p.criteria.vulnerability || 0.3,
          deficit: p.criteria.infrastructure_deficit || 0.3,
          investmentGap: p.criteria.investment_gap || 0.3,
          topsis: p.topsis.closeness_coefficient,
          distanceToIdeal: p.topsis.distance_to_positive,
          distanceFromIdeal: p.topsis.distance_to_negative,
          recommendation: p.justification,
          impact: null
        }));

        const hexCells: HexCell[] = [];
        const hexMap = new Map<string, any>();
        demandRes.forEach((d: any) => {
          if (!hexMap.has(d.hex)) hexMap.set(d.hex, { q:0, r:0, demand: 0, vulnerability: 0, deficit: 0, investmentGap: 0 });
          hexMap.get(d.hex).demand = Math.min(d.count / 100, 1);
        });
        demoRes.forEach((d: any) => {
          if (!hexMap.has(d.h3Index)) hexMap.set(d.h3Index, { q:0, r:0, demand: 0, vulnerability: 0, deficit: 0, investmentGap: 0 });
          hexMap.get(d.h3Index).vulnerability = d.vulnerabilityScore;
        });
        infraRes.forEach((d: any) => {
          if (!hexMap.has(d.h3Index)) hexMap.set(d.h3Index, { q:0, r:0, demand: 0, vulnerability: 0, deficit: 0, investmentGap: 0 });
          hexMap.get(d.h3Index).deficit = 1 - d.conditionScore;
        });
        investRes.forEach((d: any) => {
          if (!hexMap.has(d.h3Index)) hexMap.set(d.h3Index, { q:0, r:0, demand: 0, vulnerability: 0, deficit: 0, investmentGap: 0 });
          hexMap.get(d.h3Index).investmentGap = Math.max(d.plannedBudget - d.spentBudget, 0) / 100000;
        });
        projects.forEach(p => {
            if (hexMap.has(p.h3)) {
                hexMap.get(p.h3).projectId = p.id;
            }
        });

        hexMap.forEach((v, k) => {
            hexCells.push({ h3: k, ...v } as any);
        });

        setData({ projects, hexCells, loading: false, error: null });
      } catch (err: any) {
        console.error("API ERROR:", err);
        setData(prev => ({ ...prev, loading: false, error: err.message || "Unable to load spatial data" }));
      }
    };
    loadData();
  }, []);

  return <DataContext.Provider value={{ ...data, simulateImpact }}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
