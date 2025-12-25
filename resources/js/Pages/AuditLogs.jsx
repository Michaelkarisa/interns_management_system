import { useState, useCallback, useEffect } from "react";
import { usePage, router } from '@inertiajs/react';
import axios from "axios";
import { create } from "zustand";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Download,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import { PaginationControls } from '@/Layouts/PaginationControls';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DateInputWithIcon from "@/Layouts/DateInputWithIcon";

// ✅ Zustand Store
const useAuditLogStore = create((set, get) => ({
  // State
  logsData: {},
  loading: false,
  loadingReport: false,
  toast: null,
  selectedLog: null,
  searchTerm: "",
  eventFilter: "",
  dateFrom: "",
  dateTo: "",
  sortConfig: { key: 'created_at', direction: 'desc' },

  // Actions
  setLogsData: (data) => set({ logsData: data }),
  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loadingReport) => set({ loadingReport }),
  setSelectedLog: (log) => set({ selectedLog: log }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setEventFilter: (filter) => set({ eventFilter: filter }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),
  setSortConfig: (config) => set({ sortConfig: config }),

  showToast: (message, type = "error") => {
    set({ toast: { message, type } });
  },

  hideToast: () => set({ toast: null }),

  fetchLogs: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get("/auditlogs/filter", { params });
      set({ logsData: response.data });
        console.log("params: ", params);
      console.log("data: ", response.data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      get().showToast("Failed to load audit logs. Please try again.", "error");
    } finally {
      set({ loading: false });
    }
  },

  applyFilters: () => {
    const { searchTerm, eventFilter, dateFrom, dateTo, sortConfig, fetchLogs } = get();
    const params = { page: 1 };
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (eventFilter) params.event = eventFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (sortConfig.key) {
      params.sort_by = sortConfig.key;
      params.sort_direction = sortConfig.direction;
    }
    fetchLogs(params);
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
      searchTerm: "",
      eventFilter: "",
      dateFrom: "",
      dateTo: "",
      sortConfig: { key: 'created_at', direction: 'desc' }
    });
    get().fetchLogs({ page: 1, sort_by: 'created_at', sort_direction: 'desc' });
  },

  handlePageChange: (url) => {
    if (!url) return;
    const { searchTerm, eventFilter, dateFrom, dateTo, sortConfig, fetchLogs, showToast } = get();
    try {
      const urlObj = new URL(url);
      const page = urlObj.searchParams.get("page") || "1";
      const params = { page: parseInt(page, 10) };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (eventFilter) params.event = eventFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }
      fetchLogs(params);
    } catch (error) {
      console.error("Error parsing page URL:", error);
      showToast("Failed to navigate to page", "error");
    }
  },

  handleGenerateReport: async () => {
    const { searchTerm, eventFilter, dateFrom, dateTo, sortConfig, showToast } = get();
    set({ loadingReport: true });
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (eventFilter) params.event = eventFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }

      const response = await axios.get("/auditlogs/report", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast("PDF report downloaded successfully!", "success");
    } catch (error) {
      console.error("Failed to generate PDF report:", error);
      showToast(
        error.response?.data?.message ||
        "Failed to generate report. Please try again.",
        "error"
      );
    } finally {
      set({ loadingReport: false });
    }
  },

  initializeData: (data) => {
    set({ logsData: data || {} });
  }
}));

