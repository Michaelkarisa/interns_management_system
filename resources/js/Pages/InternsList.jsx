// src/pages/InternsList.jsx
import { useState, useEffect, useRef,useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PerformanceBadge from '@/Layouts/PerformanceBadge';
import RecommendationBadge from '@/Layouts/RecommendationBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import InternForm from './interns/InternForm';
import { User, ArrowRight, AlertCircle, Download } from 'lucide-react';
import { PaginationControls } from '@/Layouts/PaginationControls';
// src/store/useInternsStore.js
import { create } from 'zustand';
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';

export const useInternsStore = create((set, get) => ({
  // Filters
  filters: {
    search: '',
    min_performance: '',
    active: false,
    completed: false,
    recommended: false,
    graduated: false,
    name: '',
    email: '',
    institution: '',
    position: '',
    date_a:null,
    date_b:null,
  },

  // Loading states
  loading: false,
  loadingReport: false,

  // UI State
  showForm: false,
  toast: null,

  // Actions
  setFilter: (field, value) => {
    set((state) => ({
      filters: { ...state.filters, [field]: value },
    }));
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loadingReport) => set({ loadingReport }),
  setShowForm: (showForm) => set({ showForm }),

  showToast: (message, type = 'error') => {
    set({ toast: { message, type } });
    setTimeout(() => get().hideToast(), 5000);
  },
  hideToast: () => set({ toast: null }),

  resetFilters: () => {
    set({
      filters: {
        search: '',
        min_performance: '',
        active: false,
        completed: false,
        recommended: false,
        graduated: false,
        name: '',
        email: '',
        institution: '',
        position: '',
      },
    });
  },
}));
// ✅ Toast Component (now driven by store)
const Toast = () => {
  const { toast, hideToast } = useInternsStore();
  if (!toast) return null;

  const bgColor = toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = toast.type === 'error' ? 'text-red-800' : 'text-green-800';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button onClick={hideToast} className="ml-3 flex-shrink-0" aria-label="Close notification">
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>
    </div>
  );
};

// ✅ Helper & Components (unchanged)
const getInternshipStatus = (toDate) => (!toDate ? 'In Progress' : 'Completed');

const StatusBadge = ({ status }) => {
  const styles = status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>{status}</span>;
};

