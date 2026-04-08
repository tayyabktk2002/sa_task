import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface TicketFilterProps {
  onFilterChange: (filters: any) => void;
}

const TicketFilter = ({ onFilterChange }: TicketFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    severity: '',
    date_from: '',
    date_to: '',
    tags: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters: any = { ...filters };
    if (activeFilters.tags) {
       activeFilters.tags = activeFilters.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    } else {
       delete activeFilters.tags;
    }
    // Clean empty values
    Object.keys(activeFilters).forEach(key => {
      if (!activeFilters[key]) delete activeFilters[key];
    });
    
    onFilterChange(activeFilters);
  };

  const resetFilters = () => {
    const defaultFilters = { search: '', status: '', severity: '', date_from: '', date_to: '', tags: '' };
    setFilters(defaultFilters);
    onFilterChange({});
  };

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-2/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="bg-[#0f172a] border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search tickets, descriptions, or comments..."
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg border border-slate-700 transition"
          >
            <Filter size={18} />
            {isOpen ? 'Hide Filters' : 'Advanced Filters'}
          </button>
          
          <button
            onClick={applyFilters}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in duration-200">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <select name="status" value={filters.status} onChange={handleChange} className="bg-[#0f172a] border border-slate-700 text-white text-sm rounded-lg block w-full p-2.5 appearance-none">
              <option value="">Any Status</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Mitigated">Mitigated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Severity</label>
            <select name="severity" value={filters.severity} onChange={handleChange} className="bg-[#0f172a] border border-slate-700 text-white text-sm rounded-lg block w-full p-2.5 appearance-none">
              <option value="">Any Severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              name="tags"
              value={filters.tags}
              onChange={handleChange}
              placeholder="e.g. bug, network"
              className="bg-[#0f172a] border border-slate-700 text-white text-sm rounded-lg block w-full p-2.5"
            />
          </div>

          <div className="flex items-center gap-2">
             <div className="flex-1">
               <label className="block text-xs font-medium text-slate-400 mb-1">From Date</label>
               <input type="date" name="date_from" value={filters.date_from} onChange={handleChange} className="bg-[#0f172a] border border-slate-700 text-slate-300 text-sm rounded-lg block w-full p-2.5" />
             </div>
             <div className="flex-1">
               <label className="block text-xs font-medium text-slate-400 mb-1">To Date</label>
               <input type="date" name="date_to" value={filters.date_to} onChange={handleChange} className="bg-[#0f172a] border border-slate-700 text-slate-300 text-sm rounded-lg block w-full p-2.5" />
             </div>
          </div>

          <div className="col-span-full flex justify-end">
             <button onClick={resetFilters} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
                <X size={16} /> Clear All Filters
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketFilter;