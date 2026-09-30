import os

files = ['Dashboard.tsx', 'DataLayers.tsx', 'PriorityExplorer.tsx', 'Impact.tsx', 'MapView.tsx']
base_dir = r'd:/AI for Digital Public Infrastructure & Governance/src'

for file in files:
    path = os.path.join(base_dir, file)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Simple replace for imports
        content = content.replace("import { projects, AHP_WEIGHTS, type Project } from './data';", "import { useData } from './DataProvider';\nimport { AHP_WEIGHTS, type Project } from './data';")
        content = content.replace("import { projects } from './data';", "import { useData } from './DataProvider';")
        content = content.replace("import { hexCells, projects, type HexCell } from './data';", "import { useData } from './DataProvider';\nimport type { HexCell } from './data';")
        content = content.replace("import { projects, type Project } from './data';", "import { useData } from './DataProvider';\nimport type { Project } from './data';")
        
        # Inject hooks
        if file == 'Dashboard.tsx':
            content = content.replace('export default function Dashboard() {', 'export default function Dashboard() {\n  const { projects, simulateImpact } = useData();')
            # Fix decision panel
            content = content.replace('function DecisionPanel({ project, onSimulate, showImpact, onBack }: any) {', 'function DecisionPanel({ project, onSimulate, showImpact, onBack, isSimulating }: any) {')
            content = content.replace('<button className="btn-primary" onClick={onSimulate} style={{ width: \'100%\', justifyContent: \'center\' }}>\n          Simulate Project Impact\n        </button>', '<button className="btn-primary" onClick={onSimulate} style={{ width: \'100%\', justifyContent: \'center\' }} disabled={isSimulating}>\n          {isSimulating ? "Simulating..." : "Simulate Project Impact"}\n        </button>')
            content = content.replace('const [showImpact, setShowImpact] = useState(false);', 'const [showImpact, setShowImpact] = useState(false);\n  const [isSimulating, setIsSimulating] = useState(false);')
            
            # The click handler in Dashboard.tsx
            content = content.replace('onSimulate={() => setShowImpact(true)}', 'onSimulate={async () => {\n                  setIsSimulating(true);\n                  await simulateImpact(project.id);\n                  setIsSimulating(false);\n                  setShowImpact(true);\n                }}\n                isSimulating={isSimulating}')
        elif file == 'DataLayers.tsx':
            content = content.replace("export default function DataLayers({ defaultLayer = 'demand' }: { defaultLayer?: string }) {", "export default function DataLayers({ defaultLayer = 'demand' }: { defaultLayer?: string }) {\n  const { projects } = useData();")
        elif file == 'PriorityExplorer.tsx':
            content = content.replace('export default function PriorityExplorer() {', 'export default function PriorityExplorer() {\n  const { projects } = useData();')
        elif file == 'Impact.tsx':
            content = content.replace('export default function Impact() {', 'export default function Impact() {\n  const { projects, simulateImpact } = useData();')
            # Same fix for impact
            content = content.replace('onClick={() => setSelectedId(p.id)}', 'onClick={async () => { setSelectedId(p.id); if (!p.impact) await simulateImpact(p.id); }}')

        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

# Update App.tsx to use DataProvider
app_path = os.path.join(base_dir, 'App.tsx')
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace("import Impact from './Impact';", "import Impact from './Impact';\nimport { DataProvider } from './DataProvider';")
app_content = app_content.replace("export default function App() {", "export default function App() {")
app_content = app_content.replace("    <div style={{ display: 'flex'", "    <DataProvider>\n    <div style={{ display: 'flex'")
app_content = app_content.replace("    </div>\n  );", "    </div>\n    </DataProvider>\n  );")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)
