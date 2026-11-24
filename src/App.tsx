import React, { useEffect, useMemo, useState } from 'react';
import { EstimatorTab } from './components/EstimatorTab';
import { Header } from './components/Header';
import { PrintSummary } from './components/PrintSummary';
import { createDefaultProject } from './data/estimationData';
import { ProjectConfig } from './types';
import { calculateEstimate } from './utils/calculator';
import { exportEstimateToCSV } from './utils/formatters';

const STORAGE_ACTIVE_KEY = 'nirmaanest_active_project_v1';

function loadInitialActive(): ProjectConfig {
  const defaults = createDefaultProject();
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProjectConfig>;
      return {
        ...defaults,
        ...parsed,
        addOns: {
          ...defaults.addOns,
          ...(parsed.addOns ?? {}),
        },
      };
    }
  } catch {
    // ignore storage errors
  }
  return defaults;
}

export const App: React.FC = () => {
  const [project, setProject] = useState<ProjectConfig>(loadInitialActive);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(project));
    } catch {
      // ignore
    }
  }, [project]);

  const result = useMemo(() => calculateEstimate(project), [project]);

  const handleReset = () => {
    setProject(createDefaultProject());
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    exportEstimateToCSV(project, result);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] blueprint-dots text-stone-900">
      <Header
        projectName={project.name}
        onProjectNameChange={(name) =>
          setProject((prev) => ({ ...prev, name }))
        }
        onDownloadPDF={handleDownloadPDF}
        onDownloadCSV={handleDownloadCSV}
        onReset={handleReset}
      />

      <main className="no-print mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <EstimatorTab
          project={project}
          result={result}
          onChange={setProject}
          onDownloadPDF={handleDownloadPDF}
          onDownloadCSV={handleDownloadCSV}
        />
      </main>

      <PrintSummary project={project} result={result} />
    </div>
  );
};

export default App;