// ✅ Toast Component
const Toast = ({ message, type = "error", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
  const textColor = type === "error" ? "text-red-800" : "text-green-800";

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

// ✅ Event Badge
const EventBadge = ({ event }) => {
  const getStyles = () => {
    if (event.includes("created")) return "bg-green-100 text-green-800";
    if (event.includes("updated")) return "bg-blue-100 text-blue-800";
    if (event.includes("deleted")) return "bg-red-100 text-red-800";
    if (event.includes("login")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {event}
    </span>
  );
};

// ✅ Audit Log Table Row
const AuditLogTableRow = ({ log, onViewDetails }) => {
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">{log.user?.name || 'System'}</TableCell>
      <TableCell>
        <EventBadge event={log.event} />
      </TableCell>
      <TableCell>{log.entity_type || '-'}</TableCell>
      <TableCell>{log.entity_id || '-'}</TableCell>
      <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(log)}
          aria-label={`View details for ${log.event}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
};

// ✅ Filter Section
const FilterSection = () => {
  const searchTerm = useAuditLogStore(state => state.searchTerm);
  const eventFilter = useAuditLogStore(state => state.eventFilter);
  const dateFrom = useAuditLogStore(state => state.dateFrom);
  const dateTo = useAuditLogStore(state => state.dateTo);
  const setSearchTerm = useAuditLogStore(state => state.setSearchTerm);
  const setEventFilter = useAuditLogStore(state => state.setEventFilter);
  const setDateFrom = useAuditLogStore(state => state.setDateFrom);
  const setDateTo = useAuditLogStore(state => state.setDateTo);
  const handleReset = useAuditLogStore(state => state.handleReset);

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by user or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-1/2"
              aria-label="Search audit logs"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="min-w-[10rem] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by event type"
          >
            <option value="">All Events</option>
            <option value="login">Login</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            aria-label="Reset filters"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
          <DateInputWithIcon
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm"
            aria-label="Filter from date"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
          <DateInputWithIcon
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm"
            aria-label="Filter to date"
          />
        </div>
      </div>
    </div>
  );
};

// ✅ Details Modal
const AuditLogDetailsModal = () => {
  const selectedLog = useAuditLogStore(state => state.selectedLog);
  const setSelectedLog = useAuditLogStore(state => state.setSelectedLog);

  if (!selectedLog) return null;

  return (
    <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">User</p>
              <p className="text-sm mt-1">{selectedLog.user?.name || 'System'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Event</p>
              <p className="text-sm mt-1">
                <EventBadge event={selectedLog.event} />
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Entity Type</p>
              <p className="text-sm mt-1">{selectedLog.entity_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Entity ID</p>
              <p className="text-sm mt-1">{selectedLog.entity_id || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date & Time</p>
              <p className="text-sm mt-1">{new Date(selectedLog.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">IP Address</p>
              <p className="text-sm mt-1">{selectedLog.ip || '-'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">User Agent</p>
            <p className="text-sm mt-1 break-words">{selectedLog.user_agent || '-'}</p>
          </div>

          {selectedLog.metadata && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Metadata</p>
              <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ✅ Main Content Component
const AuditLogsContent = ({ allData }) => {
  const logsData = useAuditLogStore(state => state.logsData);
  const loading = useAuditLogStore(state => state.loading);
  const loadingReport = useAuditLogStore(state => state.loadingReport);
  const toast = useAuditLogStore(state => state.toast);
  const searchTerm = useAuditLogStore(state => state.searchTerm);
  const eventFilter = useAuditLogStore(state => state.eventFilter);
  const dateFrom = useAuditLogStore(state => state.dateFrom);
  const dateTo = useAuditLogStore(state => state.dateTo);
  const sortConfig = useAuditLogStore(state => state.sortConfig);
  
  const hideToast = useAuditLogStore(state => state.hideToast);
  const setSelectedLog = useAuditLogStore(state => state.setSelectedLog);
  const applyFilters = useAuditLogStore(state => state.applyFilters);
  const handleSort = useAuditLogStore(state => state.handleSort);
  const handlePageChange = useAuditLogStore(state => state.handlePageChange);
  const handleGenerateReport = useAuditLogStore(state => state.handleGenerateReport);
  const initializeData = useAuditLogStore(state => state.initializeData);

  useEffect(() => {
    initializeData(allData);
  }, [allData, initializeData]);

  useEffect(() => {
    if (sortConfig.key !== null) applyFilters();
  }, [sortConfig]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== "") applyFilters();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (eventFilter || dateFrom || dateTo) applyFilters();
  }, [eventFilter, dateFrom, dateTo]);

  const {
    data: logs = [],
    current_page,
    last_page,
    links = [],
    from,
    to,
    total,
  } = logsData;

  return (
    <div className="p-1 lg:p-1">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Logs: <span className="font-semibold">{total || logs.length}</span>
          </div>
          <Button 
            variant="outline"
            onClick={handleGenerateReport}
            disabled={loadingReport||total==0}
            className="flex items-center gap-2"
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
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="py-4">
          <FilterSection />

          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="user" currentSort={sortConfig} onSort={handleSort}>
                    User
                  </SortableTableHead>
                  <SortableTableHead sortKey="event" currentSort={sortConfig} onSort={handleSort}>
                    Event
                  </SortableTableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
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
                        <span className="ml-2">Loading audit logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <AuditLogTableRow
                      key={log.id}
                      log={log}
                      onViewDetails={setSelectedLog}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No audit logs found. Try adjusting your filters.
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
            text={"Audit Logs"}
          />
        </CardContent>
      </Card>

      <AuditLogDetailsModal />
    </div>
  );
};

// ✅ Wrapper Page
const AuditLogs = () => {
   const { props } = usePage();
    const { auth,appIcon, activePath,data } = props;
  
  return (
    <AdminLayout activePath={activePath} auth={auth}>
      {() => <AuditLogsContent allData={data} />}
    </AdminLayout>
  );
};

export default AuditLogs;