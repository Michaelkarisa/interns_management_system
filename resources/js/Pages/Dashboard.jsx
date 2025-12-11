// ===========================
// ZUSTAND STORE
// ===========================
import { create } from 'zustand';
// ===========================
// COMPONENTS
// ===========================
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import InternCard from '@/Pages/interns/InternCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { CheckCircle, AlertCircle } from 'lucide-react';

const useDashboardStore = create((set) => ({
  // State
  stats: {
    total: 0,
    active: 0,
    completed: 0,
    recommended: 0,
  },
  toast: null,

  // Actions
  setStats: (stats) => set({ stats }),
  
  initializeStats: (data) => set({
    stats: {
      total: data.totalInterns || 0,
      active: data.activeInterns || 0,
      completed: data.completedInterns || 0,
      recommended: data.recommendedInterns || 0,
    }
  }),

  showToast: (message, type = 'success') => set({ 
    toast: { message, type } 
  }),

  hideToast: () => set({ toast: null }),
}));


// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const Icon = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
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

// Stat Card Component
const StatCard = ({ title, value, color, textColor, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`${color} rounded-2xl shadow-sm border-0`}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-sm font-medium ${textColor}`}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${textColor}`}>
            <AnimatedNumber value={value} duration={1000} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ isSidebarCollapsed, data }) => {
  const { stats, initializeStats } = useDashboardStore();

  useEffect(() => {
    initializeStats(data);
  }, [data, initializeStats]);

  const getInternGridClass = () => {
    if (isSidebarCollapsed) {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    } else {
      return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const statCards = [
    { 
      title: 'Total Interns', 
      value: stats.total, 
      color: 'bg-blue-100', 
      textColor: 'text-blue-700' 
    },
    { 
      title: 'Currently Active', 
      value: stats.active, 
      color: 'bg-green-100', 
      textColor: 'text-green-700' 
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      color: 'bg-amber-100', 
      textColor: 'text-amber-700' 
    },
    { 
      title: 'Recommended', 
      value: stats.recommended, 
      color: 'bg-purple-100', 
      textColor: 'text-purple-700' 
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Intern Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <StatCard
            key={idx}
            title={card.title}
            value={card.value}
            color={card.color}
            textColor={card.textColor}
            index={idx}
          />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Top Interns</h2>
        <div className={`grid ${getInternGridClass()} gap-6`}>
          {data.topInterns
            .slice(0, 3)
            .map((intern) => (
              <motion.div
                key={intern.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <InternCard intern={intern} />
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { props } = usePage();
  const { auth,appIcon, activePath,data,flash } = props;

  const { toast, showToast, hideToast } = useDashboardStore();

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      showToast(flash.success, 'success');
    }
    if (flash?.error) {
      showToast(flash.error, 'error');
    }
  }, [flash, showToast]);

  return (
    <AdminLayout activePath={activePath} auth={auth}>
      {({ isSidebarCollapsed }) => (
        <>
          <DashboardContent isSidebarCollapsed={isSidebarCollapsed} data={data} />
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={hideToast} 
            />
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;