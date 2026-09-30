export interface HexCell {
  q: number;
  r: number;
  demand: number;
  vulnerability: number;
  deficit: number;
  investmentGap: number;
  ward?: string;
  projectId?: number;
}

export interface Project {
  id: number;
  rank: number;
  name: string;
  category: string;
  categoryColor: string;
  h3: string;
  ward: string;
  q: number;
  r: number;
  demand: number;
  vulnerability: number;
  deficit: number;
  investmentGap: number;
  priorityScore: number;
  topsis: number;
  distanceToIdeal: number;
  distanceFromIdeal: number;
  recommendation: string;
  impact: {
    beforeCondition: number;
    afterCondition: number;
    beforeDeficit: number;
    afterDeficit: number;
    beforeDemand: number;
    afterDemand: number;
  };
  status: 'High Priority' | 'Medium Priority';
}

export const hexCells: HexCell[] = [
  // South tip (Colaba / Nariman Point)
  { q: 0, r: -5, demand: 0.21, vulnerability: 0.18, deficit: 0.15, investmentGap: 0.12, ward: 'Colaba' },
  { q: 0, r: -4, demand: 0.28, vulnerability: 0.22, deficit: 0.19, investmentGap: 0.15 },
  { q: -1, r: -4, demand: 0.25, vulnerability: 0.20, deficit: 0.17, investmentGap: 0.13 },
  { q: 1, r: -4, demand: 0.26, vulnerability: 0.23, deficit: 0.18, investmentGap: 0.14 },

  // Lower south (Fort / Churchgate)
  { q: 0, r: -3, demand: 0.32, vulnerability: 0.25, deficit: 0.22, investmentGap: 0.18 },
  { q: -1, r: -3, demand: 0.35, vulnerability: 0.28, deficit: 0.25, investmentGap: 0.20, ward: 'Cuffe Parade' },
  { q: 1, r: -3, demand: 0.29, vulnerability: 0.22, deficit: 0.20, investmentGap: 0.16 },
  { q: -2, r: -3, demand: 0.38, vulnerability: 0.31, deficit: 0.28, investmentGap: 0.22 },
  { q: 2, r: -3, demand: 0.31, vulnerability: 0.24, deficit: 0.21, investmentGap: 0.17 },

  // Mid-south (Parel / Worli / Dadar)
  { q: 0, r: -2, demand: 0.68, vulnerability: 0.55, deficit: 0.72, investmentGap: 0.48, ward: 'Dadar', projectId: 6 },
  { q: -1, r: -2, demand: 0.52, vulnerability: 0.48, deficit: 0.41, investmentGap: 0.35 },
  { q: 1, r: -2, demand: 0.55, vulnerability: 0.51, deficit: 0.44, investmentGap: 0.38 },
  { q: -2, r: -2, demand: 0.48, vulnerability: 0.44, deficit: 0.38, investmentGap: 0.32 },
  { q: 2, r: -2, demand: 0.62, vulnerability: 0.58, deficit: 0.69, investmentGap: 0.44, ward: 'Chembur', projectId: 8 },
  { q: -3, r: -2, demand: 0.42, vulnerability: 0.38, deficit: 0.33, investmentGap: 0.28 },
  { q: 3, r: -2, demand: 0.45, vulnerability: 0.41, deficit: 0.36, investmentGap: 0.30 },

  // Central south (Mahim / Sion)
  { q: 0, r: -1, demand: 0.61, vulnerability: 0.54, deficit: 0.58, investmentGap: 0.42 },
  { q: -1, r: -1, demand: 0.58, vulnerability: 0.74, deficit: 0.51, investmentGap: 0.55, ward: 'Worli', projectId: 9 },
  { q: 1, r: -1, demand: 0.82, vulnerability: 0.76, deficit: 0.71, investmentGap: 0.58, ward: 'Kurla', projectId: 2 },
  { q: -2, r: -1, demand: 0.54, vulnerability: 0.49, deficit: 0.46, investmentGap: 0.38 },
  { q: 2, r: -1, demand: 0.63, vulnerability: 0.57, deficit: 0.61, investmentGap: 0.46 },
  { q: -3, r: -1, demand: 0.49, vulnerability: 0.43, deficit: 0.41, investmentGap: 0.34 },
  { q: 3, r: -1, demand: 0.58, vulnerability: 0.52, deficit: 0.55, investmentGap: 0.41 },

  // Central (Bandra / Kurla complex)
  { q: 0, r: 0, demand: 0.65, vulnerability: 0.59, deficit: 0.63, investmentGap: 0.47 },
  { q: -1, r: 0, demand: 0.61, vulnerability: 0.55, deficit: 0.59, investmentGap: 0.43 },
  { q: 1, r: 0, demand: 0.69, vulnerability: 0.63, deficit: 0.66, investmentGap: 0.52 },
  { q: -2, r: 0, demand: 0.79, vulnerability: 0.69, deficit: 0.82, investmentGap: 0.63, ward: 'Bandra East', projectId: 3 },
  { q: 2, r: 0, demand: 0.67, vulnerability: 0.61, deficit: 0.64, investmentGap: 0.49 },
  { q: -3, r: 0, demand: 0.55, vulnerability: 0.50, deficit: 0.53, investmentGap: 0.39 },
  { q: 3, r: 0, demand: 0.74, vulnerability: 0.81, deficit: 0.65, investmentGap: 0.71, ward: 'Govandi', projectId: 4 },

  // Northern central (Dharavi / Andheri)
  { q: 0, r: 1, demand: 0.72, vulnerability: 0.65, deficit: 0.69, investmentGap: 0.54 },
  { q: -1, r: 1, demand: 0.68, vulnerability: 0.61, deficit: 0.65, investmentGap: 0.50 },
  { q: 1, r: 1, demand: 0.75, vulnerability: 0.68, deficit: 0.72, investmentGap: 0.57 },
  { q: -2, r: 1, demand: 0.72, vulnerability: 0.65, deficit: 0.69, investmentGap: 0.53 },
  { q: 2, r: 1, demand: 0.78, vulnerability: 0.71, deficit: 0.75, investmentGap: 0.61 },
  { q: -3, r: 1, demand: 0.64, vulnerability: 0.58, deficit: 0.61, investmentGap: 0.46 },
  { q: 3, r: 1, demand: 0.71, vulnerability: 0.64, deficit: 0.68, investmentGap: 0.52 },

  // Northern (Dharavi / Borivali)
  { q: 0, r: 2, demand: 0.76, vulnerability: 0.70, deficit: 0.73, investmentGap: 0.58 },
  { q: -1, r: 2, demand: 0.71, vulnerability: 0.64, deficit: 0.68, investmentGap: 0.53 },
  { q: 1, r: 2, demand: 0.79, vulnerability: 0.72, deficit: 0.76, investmentGap: 0.62 },
  { q: -2, r: 2, demand: 0.74, vulnerability: 0.67, deficit: 0.71, investmentGap: 0.56 },
  { q: 2, r: 2, demand: 0.91, vulnerability: 0.78, deficit: 0.88, investmentGap: 0.72, ward: 'Dharavi', projectId: 1 },
  { q: -3, r: 2, demand: 0.65, vulnerability: 0.71, deficit: 0.58, investmentGap: 0.62, ward: 'Borivali W.', projectId: 7 },
  { q: 3, r: 2, demand: 0.73, vulnerability: 0.66, deficit: 0.70, investmentGap: 0.55 },
  { q: 4, r: 2, demand: 0.67, vulnerability: 0.60, deficit: 0.64, investmentGap: 0.49 },

  // Far north (Andheri / Malad)
  { q: 0, r: 3, demand: 0.74, vulnerability: 0.67, deficit: 0.71, investmentGap: 0.56 },
  { q: -1, r: 3, demand: 0.71, vulnerability: 0.62, deficit: 0.78, investmentGap: 0.54, ward: 'Andheri W.', projectId: 5 },
  { q: 1, r: 3, demand: 0.77, vulnerability: 0.70, deficit: 0.74, investmentGap: 0.60 },
  { q: -2, r: 3, demand: 0.69, vulnerability: 0.62, deficit: 0.66, investmentGap: 0.51 },
  { q: 2, r: 3, demand: 0.73, vulnerability: 0.66, deficit: 0.70, investmentGap: 0.55 },
  { q: -3, r: 3, demand: 0.64, vulnerability: 0.58, deficit: 0.61, investmentGap: 0.46 },
  { q: 3, r: 3, demand: 0.54, vulnerability: 0.49, deficit: 0.61, investmentGap: 0.58, ward: 'Malad East', projectId: 10 },
];

