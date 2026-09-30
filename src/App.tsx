import { useState } from 'react';
import Dashboard from './Dashboard';
import PriorityExplorer from './PriorityExplorer';
import DataLayers from './DataLayers';
import Impact from './Impact';
import CitizenPortal from './CitizenPortal';
import { DataProvider } from './DataProvider';

type Screen = 'citizen' | 'overview' | 'demand' | 'infrastructure' | 'priorities' | 'impact';

const NAV_ITEMS: { id: Screen; label: string }[] = [
  { id: 'citizen', label: 'Citizen Portal' },
  { id: 'overview', label: 'Overview' },
  { id: 'demand', label: 'Demand' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'priorities', label: 'Priorities' },
  { id: 'impact', label: 'Impact' },
];

function Navigation({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  return (
    <nav style={{
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      borderBottom: '1px solid #E0DDD6',
      background: '#FAFAF8',
      flexShrink: 0,
      gap: '0',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '36px', cursor: 'pointer' }} onClick={() => onNavigate('overview')}>
        <div style={{
          width: '24px',
          height: '24px',
          background: '#1B4FD8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <polygon points="7,1 13,4.5 13,9.5 7,13 1,9.5 1,4.5" fill="none" stroke="white" strokeWidth="1.2" />
            <polygon points="7,4 10,5.75 10,8.25 7,10 4,8.25 4,5.75" fill="white" opacity="0.6" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#191918', letterSpacing: '-0.01em', lineHeight: 1 }}>
            Civic Intelligence
          </div>
          <div style={{ fontSize: '9px', color: '#9B9690', letterSpacing: '0.04em', lineHeight: 1, marginTop: '1px' }}>
            Infrastructure Prioritization
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-link${screen === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={{ background: 'none', border: 'none' }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 6px' }}>
            Demo Mode
          </div>
          <div style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 6px' }}>
            Synthetic Data
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#15803D' }} />
          <span style={{ fontSize: '10px', color: '#6B6963' }}>BRICS Hackathon 2024</span>
        </div>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#E0DDD6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="2.5" stroke="#6B6963" strokeWidth="1.2" />
            <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#6B6963" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('overview');

  return (
    <DataProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navigation screen={screen} onNavigate={setScreen} />

        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {screen === 'citizen' && <CitizenPortal />}
          {screen === 'overview' && <Dashboard />}
          {screen === 'demand' && <DataLayers defaultLayer="demand" />}
          {screen === 'infrastructure' && <DataLayers defaultLayer="deficit" />}
          {screen === 'priorities' && <PriorityExplorer />}
          {screen === 'impact' && <Impact />}
        </main>
      </div>
    </DataProvider>
  );
}
