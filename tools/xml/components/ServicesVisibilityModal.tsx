import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';

interface ServicesVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  allServices: string[];
  hiddenServices: Set<string>;
  onToggleService: (serviceName: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const ServicesVisibilityModal: React.FC<ServicesVisibilityModalProps> = ({
  isOpen,
  onClose,
  allServices,
  hiddenServices,
  onToggleService,
  onShowAll,
  onHideAll,
}) => {
  const [filter, setFilter] = useState('');

  const filteredServices = useMemo(() => {
    const sortedServices = [...allServices].sort((a, b) => a.localeCompare(b));
    if (!filter) return sortedServices;
    return sortedServices.filter(service =>
      service.toLowerCase().includes(filter.toLowerCase())
    );
  }, [allServices, filter]);

  const allHidden = allServices.length > 0 && hiddenServices.size === allServices.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="services-modal-title">
      <div
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 id="services-modal-title" className="text-xl font-bold">Manage Services</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-slate-700">
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search services..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 pl-8 pr-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Filter services"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          <button
            onClick={allHidden ? onShowAll : onHideAll}
            className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed"
            disabled={allServices.length === 0}
          >
            {allHidden ? 'Show All' : 'Hide All'}
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
          {filteredServices.map(serviceName => (
            <label key={serviceName} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
              <input
                type="checkbox"
                checked={!hiddenServices.has(serviceName)}
                onChange={() => onToggleService(serviceName)}
                className="h-4 w-4 rounded bg-slate-900 border-slate-600 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-slate-300">{serviceName}</span>
            </label>
          ))}
          {filteredServices.length === 0 && (
            <p className="text-slate-500 text-center py-4">No services match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesVisibilityModal;