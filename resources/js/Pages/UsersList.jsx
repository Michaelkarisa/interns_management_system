// ===========================
// COMPONENTS
// ===========================
import { useEffect } from "react";
import { usePage, router } from '@inertiajs/react';
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
  UserPlus,
  Mail,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import { PaginationControls } from '@/Components/ui/PaginationControls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";// ===========================
// ZUSTAND STORE
// ===========================
import { create } from 'zustand';
import axios from 'axios';

const useUsersStore = create((set, get) => ({
  // State
  usersData: {},
  loading: false,
  loadingIds: [],
  toast: null,
  isRegisterModalOpen: false,
  loadingReport: false,
  
  // Filters
  searchTerm: '',
  roleFilter: '',
  statusFilter: '',
  
  // Sorting
  sortConfig: {
    key: null,
    direction: null
  },

  // Actions
  setUsersData: (data) => set({ usersData: data }),
  setLoading: (loading) => set({ loading }),
  setLoadingReport: (loading) => set({ loadingReport: loading }),
  
  addLoadingId: (id) => set((state) => ({ 
    loadingIds: [...state.loadingIds, id] 
  })),
  
  removeLoadingId: (id) => set((state) => ({ 
    loadingIds: state.loadingIds.filter((loadingId) => loadingId !== id) 
  })),
  
  showToast: (message, type = 'error') => set({ 
    toast: { message, type } 
  }),
  
  hideToast: () => set({ toast: null }),
  
  setIsRegisterModalOpen: (isOpen) => set({ 
    isRegisterModalOpen: isOpen 
  }),
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  setRoleFilter: (role) => set({ roleFilter: role }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  
  setSortConfig: (config) => set({ sortConfig: config }),
  
  toggleSort: (key) => {
    const { sortConfig } = get();
    let newDirection = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        newDirection = 'desc';
      } else if (sortConfig.direction === 'desc') {
        set({ sortConfig: { key: null, direction: null } });
        return;
      }
    }
    
    set({ sortConfig: { key, direction: newDirection } });
  },
  
  resetFilters: () => {
    set({
      searchTerm: '',
      roleFilter: '',
      statusFilter: '',
      sortConfig: { key: null, direction: null }
    });
  },

  // API Actions
  fetchUsers: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await axios.get('/users/filter', { params });
      set({ usersData: response.data });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      get().showToast('Failed to load users. Please try again.', 'error');
    } finally {
      set({ loading: false });
    }
  },

  applyFilters: () => {
    const { searchTerm, roleFilter, statusFilter, sortConfig, fetchUsers } = get();
    const params = { page: 1 };
    
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (sortConfig.key) {
      params.sort_by = sortConfig.key;
      params.sort_direction = sortConfig.direction;
    }
    
    fetchUsers(params);
  },

  updateUserRole: async (userId, action) => {
    const { addLoadingId, removeLoadingId, showToast, usersData, setUsersData } = get();
    
    addLoadingId(userId);
    try {
      await axios.post(`/users/${userId}/${action}`);
      
      setUsersData({
        ...usersData,
        data: usersData.data.map((u) =>
          u.id === userId
            ? { ...u, role: action === 'promote' ? 'admin' : 'user' }
            : u
        ),
      });
      
      showToast(
        `User ${action === 'promote' ? 'promoted' : 'demoted'} successfully!`,
        'success'
      );
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      showToast(
        error.response?.data?.message || `Failed to ${action} user. Please try again.`,
        'error'
      );
    } finally {
      removeLoadingId(userId);
    }
  },

  handlePageChange: (url) => {
    if (!url) return;
    
    const { searchTerm, roleFilter, statusFilter, sortConfig, fetchUsers, showToast } = get();
    
    try {
      const urlObj = new URL(url);
      const page = urlObj.searchParams.get('page') || '1';
      const params = { page: parseInt(page, 10) };
      
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }
      
      fetchUsers(params);
    } catch (error) {
      console.error('Error parsing page URL:', error);
      showToast('Failed to navigate to page', 'error');
    }
  },

  generateReport: async () => {
    const { searchTerm, roleFilter, statusFilter, sortConfig, showToast } = get();
    
    set({ loadingReport: true });
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (sortConfig.key) {
        params.sort_by = sortConfig.key;
        params.sort_direction = sortConfig.direction;
      }

      const response = await axios.get('/users/report', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `users-report-${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('PDF report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      showToast(
        error.response?.data?.message ||
        'Failed to generate report. Please try again.',
        'error'
      );
    } finally {
      set({ loadingReport: false });
    }
  },
}));



// Register User Modal Store
const useRegisterModalStore = create((set) => ({
  formData: {
    name: '',
    email: '',
    role: 'user',
    password: '',
    password_confirmation: '',
  },
  loading: false,
  errors: {},
  passwordStrength: 0,
  passwordColor: 'bg-red-500',
  passwordText: 'Very Weak',
  showPassword: false,

  setFormData: (data) => set({ formData: data }),
  updateFormField: (name, value) => set((state) => ({
    formData: {
      ...state.formData,
      [name]: value,
      ...(name === 'password' && { password_confirmation: value }),
    }
  })),
  setLoading: (loading) => set({ loading }),
  setErrors: (errors) => set({ errors }),
  clearError: (field) => set((state) => ({
    errors: { ...state.errors, [field]: '' }
  })),
  setPasswordStrength: (strength, color, text) => set({
    passwordStrength: strength,
    passwordColor: color,
    passwordText: text,
  }),
  toggleShowPassword: () => set((state) => ({
    showPassword: !state.showPassword
  })),
  resetForm: () => set({
    formData: {
      name: '',
      email: '',
      role: 'user',
      password: '',
      password_confirmation: '',
    },
    errors: {},
    passwordStrength: 0,
    passwordColor: 'bg-red-500',
    passwordText: 'Very Weak',
    showPassword: false,
  }),
}));

// Register User Modal Component
const RegisterUserModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    formData,
    loading,
    errors,
    passwordStrength,
    passwordColor,
    passwordText,
    showPassword,
    updateFormField,
    setLoading,
    setErrors,
    clearError,
    setPasswordStrength,
    toggleShowPassword,
    resetForm,
  } = useRegisterModalStore();

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormField(name, value);
    if (errors[name]) clearError(name);

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      let color, text;
      
      switch (strength) {
        case 0:
        case 1:
          color = 'bg-red-500';
          text = 'Very Weak';
          break;
        case 2:
          color = 'bg-orange-500';
          text = 'Weak';
          break;
        case 3:
          color = 'bg-blue-500';
          text = 'Medium';
          break;
        case 4:
          color = 'bg-green-500';
          text = 'Strong';
          break;
        default:
          color = 'bg-red-500';
          text = 'Very Weak';
      }
      
      setPasswordStrength(strength, color, text);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (!formData.password.trim()) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = { ...formData, password_confirmation: formData.password };
      const response = await axios.post('/users/register', payload);
      onSuccess(response.data.message || 'User registered successfully! Verification email sent.');
      onClose();
    } catch (error) {
      console.error('Failed to register user:', error);
      if (error.response) {
        const data = error.response.data;
        if (data.errors) setErrors(data.errors);
        else if (data.message) setErrors({ general: data.message });
        else if (typeof data === 'string') setErrors({ general: data });
      } else if (error.message) {
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-h-[97vh]">
      <DialogContent className="sm:max-w-md max-h-[97vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Register New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account. A verification email will be sent to the user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Temporary Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Set a temporary password"
                value={formData.password}
                onChange={handleChange}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <div className="mt-1">
              <p className="text-sm font-medium text-gray-700">Password Strength</p>
              <div className="mt-1 h-2 w-full bg-gray-300 rounded">
                <div
                  className={`${passwordColor} h-2 rounded`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1 text-gray-700">{passwordText}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Email Verification Required</p>
              <p className="mt-1">
                The user will receive an email with a verification link. They must verify their email before logging in.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Toast Component
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

// Sortable Table Header
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

// Role Badge
const RoleBadge = ({ role }) => {
  const getStyles = () => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      {role.replace('_', ' ')}
    </span>
  );
};

// User Table Row
const UserTableRow = ({ user, isLoading, onPromote, onDemote }) => {
  const disableActions = user.must_change_password || isLoading;

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell className="text-right">
        {user.role === 'super_admin' ? (
          <span className="px-2 py-1 rounded-md text-sm font-semibold bg-purple-600 text-white">
            You
          </span>
        ) : (
          <>
            {user.role === 'admin' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDemote(user.id)}
                disabled={disableActions}
                aria-label={`Demote ${user.name} to user`}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </span>
                ) : (
                  'Demote'
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPromote(user.id)}
                disabled={disableActions}
                aria-label={`Promote ${user.name} to admin`}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  </span>
                ) : (
                  'Promote'
                )}
              </Button>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

// Filter Section
const FilterSection = ({ searchTerm, roleFilter, statusFilter, onSearchChange, onRoleChange, onStatusChange, onReset }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-10 w-[60%]"
            aria-label="Search users by name or email"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <select
          value={roleFilter}
          onChange={onRoleChange}
          className="w-[70%] border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={onStatusChange}
          className="w-[70%]  border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          aria-label="Reset filters"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

// Main Content Component
const UsersManagementContent = ({ currentUser, allData }) => {
  const {
    usersData,
    loading,
    loadingIds,
    toast,
    isRegisterModalOpen,
    loadingReport,
    searchTerm,
    roleFilter,
    statusFilter,
    sortConfig,
    setUsersData,
    showToast,
    hideToast,
    setIsRegisterModalOpen,
    setSearchTerm,
    setRoleFilter,
    setStatusFilter,
    toggleSort,
    resetFilters,
    fetchUsers,
    applyFilters,
    updateUserRole,
    handlePageChange,
    generateReport,
  } = useUsersStore();

  // Initialize with server data
  useEffect(() => {
    if (allData) {
      setUsersData(allData);
    }
  }, [allData, setUsersData]);

  // Apply filters when sort changes
  useEffect(() => {
    if (sortConfig.key !== null) {
      applyFilters();
    }
  }, [sortConfig, applyFilters]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== '') {
        applyFilters();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, applyFilters]);

  // Apply filters when role or status changes
  useEffect(() => {
    if (roleFilter || statusFilter) {
      applyFilters();
    }
  }, [roleFilter, statusFilter, applyFilters]);

  const handleRegisterSuccess = (message) => {
    showToast(message, 'success');
    fetchUsers({ page: 1 });
  };

  const handleReset = () => {
    resetFilters();
    fetchUsers({ page: 1 });
  };

  const {
    data: users = [],
    current_page,
    last_page,
    links = [],
    from,
    to,
    total,
  } = usersData;

  return (
    <div className="p-1 lg:p-1">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total Users: <span className="font-semibold">{total || users.length}</span>
          </div>
          <Button 
            variant="outline"
            onClick={generateReport}
            disabled={loadingReport||users.length==0}
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
          <Button 
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Register User
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="py-4">
          <FilterSection
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onRoleChange={(e) => setRoleFilter(e.target.value)}
            onStatusChange={(e) => setStatusFilter(e.target.value)}
            onReset={handleReset}
          />

          <div className="rounded-lg border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead sortKey="name" currentSort={sortConfig} onSort={toggleSort}>
                    Name
                  </SortableTableHead>
                  <SortableTableHead sortKey="email" currentSort={sortConfig} onSort={toggleSort}>
                    Email
                  </SortableTableHead>
                  <SortableTableHead sortKey="role" currentSort={sortConfig} onSort={toggleSort}>
                    Role
                  </SortableTableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      isLoading={loadingIds.includes(user.id)}
                      onPromote={(id) => updateUserRole(id, 'promote')}
                      onDemote={(id) => updateUserRole(id, 'demote')}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No users found. Try adjusting your filters.
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
            text={"Users"}
          />
        </CardContent>
      </Card>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

// Wrapper Page
const UsersManagement = () => {
   const { props } = usePage();
    const { auth,appIcon, activePath,data } = props;
  
  return (
    <AdminLayout activePath={activePath} auth={auth}>
      {() => <UsersManagementContent currentUser={auth} allData={data} />}
    </AdminLayout>
  );
};

export default UsersManagement;