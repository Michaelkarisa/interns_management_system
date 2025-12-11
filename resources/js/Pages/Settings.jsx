// src/pages/Settings.jsx
import { usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  Upload, 
  X,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  Edit,
  Save,
  Settings2Icon,
} from 'lucide-react';

import { create } from 'zustand';

export const useCompanyStore = create((set) => ({
  company: null,
  setCompany: (company) => set({ company }),
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

// ✅ Editable Form
const CompanyProfileForm = ({ company, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    address: company?.address || '',
    tax_id: company?.tax_id || '',
    industry: company?.industry || '',
    system_name: company?.system_name|| '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = 'error') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo must be less than 2MB', 'error');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value || '');
    });
    if (logoFile) payload.append('logo', logoFile);

    try {
      const response = await axios.post('/settings/company', payload);
      const updatedCompany = response.data.company; // ✅ get updated data

      showToast('Company profile updated successfully!', 'success');
      if (typeof onSave === 'function') {
        onSave(updatedCompany); // ✅ pass updated company to parent
      }
    } catch (error) {
      console.error('Company update failed:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        showToast('Please fix the errors below.', 'error');
      } else {
        const message = error.response?.data?.message || 'Failed to update company profile';
        showToast(message, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <Label>Company Logo</Label>
          <div className="mt-2 flex items-center gap-4 flex-wrap">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="h-16 w-16 object-contain rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    setLogoPreview(company?.logo_url || null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </div>

        {/* Grid Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div >
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
          </div>
           <div >
            <Label htmlFor="system_name">System Name *</Label>
            <Input
              id="system_name"
              name="system_name"
              value={formData.system_name}
              onChange={handleChange}
              required
              className={errors.system_name ? 'border-red-500' : ''}
            />
            {errors.system_name && <p className="text-red-500 text-sm mt-1">{errors.system_name[0]}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website[0]}</p>}
          </div>

          <div>
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
              className={errors.tax_id ? 'border-red-500' : ''}
            />
            {errors.tax_id && <p className="text-red-500 text-sm mt-1">{errors.tax_id[0]}</p>}
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g., Technology"
              className={errors.industry ? 'border-red-500' : ''}
            />
            {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry[0]}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={errors.address ? 'border-red-500' : ''}
            rows={3}
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address[0]}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// ✅ Read-only Display View
const CompanyProfileDisplay = ({ company, onEdit }) => {
  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Company Profile</h2>
        <Button size="sm" onClick={onEdit} className="flex items-center gap-1">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt="Company logo"
              className="h-20 w-20 object-contain rounded-md border"
            />
          ) : (
            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Building className="w-4 h-4" />
              <span>Company Name</span>
            </div>
            <p className="font-medium">{company?.name || '—'}</p>
          </div>

         <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Settings2Icon className="w-4 h-4" />
              <span>System name</span>
            </div>
            <p className="font-medium">{company?.system_name || '—'}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </div>
            <p>{company?.email || '—'}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </div>
            <p>{company?.phone || '—'}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </div>
            {company?.website ? (
              <a href={company?.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {company?.website}
              </a>
            ) : (
              '—'
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FileText className="w-4 h-4" />
              <span>Tax ID</span>
            </div>
            <p>{company?.tax_id || '—'}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Building className="w-4 h-4" />
              <span>Industry</span>
            </div>
            <p>{company?.industry || '—'}</p>
          </div>
        </div>

        {/* Address */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <MapPin className="w-4 h-4" />
            <span>Address</span>
          </div>
          <p className="whitespace-pre-line">{company?.address || '—'}</p>
        </div>
      </div>
    </div>
  );
};

// ✅ Main Component: Toggles between display and edit
const CompanyProfileCard = ({ company, onProfileUpdated }) => {
  const [editMode, setEditMode] = useState(!company);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);
  const handleSave = (updatedCompany) => {
    setEditMode(false);
    if (onProfileUpdated) onProfileUpdated(updatedCompany);
  };

  if (editMode) {
    return <CompanyProfileForm company={company} onSave={handleSave} onCancel={handleCancel} />;
  }

  return <CompanyProfileDisplay company={company} onEdit={handleEdit} />;
};

// ✅ Main Settings Page
const Settings = () => {
  const { props } = usePage();
  const { auth, activePath, company: initialCompany, flash } = props;
  const { user } = auth;

  const { company: companyData, setCompany } = useCompanyStore();

  // Initialize Zustand store from props if not set
  useEffect(() => {
    if (initialCompany && !companyData) {
      setCompany(initialCompany);
    }
  }, [initialCompany, companyData, setCompany]);

  const status = flash?.status || null;
  const mustVerifyEmail = user?.email_verified_at === null;

  return (
    <AdminLayout activePath={activePath} auth={auth}>
      {({ isSidebarCollapsed }) => (
        <div className="p-1 lg:p-1">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 gap-2">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                  <TabsTrigger value="delete">Delete</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                    className="max-w-2xl"
                  />
                </TabsContent>

                <TabsContent value="password" className="mt-6">
                  <UpdatePasswordForm className="max-w-2xl" />
                </TabsContent>

                <TabsContent value="company" className="mt-6">
                  <CompanyProfileCard
                    company={companyData || initialCompany}
                    onProfileUpdated={(updatedCompany) => {
                      setCompany(updatedCompany); // ✅ Update Zustand store directly
                    }}
                  />
                </TabsContent>

                <TabsContent value="delete" className="mt-6">
                  <DeleteUserForm className="max-w-2xl" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default Settings;