export const projects: Project[] = [
  {
    id: 1, rank: 1,
    name: 'Water Supply Improvement',
    category: 'Water & Sanitation',
    categoryColor: '#1B4FD8',
    h3: '89608b18377ffff',
    ward: 'Dharavi (M/E Ward)',
    q: 2, r: 2,
    demand: 0.91, vulnerability: 0.78, deficit: 0.88, investmentGap: 0.72,
    priorityScore: 0.9650, topsis: 0.9650,
    distanceToIdeal: 0.0231, distanceFromIdeal: 0.5912,
    recommendation: 'Extremely high citizen demand combined with severe infrastructure deficit and elevated vulnerability makes water supply the highest-priority candidate in this zone.',
    impact: { beforeCondition: 0.12, afterCondition: 0.82, beforeDeficit: 0.88, afterDeficit: 0.18, beforeDemand: 3, afterDemand: 1 },
    status: 'High Priority',
  },
  {
    id: 2, rank: 2,
    name: 'Education Improvement',
    category: 'Education',
    categoryColor: '#0F766E',
    h3: '89608b19b5bffff',
    ward: 'Kurla (L Ward)',
    q: 1, r: -1,
    demand: 0.82, vulnerability: 0.76, deficit: 0.71, investmentGap: 0.58,
    priorityScore: 0.9266, topsis: 0.9266,
    distanceToIdeal: 0.0412, distanceFromIdeal: 0.5281,
    recommendation: 'High citizen demand combined with elevated vulnerability and infrastructure deficit makes this zone a high-priority candidate for education infrastructure improvement.',
    impact: { beforeCondition: 0.49, afterCondition: 0.84, beforeDeficit: 0.51, afterDeficit: 0.16, beforeDemand: 2, afterDemand: 1 },
    status: 'High Priority',
  },
  {
    id: 3, rank: 3,
    name: 'Road Network Upgrade',
    category: 'Transport',
    categoryColor: '#7C3AED',
    h3: '89608b1824fffff',
    ward: 'Bandra East (H/E Ward)',
    q: -2, r: 0,
    demand: 0.79, vulnerability: 0.69, deficit: 0.82, investmentGap: 0.63,
    priorityScore: 0.8912, topsis: 0.8912,
    distanceToIdeal: 0.0687, distanceFromIdeal: 0.5621,
    recommendation: 'Critical road network deficit combined with high citizen demand indicates urgent need for transport infrastructure intervention in this junction zone.',
    impact: { beforeCondition: 0.31, afterCondition: 0.76, beforeDeficit: 0.69, afterDeficit: 0.24, beforeDemand: 3, afterDemand: 1 },
    status: 'High Priority',
  },
  {
    id: 4, rank: 4,
    name: 'Healthcare Facility',
    category: 'Healthcare',
    categoryColor: '#B45309',
    h3: '89608b1873bffff',
    ward: 'Govandi (M/W Ward)',
    q: 3, r: 0,
    demand: 0.74, vulnerability: 0.81, deficit: 0.65, investmentGap: 0.71,
    priorityScore: 0.8471, topsis: 0.8471,
    distanceToIdeal: 0.0891, distanceFromIdeal: 0.4921,
    recommendation: 'Elevated vulnerability index combined with high investment gap and citizen demand for healthcare services indicates a critical service gap requiring immediate attention.',
    impact: { beforeCondition: 0.38, afterCondition: 0.79, beforeDeficit: 0.62, afterDeficit: 0.21, beforeDemand: 2, afterDemand: 1 },
    status: 'High Priority',
  },
  {
    id: 5, rank: 5,
    name: 'Sewerage Network',
    category: 'Sanitation',
    categoryColor: '#1B4FD8',
    h3: '89608b18a57ffff',
    ward: 'Andheri West (K/W Ward)',
    q: -1, r: 3,
    demand: 0.71, vulnerability: 0.62, deficit: 0.78, investmentGap: 0.54,
    priorityScore: 0.8124, topsis: 0.8124,
    distanceToIdeal: 0.1124, distanceFromIdeal: 0.4821,
    recommendation: 'Aging sewerage infrastructure with high deficit score and moderate citizen demand requires systemic intervention to prevent public health deterioration.',
    impact: { beforeCondition: 0.22, afterCondition: 0.71, beforeDeficit: 0.78, afterDeficit: 0.29, beforeDemand: 2, afterDemand: 1 },
    status: 'High Priority',
  },
  {
    id: 6, rank: 6,
    name: 'Public Transport Hub',
    category: 'Transport',
    categoryColor: '#7C3AED',
    h3: '89608b18227ffff',
    ward: 'Dadar (F/N Ward)',
    q: 0, r: -2,
    demand: 0.68, vulnerability: 0.55, deficit: 0.72, investmentGap: 0.48,
    priorityScore: 0.7689, topsis: 0.7689,
    distanceToIdeal: 0.1312, distanceFromIdeal: 0.4412,
    recommendation: 'High transit demand at central junction zone with infrastructure deficit suggests investment in a multimodal transport hub would significantly improve connectivity.',
    impact: { beforeCondition: 0.41, afterCondition: 0.78, beforeDeficit: 0.59, afterDeficit: 0.22, beforeDemand: 2, afterDemand: 1 },
    status: 'High Priority',
  },
  {
    id: 7, rank: 7,
    name: 'Affordable Housing',
    category: 'Housing',
    categoryColor: '#B45309',
    h3: '89608b18637ffff',
    ward: 'Borivali West (R/N Ward)',
    q: -3, r: 2,
    demand: 0.65, vulnerability: 0.71, deficit: 0.58, investmentGap: 0.62,
    priorityScore: 0.7214, topsis: 0.7214,
    distanceToIdeal: 0.1521, distanceFromIdeal: 0.4012,
    recommendation: 'High vulnerability in informal settlements combined with housing deficit and investment gap calls for targeted affordable housing intervention.',
    impact: { beforeCondition: 0.35, afterCondition: 0.73, beforeDeficit: 0.65, afterDeficit: 0.27, beforeDemand: 2, afterDemand: 1 },
    status: 'Medium Priority',
  },
  {
    id: 8, rank: 8,
    name: 'Solid Waste Management',
    category: 'Sanitation',
    categoryColor: '#0F766E',
    h3: '89608b18517ffff',
    ward: 'Chembur (M/E Ward)',
    q: 2, r: -2,
    demand: 0.62, vulnerability: 0.58, deficit: 0.69, investmentGap: 0.44,
    priorityScore: 0.6891, topsis: 0.6891,
    distanceToIdeal: 0.1812, distanceFromIdeal: 0.3981,
    recommendation: 'Waste management infrastructure deficit with moderate demand and vulnerability warrants systemic improvement to address growing solid waste challenges.',
    impact: { beforeCondition: 0.31, afterCondition: 0.68, beforeDeficit: 0.69, afterDeficit: 0.32, beforeDemand: 2, afterDemand: 1 },
    status: 'Medium Priority',
  },
  {
    id: 9, rank: 9,
    name: 'Slum Upgrading',
    category: 'Housing',
    categoryColor: '#B91C1C',
    h3: '89608b18777ffff',
    ward: 'Worli (G/S Ward)',
    q: -1, r: -1,
    demand: 0.58, vulnerability: 0.74, deficit: 0.51, investmentGap: 0.55,
    priorityScore: 0.6412, topsis: 0.6412,
    distanceToIdeal: 0.2012, distanceFromIdeal: 0.3621,
    recommendation: 'High vulnerability in informal settlements with moderate demand indicates need for targeted upgrading programs and improved service delivery.',
    impact: { beforeCondition: 0.28, afterCondition: 0.62, beforeDeficit: 0.72, afterDeficit: 0.38, beforeDemand: 2, afterDemand: 1 },
    status: 'Medium Priority',
  },
  {
    id: 10, rank: 10,
    name: 'Digital Infrastructure',
    category: 'Digital',
    categoryColor: '#6B6963',
    h3: '89608b18a17ffff',
    ward: 'Malad East (P/N Ward)',
    q: 3, r: 3,
    demand: 0.54, vulnerability: 0.49, deficit: 0.61, investmentGap: 0.58,
    priorityScore: 0.6121, topsis: 0.6121,
    distanceToIdeal: 0.2231, distanceFromIdeal: 0.3412,
    recommendation: 'Growing digital divide in northern zones indicates strategic opportunity for digital infrastructure investment to improve civic service delivery and economic inclusion.',
    impact: { beforeCondition: 0.34, afterCondition: 0.71, beforeDeficit: 0.66, afterDeficit: 0.29, beforeDemand: 1, afterDemand: 0 },
    status: 'Medium Priority',
  },
];

export const AHP_WEIGHTS = {
  demand: 0.4658,
  vulnerability: 0.2771,
  deficit: 0.1611,
  investment: 0.0960,
};