const FilterSection = () => {
  const { filters: storeFilters, setFilter } = useInternsStore();
  
  const [localFilters, setLocalFilters] = useState({
    ...storeFilters,
    date_a: storeFilters.date_a || "",
    date_b: storeFilters.date_b || "",
  });

  const debounceRef = useRef(null);

  // Sync storeFilters to localFilters
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      ...storeFilters,
      date_a: storeFilters.date_a || "",
      date_b: storeFilters.date_b || "",
    }));
  }, [storeFilters]);

  const handleChange = (e) => {
    const { name, value, type, checked ,date_a,date_b} = e.target;

    if (type === "checkbox") {
      if (name === "active" && checked) setFilter("completed", false);
      else if (name === "completed" && checked) setFilter("active", false);

      setFilter(name, checked);
      setLocalFilters((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Text, number, or date input
    setLocalFilters((prev) => ({ ...prev, [name]: value }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilter(name, value);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Text inputs */}
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Search by name or email..."
            name="search"
            value={localFilters.search}
            onChange={handleChange}
          />
          <Input
            placeholder="Institution"
            name="institution"
            value={localFilters.institution}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Input
            placeholder="Position"
            name="position"
            value={localFilters.position}
            onChange={handleChange}
          />
          <Input
            type="number"
            placeholder="Min Performance"
            name="min_performance"
            value={localFilters.min_performance}
            onChange={handleChange}
            min="0"
            max="100"
          />
        </div>

        {/* Date inputs with calendar icon */}
        <div className="flex flex-col sm:flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
            <DateInputWithIcon
              name="date_a"
              value={localFilters.date_a}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
            <DateInputWithIcon
              name="date_b"
              value={localFilters.date_b}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Checkbox filters */}
      <div className="flex flex-wrap gap-6 mt-2">
        {["active", "completed", "recommended", "graduated"].map((field) => (
          <label key={field} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name={field}
              checked={!!localFilters[field]}
              onChange={handleChange}
              className="cursor-pointer"
            />
            <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
const InternTableRow = ({ intern, onViewProfile }) => (
  <motion.tr initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
    <TableCell>
      <Avatar className="h-8 w-8">
        <AvatarImage src={intern?.photo || undefined} alt={`${intern.name}'s avatar`} />
        <AvatarFallback>{intern.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </TableCell>
    <TableCell>{intern.name}</TableCell>
    <TableCell>{intern.institution || '—'}</TableCell>
    <TableCell>{intern.position || '—'}</TableCell>
    <TableCell><StatusBadge status={getInternshipStatus(intern.to)} /></TableCell>
    <TableCell><PerformanceBadge score={intern.performance} /></TableCell>
    <TableCell><RecommendationBadge isRecommended={intern.recommended} /></TableCell>
    <TableCell className="text-right">
      <Button variant="outline" size="sm" onClick={() => onViewProfile(intern.id)} className="flex items-center space-x-1">
        <User className="w-4 h-4" />
        <ArrowRight className="w-4 h-4" />
      </Button>
    </TableCell>
  </motion.tr>
);

const InternsTable = ({ data, loading, onViewProfile }) => (
  <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Institution</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Recommended</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  <span className="ml-2">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data?.length > 0 ? (
            data.map((intern) => <InternTableRow key={intern.id} intern={intern} onViewProfile={onViewProfile} />)
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No interns found. Try adjusting your filters.
              </TableCell>
            </TableRow>
          )}
        </AnimatePresence>
      </TableBody>
    </Table>
  </div>
);

// ✅ Main Content with Zustand
const InternsListContent = ({ isSidebarCollapsed, allData }) => {
  const {
    filters,
    loading,
    loadingReport,
    showForm,
    toast,
    setLoading,
    setLoadingReport,
    setShowForm,
    showToast,
    hideToast,
  } = useInternsStore();

  const [internsData, setInternsData] = useState(allData || {});

  const { data, current_page, last_page, from, to, total, links = [] } = internsData || {};

  const fetchInterns = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, ...filters };
        const response = await axios.get('/interns/filter', { params });
          console.log("params: ", params);
      console.log("data: ", response.data);
        setInternsData(response.data);
      } catch (error) {
        console.error('Failed to fetch interns:', error);
        showToast('Failed to load interns. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    },
    [filters, setLoading, showToast]
  );

  useEffect(() => {
    fetchInterns();
  }, [filters, fetchInterns]);

  const handleGenerateReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const response = await axios.get('/interns/report', {
        params: filters,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `interns-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
      setLoadingReport(false);
    }
  }, [filters, showToast, setLoadingReport]);

const postIntern = async (data, cvFile, photoFile) => {
  console.log("📥 [4] postIntern received data:", data);
  console.log("📎 cvFile:", cvFile?.name || 'none');
  console.log("👤 photoFile:", photoFile?.name || 'none');

  const formData = new FormData();
  let entryCount = 0;

  Object.entries(data).forEach(([key, value]) => {
    console.log(" ➕ Processing field:", key, "=", value, "| Type:", typeof value);
    if (value == null || value === '') {
      console.log("   → Skipped (null/empty)");
      return;
    }
    if (key === 'skills' && Array.isArray(value)) {
      value.forEach((skill) => {
        formData.append('skills[]', skill);
        entryCount++;
        console.log("   → Appended skills[]:", skill);
      });
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item);
        entryCount++;
        console.log("   → Appended", `${key}[]`, ":", item);
      });
    } else {
      formData.append(key, value);
      entryCount++;
      console.log("   → Appended", key, ":", value);
    }
  });

  if (cvFile) {
    formData.append('cv', cvFile);
    entryCount++;
    console.log("   → Appended file: cv");
  }
  if (photoFile) {
    formData.append('photo', photoFile);
    entryCount++;
    console.log("   → Appended file: photo");
  }

  console.log("📊 Total FormData entries:", entryCount);
  if (entryCount === 0) {
    console.error("💀 FormData is completely empty!");
  }

  return axios.post('/interns/addintern', formData);
};

  const handleInternSubmit = async (data, cvFile, photoFile) => {
  try {
    // ✅ Helper to format Date objects to YYYY-MM-DD
    const formatDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) {
        // Converts to "2025-12-10"
        return value.toISOString().split('T')[0];
      }
      // If it's already a string (e.g., from initialData), return as-is
      return value;
    };

    const cleaned = {
  ...data,
  name: data.name?.trim(),
  email: data.email?.trim(),
  phone: data.phone?.trim(),
  institution: data.institution?.trim(),
  position: data.position?.trim(),
  course: data.course?.trim(),
  department: data.department?.trim(),
  from: formatDate(data.from),
  to: formatDate(data.to),
  // ✅ Convert booleans to 1/0
  graduated: data.graduated ? 1 : 0,
  recommended: data.recommended ? 1 : 0,
};
    // Validation
    if (!cleaned.name || !cleaned.email || !cleaned.from) {
      showToast('Please fill in all required fields (Name, Email, Start Date)', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (photoFile && photoFile.size > 4096 * 1024) {
      showToast('Photo file size must not exceed 4MB.', 'error');
      return;
    }
    if (cvFile && cvFile.size > 10240 * 1024) {
      showToast('CV file size must not exceed 10MB.', 'error');
      return;
    }

    console.log("formdata cleaned: ", cleaned);
    await postIntern(cleaned, cvFile, photoFile);

    showToast('Intern added successfully!', 'success');
    setShowForm(false);
    fetchInterns();
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to add intern';
    showToast(msg, 'error');
  }
};
  const handlePageChange = useCallback(
    (url) => {
      if (!url) return;
      const page = new URL(url).searchParams.get('page') || '1';
      fetchInterns(parseInt(page, 10));
    },
    [fetchInterns]
  );

  const handleAddIntern = () => setShowForm(true);
  const handleFormCancel = () => setShowForm(false);
  const handleViewProfile = (id) => router.visit(route('internProfile', { id }));

  if (showForm) {
    return (
      <div className="p-4 lg:p-6">
        <Button variant="ghost" size="sm" onClick={handleFormCancel} className="mb-4 flex items-center">
          ← Back to Interns
        </Button>
        <InternForm onSubmit={handleInternSubmit} initialData={null} />
      </div>
    );
  }

  return (
    <div className="p-1 lg:p-1">
      <Toast /> {/* ✅ Standalone toast */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Interns</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={loadingReport||total==0}
            className="flex items-center gap-1"
          >
            {loadingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate Report (PDF)
              </>
            )}
          </Button>
          <Button variant="default" onClick={handleAddIntern}>
            + Add Intern
          </Button>
        </div>
      </div>

      <FilterSection />
      <InternsTable data={data} loading={loading} onViewProfile={handleViewProfile} />

      <PaginationControls
        links={links}
        from={from}
        to={to}
        total={total}
        onPageChange={handlePageChange}
        text="Interns"
      />
    </div>
  );
};

const InternsList = () => {
  const { props } = usePage();
  const { auth,appIcon, activePath,data } = props;


  return (
    <AdminLayout activePath={activePath} auth={auth}>
      {({ isSidebarCollapsed }) => <InternsListContent isSidebarCollapsed={isSidebarCollapsed} allData={data} />}
    </AdminLayout>
  );
};

export default InternsList;