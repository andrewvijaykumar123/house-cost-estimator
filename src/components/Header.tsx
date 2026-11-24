import React from 'react';
import { Download, FileSpreadsheet, Home, RotateCcw } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  onProjectNameChange,
  onDownloadPDF,
  onDownloadCSV,
  onReset,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-stone-200/90 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
              <Home className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-extrabold tracking-tight text-stone-900">
                  Home Budget Calculator
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-inset ring-orange-200">
                  India · ₹ INR
                </span>
              </div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                aria-label="Home Plan Name"
                placeholder="Name your home plan (e.g., Dream Home)"
                className="mt-0.5 w-48 sm:w-72 truncate bg-transparent text-xs font-medium text-stone-500 hover:text-stone-900 focus:text-stone-900 focus:outline-none border-b border-transparent focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadPDF}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onDownloadCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition cursor-pointer"
              title="Download as Excel / CSV spreadsheet"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition cursor-pointer"
              title="Reset to default values"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
              <span className="hidden md:inline">Start Fresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
