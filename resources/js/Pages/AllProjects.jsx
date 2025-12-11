// src/pages/AllProjects.jsx
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { create } from 'zustand';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  ExternalLink, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Download
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { PaginationControls } from '@/Components/ui/PaginationControls';
import DateInputWithIcon from '@/Components/ui/DateInputWithIcon';
import { Input } from '@/Components/ui/input';

// ✅ Zustand Store
const useProjectsStore = create((set, get) => ({
  // State
  projectsData: {},
  loading: false,
  loadingReport: false,
  toast: null,
  searchTerm: '',
  internName: '',
  dateFrom: '',
  dateTo: '',
  sortConfig: { key: null, direction: null },

  // Actions
  setProjectsData: (data) => set({ projectsData: data }),
  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loadingReport) => set({ loadingReport }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setInternName: (name) => set({ internName: name }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  setSortConfig: (config) => set({ sortConfig: config }),

  showToast: (message, type = 'error') => {
    set({ toast: { message, type } });
  },

  hideToast: () => set({ toast: null }),

  fetchProjects: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get('/filterProjects', { params });
      set({ projectsData: response.data });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      get().showToast('Failed to load projects. Please try again.', 'error');
    } finally {
      set({ loading: false });
    }
  },

  applyFilters: () => {
    const { searchTerm, internName, dateFrom, dateTo, sortConfig, fetchProjects, showToast } = get();
    
    if (dateFrom && dateTo && dateFrom > dateTo) {
      showToast('Start date cannot be after end date', 'error');
      return;
    }

    const params = { page: 1 };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (internName.trim()) params.intern_name = internName.trim();
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (sortConfig.key) {
      params.sort_by = sortConfig.key;
      params.sort_direction = sortConfig.direction;
    }
    fetchProjects(params);
  },

  handleSort: (key) => {
    const { sortConfig } = get();
    let newDirection = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') newDirection = 'desc';
      else if (sortConfig.direction === 'desc') {
        set({ sortConfig: { key: null, direction: null } });
        return;
      }
    }
    set({ sortConfig: { key, direction: newDirection } });
  },

  handleReset: () => {
    set({
      searchTerm: '',
      internName: '',
      dateFrom: '',
      dateTo: '',
      sortConfig: { key: null, direction: null }
    });
    get().fetchProjects({ page: 1 });
  },

  handleDateFromChange: (newFrom) => {
    const { dateTo } = get();
    set({ dateFrom: newFrom });
    if (dateTo && newFrom > dateTo) {
      set({ dateTo: newFrom });
    }
  },

  handleDateToChange: (newTo) => {
    const { dateFrom } = get();
    if (dateFrom && newTo < dateFrom) return;
    set({ dateTo: newTo });
  },

  handlePageChange: (url) => {
    if (!url) return;
    const { searchTerm, internName, dateFrom, dateTo, sortConfig, fetchProjects, showToast } = get();
    try {
      const urlObj = new URL(url);
      const page = urlObj.searchParams.get('page') || '1';
      const params = { page: parseInt(page, 10) };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (internName.trim()) params.intern_name = internName.trim();
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }
      fetchProjects(params);
    } catch (error) {
      console.error('Error parsing page URL:', error);
      showToast('Failed to navigate to page', 'error');
    }
  },

  handleGenerateReport: async () => {
    const { searchTerm, internName, dateFrom, dateTo, sortConfig, showToast } = get();
    
    if (dateFrom && dateTo && dateFrom > dateTo) {
      showToast('Start date cannot be after end date', 'error');
      return;
    }

    set({ loadingReport: true });
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (internName.trim()) params.intern_name = internName.trim();
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }

      const response = await axios.get('/projects/report', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projects-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('PDF report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      showToast(
        error.response?.data?.message || 'Failed to generate report. Please try again.',
        'error'
      );
    } finally {
      set({ loadingReport: false });
    }
  },

  initializeData: (data) => {
    set({ projectsData: data || {} });
  }
}));

// ✅ Toast Component
const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 flex-shrink-0" aria-label="Close notification">
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
};

// ✅ Sortable Table Header
const SortableTableHead = ({ children, sortKey, currentSort, onSort, className = '' }) => {
  const isSorted = currentSort.key === sortKey;
  const direction = isSorted ? currentSort.direction : null;

  const handleClick = () => {
    if (sortKey) {
      onSort(sortKey);
    }
  };

  if (!sortKey) {
    return <TableHead className={className}>{children}</TableHead>;
  }

  return (
    <TableHead className={className}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 hover:text-gray-900 font-medium transition-colors"
        aria-label={`Sort by ${children}`}
      >
        {children}
        <span className="ml-1">
          {!isSorted && <ArrowUpDown className="w-4 h-4 text-gray-400" />}
          {isSorted && direction === 'asc' && <ArrowUp className="w-4 h-4 text-blue-600" />}
          {isSorted && direction === 'desc' && <ArrowDown className="w-4 h-4 text-blue-600" />}
        </span>
      </button>
    </TableHead>
  );
};

