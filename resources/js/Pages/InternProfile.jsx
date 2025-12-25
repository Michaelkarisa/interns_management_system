// src/pages/InternProfile.jsx
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ProjectList from './projects/ProjectList';
import PerformanceBadge from '@/Layouts/PerformanceBadge';
import RecommendationBadge from '@/Layouts/RecommendationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertCircle, Edit, X, Download } from 'lucide-react'; // ✅ Added Download
import DateInputWithIcon from '@/Layouts/DateInputWithIcon';

// ✅ Toast Component (unchanged)
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

// ✅ Editable Profile Section Component (unchanged)
const EditableProfileSection = ({ intern, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: intern.name || '',
    email: intern.email || '',
    phone: intern.phone || '',
    institution: intern.institution || '',
    department: intern.department || '',
    position: intern.position || '',
    course: intern.course || '',
    from: intern.from || '',
    to: intern.to || '',
    graduated: intern.graduated || false,
    supervisor: intern.supervisor || '',
    skills: intern.skills || [],
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
             className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
             className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="course">Course</Label>
          <Input
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
             className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label htmlFor="from">Start Date *</Label>
          <DateInputWithIcon
            id="from"
            name="from"
            type="date"
            value={formData.from}
            onChange={handleChange}
            required
              className="w-[70%] border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="to">End Date</Label>
          <DateInputWithIcon
            id="to"
            name="to"
            type="date"
            value={formData.to}
            onChange={handleChange}
          className="text-sm w-[70%]"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="graduated"
          checked={formData.graduated}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, graduated: checked }))}
        />
        <Label htmlFor="graduated">Graduated</Label>
      </div>

      <div>
        <Label>Skills</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            placeholder="Add a skill..."
          />
          <Button type="button" onClick={handleAddSkill} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const InternProfileContent = ({ isSidebarCollapsed, allData }) => {
  const initialIntern = allData || {
    id: 1,
    name: 'Unknown Intern',
    email: '',
    passport_photo: null,
    institution: '',
    position: '',
    cv: null,
    course: '',
    from: '',
    to: '',
    graduated: false,
    recommended: false,
    performance: 0,
    notes: '',
    supervisor: '',
    department: '',
    phone: '',
    skills: [],
    activities: []
  };

  const [intern, setIntern] = useState(initialIntern);
  const [performance, setPerformance] = useState(initialIntern.performance || 0);
  const [recommended, setRecommended] = useState(initialIntern.recommended === 1 || initialIntern.recommended === true);
  const [notes, setNotes] = useState(initialIntern.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false); // ✅ Added

  const getStoredTab = () => {
    try {
      return localStorage.getItem(`intern_profile_tab_${intern.id}`) || 'profile';
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return 'profile';
    }
  };

  const [activeTab, setActiveTab] = useState(getStoredTab());

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    try {
      localStorage.setItem(`intern_profile_tab_${intern.id}`, newTab);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  useEffect(() => {
    setActiveTab(getStoredTab());
  }, [intern.id]);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const getDuration = () => {
    if (!intern.from) return 'N/A';
    const start = new Date(intern.from);
    const end = intern.to ? new Date(intern.to) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString();
  };

  // ✅ NEW: Generate PDF Report for this intern
  const handleGenerateReport = async () => {
    if (!intern.id) {
      showToast('Intern ID not found', 'error');
      return;
    }

    setLoadingReport(true);
    try {
      const response = await axios.get(`/interns/${intern.id}/report`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `intern-profile-${intern.name.replace(/\s+/g, '-')}-${intern.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`${intern.name}'s profile report downloaded!`, 'success');
    } catch (error) {
      console.error('Failed to generate report:', error);
      showToast(
        error.response?.data?.message || 'Failed to generate profile report.',
        'error'
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    setIsSaving(true);
    try {
      const response = await axios.post(`/interns/update/${intern.id}`, formData);
      setIntern(prev => ({ ...prev, ...formData }));
      showToast('Profile updated successfully!', 'success');
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Update failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePerformance = async () => {
    setIsSaving(true);
    try {
      const payload = {
        performance,
        recommended: recommended ? 1 : 0,
        notes
      };
      await axios.post(`/interns/update/${intern.id}`, payload);
      setIntern(prev => ({ ...prev, performance, recommended: recommended ? 1 : 0, notes }));
      showToast('Performance evaluation saved successfully!', 'success');
    } catch (err) {
      console.error('Save failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save performance evaluation';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDate = async () => {
    setIsSaving(true);
    try {
      await axios.post(`/interns/update/${intern.id}`, { to: intern.to });
      showToast('End date updated successfully!', 'success');
    } catch (err) {
      console.error('Update failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update end date';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

const handleDownloadCv = async () => {
  if (!intern.cv_url) return;

  // Extract original filename from cv_url
  const originalFilename = intern.cv_url.split('/').pop() || 'cv.pdf';
  
  // Generate clean name: MichaelKarisaKahindi_CV_20251220153045.pdf
  const filename = generateCvFilename(intern.name, originalFilename);

  await downloadPublicFile(intern.cv_url, filename);
};

const generateCvFilename = (name, originalFilename = 'cv.pdf') => {
  // Remove special characters and spaces from name
  const cleanName = name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .filter(Boolean)
    .join(''); 

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  // Preserve original extension if available
  const extMatch = originalFilename.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1] : 'pdf';

  return `${cleanName}_CV_${timestamp}.${ext}`;
};

const downloadPublicFile = async (fileUrl, filename) => {
  try {
    // Ensure absolute URL (in case fileUrl is relative)
    const absoluteUrl = fileUrl.startsWith('http')
      ? fileUrl
      : `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;

    const response = await fetch(absoluteUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename; // 👈 custom name here
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    // Optionally show toast: "Failed to download CV"
  }
};

  return (
    <div className="p-2 lg:p-2">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="flex items-center space-x-4 py-2">
        <button
          onClick={() => window.history.back()}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-medium"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Intern Profile</h1>
        {/* ✅ Generate Report Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateReport}
          disabled={loadingReport}
          className="ml-auto flex items-center gap-2"
          aria-label="Generate PDF report for this intern"
        >
          {loadingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Report
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-1/3">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={intern.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {intern.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold text-center">{intern.name}</h1>
              <p className="text-gray-600 text-center">{intern.position || 'Intern'}</p>
              <div className="mt-4 flex gap-2 flex-wrap justify-center">
                <RecommendationBadge isRecommended={recommended} />
                <PerformanceBadge score={performance} />
              </div>
              {intern.cv && (
                <Button variant="outline" className="mt-4 w-full" onClick={handleDownloadCv}>
                  Download CV
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm mt-6">
            <CardHeader>
              <CardTitle>Internship Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong className="text-gray-700">Institution:</strong>
                <p className="text-gray-600">{intern.institution || 'N/A'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Department:</strong>
                <p className="text-gray-600">{intern.department || 'N/A'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Position:</strong>
                <p className="text-gray-600">{intern.position || 'N/A'}</p>
              </div>
              <div>
                <strong className="text-gray-700">Duration:</strong>
                <p className="text-gray-600">
                  {formatDate(intern.from)} – {formatDate(intern.to)} ({getDuration()})
                </p>
              </div>
              <div>
                <strong className="text-gray-700">Graduated:</strong>
                <p className="text-gray-600">{intern.graduated ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <EditableProfileSection
                      intern={intern}
                      onSave={handleUpdateProfile}
                      onCancel={() => setIsEditingProfile(false)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="font-bold">Email</Label>
                        <p className="text-gray-700 mt-1">{intern.email}</p>
                      </div>
                      <div>
                        <Label className="font-bold">Phone</Label>
                        <p className="text-gray-700 mt-1">{intern.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="font-bold">Course</Label>
                        <p className="text-gray-700 mt-1">{intern.course || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="font-bold">Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {intern.skills && intern.skills.length > 0 ? (
                            intern.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No skills listed</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="font-bold">End Date</Label>
                        {intern.to ? (
                          <p className="mt-1">{formatDate(intern.to)}</p>
                        ) : (
                          <DateInputWithIcon
                            type="date"
                            value={intern.to || ""}
                            onChange={(e) =>
                              setIntern((prev) => ({ ...prev, to: e.target.value }))
                            }
                            className="w-1/3 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                      {!initialIntern.to && (
                        <div className="pt-2">
                          <Button onClick={handleSaveDate} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Update End Date'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <ProjectList projects={intern.activities || []} internId={intern.id} />
            </TabsContent>

            <TabsContent value="performance">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Performance Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Performance Score</Label>
                    <Slider
                      value={[performance]}
                      onValueChange={(val) => setPerformance(val[0])}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-gray-500 mt-1 block">{performance}/100</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recommended"
                      checked={recommended}
                      onCheckedChange={setRecommended}
                    />
                    <Label htmlFor="recommended">Recommended for Hiring</Label>
                  </div>

                  <div>
                    <Label>Performance Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                      placeholder="Add notes about the intern's performance..."
                      rows={5}
                    />
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleSavePerformance} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Evaluation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Main export
export default function InternProfile() {
   const { props } = usePage();
  const { auth,appIcon, activePath,data } = props;
  console.log("data: ",data);
  return (
    <AdminLayout activePath={activePath} auth={auth}>
      <InternProfileContent isSidebarCollapsed={false} allData={data} />
    </AdminLayout>
  );
}