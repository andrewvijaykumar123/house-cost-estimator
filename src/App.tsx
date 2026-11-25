import React, { useEffect, useMemo, useState } from 'react';
import { EstimatorTab } from './components/EstimatorTab';
import { Header } from './components/Header';
import { PrintSummary } from './components/PrintSummary';
import { CITY_TIERS, QUALITY_TIERS, createDefaultProject } from './data/estimationData';
import { ProjectConfig } from './types';
import { calculateEstimate } from './utils/calculator';
import { exportEstimateToCSV } from './utils/formatters';

const STORAGE_ACTIVE_KEY = 'nirmaanest_active_project_v1';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Keep only stored fields whose type matches the default, so tampered storage can't break the app.
function mergeTyped<T extends object>(defaults: T, stored: unknown): T {
  if (!isPlainObject(stored)) return defaults;
  const out = { ...defaults } as Record<string, unknown>;
  for (const [key, def] of Object.entries(defaults)) {
    const val = stored[key];
    if (typeof def === 'number' ? Number.isFinite(val) : typeof val === typeof def && !isPlainObject(def)) {
      out[key] = val;
    }
  }
  return out as T;
}

function loadInitialActive(): ProjectConfig {
  const defaults = createDefaultProject();
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!isPlainObject(parsed)) return defaults;
      const merged = mergeTyped(defaults, parsed);
      const customRates: Record<string, number> = {};
      if (isPlainObject(parsed.customRates)) {
        for (const [id, rate] of Object.entries(parsed.customRates)) {
          if (typeof rate === 'number' && Number.isFinite(rate) && rate >= 0) customRates[id] = rate;
        }
      }
      return {
        ...merged,
        qualityTier: QUALITY_TIERS.some((t) => t.id === merged.qualityTier) ? merged.qualityTier : defaults.qualityTier,
        cityTier: CITY_TIERS.some((c) => c.id === merged.cityTier) ? merged.cityTier : defaults.cityTier,
        areaInputMode: merged.areaInputMode === 'plot' ? 'plot' : 'direct',
        customRates,
        addOns: mergeTyped(defaults.addOns, parsed.addOns),
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