// ✅ Filter Section
const FilterSection = () => {
  const searchTerm = useProjectsStore(state => state.searchTerm);
  const internName = useProjectsStore(state => state.internName);
  const dateFrom = useProjectsStore(state => state.dateFrom);
  const dateTo = useProjectsStore(state => state.dateTo);
  const setSearchTerm = useProjectsStore(state => state.setSearchTerm);
  const setInternName = useProjectsStore(state => state.setInternName);
  const handleDateFromChange = useProjectsStore(state => state.handleDateFromChange);
  const handleDateToChange = useProjectsStore(state => state.handleDateToChange);
  const applyFilters = useProjectsStore(state => state.applyFilters);
  const handleReset = useProjectsStore(state => state.handleReset);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters();
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="search-projects" className="text-sm text-gray-600 block mb-1">
            Search Projects
          </label>
          <Input
            id="search-projects"
            type="text"
            placeholder="Name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search projects by name or description"
          />
        </div>
        
        <div>
          <label htmlFor="intern-name" className="text-sm text-gray-600 block mb-1">
            Intern Name
          </label>
          <Input
            id="intern-name"
            type="text"
            placeholder="Type intern name..."
            value={internName}
            onChange={(e) => setInternName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by intern name"
          />
        </div>
        
        <div>
          <label htmlFor="date-from" className="text-sm text-gray-600 block mb-1">
            From Date
          </label>
          <DateInputWithIcon
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter projects from date"
          />
        </div>

        <div>
          <label htmlFor="date-to" className="text-sm text-gray-600 block mb-1">
            To Date
          </label>
          <DateInputWithIcon
            id="date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter projects to date"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={handleReset} 
          variant="outline" 
          size="sm"
          aria-label="Reset all filters"
        >
          Reset Filters
        </Button>
        <Button 
          onClick={applyFilters} 
          size="sm"
          aria-label="Apply filters"
        >
          Apply Filters
        </Button>
      </div>
    </>
  );
};

// ✅ Project Table Row
const ProjectTableRow = ({ project }) => {
  const getInternNames = () => {
    const names = [];
    if (project.intern?.name) {
      names.push(project.intern.name);
    }
    if (project.team && project.team.length > 0) {
      names.push(...project.team.map(t => t.name));
    }
    return names.join(', ') || '—';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '—';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{project.title || '—'}</TableCell>
      <TableCell className="max-w-xs">
        <div className="truncate" title={project.description}>
          {project.description || '—'}
        </div>
      </TableCell>
      <TableCell>{project.impact || '—'}</TableCell>
      <TableCell>{getInternNames()}</TableCell>
      <TableCell>{formatDate(project.created_at)}</TableCell>
      <TableCell className="text-right">
        {project.url ? (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="text-xs"
          >
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              aria-label={`View ${project.title} project in new tab`}
            >
              View Project
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        ) : (
          <span className="text-xs text-gray-400">No URL</span>
        )}
      </TableCell>
    </TableRow>
  );
};

// ✅ Main Content Component
const AllProjectsContent = ({ allData }) => {
  const projectsData = useProjectsStore(state => state.projectsData);
  const loading = useProjectsStore(state => state.loading);
  const loadingReport = useProjectsStore(state => state.loadingReport);
  const toast = useProjectsStore(state => state.toast);
  const sortConfig = useProjectsStore(state => state.sortConfig);
  
  const hideToast = useProjectsStore(state => state.hideToast);
  const applyFilters = useProjectsStore(state => state.applyFilters);
  const handleSort = useProjectsStore(state => state.handleSort);
  const handlePageChange = useProjectsStore(state => state.handlePageChange);
  const handleGenerateReport = useProjectsStore(state => state.handleGenerateReport);
  const fetchProjects = useProjectsStore(state => state.fetchProjects);
  const initializeData = useProjectsStore(state => state.initializeData);

  useEffect(() => {
    initializeData(allData);
  }, [allData, initializeData]);

  useEffect(() => {
    if (sortConfig.key !== null) applyFilters();
  }, [sortConfig]);

  useEffect(() => {
    if (!allData || Object.keys(allData).length === 0) {
      fetchProjects({ page: 1 });
    }
  }, []);

  const { 
    data: projects = [], 
    links = [], 
    from, 
    to, 
    total 
  } = projectsData;

  return (
    <div className="p-1 lg:p-1">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Intern Projects</h1>
        <Button
          variant="outline"
          onClick={handleGenerateReport}
          disabled={loadingReport||projects.length == 0}
          className="flex items-center gap-2"
          aria-label="Generate PDF report"
        >
          {loadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Generate Report (PDF)
            </>
          )}
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="py-4">
          <FilterSection />

          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="title" currentSort={sortConfig} onSort={handleSort}>
                    Project
                  </SortableTableHead>
                  <TableHead>Description</TableHead>
                  <SortableTableHead sortKey="impact" currentSort={sortConfig} onSort={handleSort}>
                    Impact
                  </SortableTableHead>
                  <SortableTableHead sortKey="intern_name" currentSort={sortConfig} onSort={handleSort}>
                    Intern(s)
                  </SortableTableHead>
                  <SortableTableHead sortKey="created_at" currentSort={sortConfig} onSort={handleSort}>
                    Date
                  </SortableTableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading projects...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : projects.length > 0 ? (
                  projects.map(project => (
                    <ProjectTableRow key={project.id} project={project} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No projects found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            links={links}
            from={from}
            to={to}
            total={total}
            onPageChange={handlePageChange}
            text={"Projects"}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// ✅ Main Component
const AllProjects = () => {
  const { props } = usePage();
  const { auth,appIcon, activePath,data } = props;

  return (
    <AdminLayout activePath={activePath} auth={auth}>
      {({ isSidebarCollapsed }) => (
        <AllProjectsContent allData={data} />
      )}
    </AdminLayout>
  );
};

export default AllProjects;