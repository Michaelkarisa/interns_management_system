// src/components/layout/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  User,
  LogOut,
  UserCog,
  ClipboardList,
  Building
} from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

const navItems = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'Interns', href: 'interns', icon: Users },
  { name: 'Projects', href: 'projects', icon: FileText },
  { name: 'Users', href: 'users', icon: UserCog },
  { name: 'Audit Logs', href: 'auditlogs', icon: ClipboardList },
  { name: 'Settings', href: 'settings', icon: Settings },
];

const AdminLayout = ({ children, activePath = '', auth }) => {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const {user,appIcon,appname}= auth;
  const [isClient, setIsClient] = useState(false);

  // Logout modal + countdown
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const performLogout = () => {
    setLoggingOut(true);
    router.post(route("logout"));
  };

  const handleLogout = () => {
    setShowLogoutWarning(true);
    setCountdown(15);
    setLoggingOut(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          performLogout();
        }
        return prev - 1;
      });
    }, 1000);

    setCountdownInterval(interval);
  };

  const cancelLogout = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    setShowLogoutWarning(false);
  };

  const sidebarWidth = collapsed ? 70 : 200;
  const headerHeight = '64px';

  const content =
    typeof children === 'function'
      ? children({ isSidebarCollapsed: collapsed })
      : children;

  return (
    <>
      <Head title={`${activePath || 'Dashboard'}`} />
      <div className="flex min-h-screen bg-gray-50">

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: sidebarWidth }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 z-30 h-full bg-white border-r border-gray-200 flex flex-col"
          style={{ overflow: 'hidden' }}
        >
          {/* Logo Section — Height matches topbar (64px) */}
          <div
            className="border-b border-gray-200 flex items-center"
            style={{ height: headerHeight }}
          >
            <div className="px-2 flex items-center gap-3 w-full">
                                  {appIcon ? (
            <img
              src={appIcon}
              alt="Company logo"
              className="h-10 w-10 object-contain rounded-md border"
            />
          ) : (
            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
              <Building className="h-8 w-8 text-gray-900" />
            </div>
          )}
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.h1
                    key="logo-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-xl font-bold text-gray-800 whitespace-nowrap"
                  >
                    {appname}
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>

          <nav className="p-3 flex-1">
            <ul className="space-y-1">
              {navItems
                .filter((item) => item.href !== "users" || user.role === "super_admin")
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.href;
                  return (
                    <li key={item.name}>
                      <a
                        href={route(item.href)}
                        className={`flex items-center gap-3 px-3 py-4 rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              key={`nav-text-${item.name}`}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 5 }}
                              className="whitespace-nowrap"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </a>
                    </li>
                  );
                })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-start text-gray-500 hover:text-gray-700"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span className="ml-2">{collapsed ? "" : "Collapse"}</span>
            </Button>
          </div>
        </motion.div>

        {/* Main Area */}
        <div className="flex-1" style={{ marginLeft: isClient ? sidebarWidth : 256 }}>
          {/* Header */}
          <header
            className="bg-white border-b border-gray-200 p-4 flex justify-end items-center z-20"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              left: isClient ? sidebarWidth : 256,
              height: headerHeight,
            }}
          >
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-medium text-gray-700">{user.name}</span>
                    <User className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="text-gray-500 text-sm">Not authenticated</span>
            )}
          </header>

          {/* Content */}
          <main
            className="p-4 lg:p-6"
            style={{
              marginTop: headerHeight,
              minHeight: `calc(100vh - ${headerHeight})`,
            }}
          >
            {content}
          </main>
        </div>
      </div>

      {/* Logout Warning Modal */}
      <AlertDialog open={showLogoutWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out automatically in{" "}
              <span className="font-bold text-red-600">{countdown} seconds</span>{" "}
              unless you cancel.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex w-full justify-between items-center">
            <AlertDialogCancel
              onClick={cancelLogout}
              className="mr-auto"
              disabled={loggingOut}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (countdownInterval) clearInterval(countdownInterval);
                performLogout();
              }}
              className="bg-red-600 hover:bg-red-700 ml-auto flex items-center justify-center gap-2"
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <span className="loader-border h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging out...
                </>
              ) : (
                "Continue Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminLayout;