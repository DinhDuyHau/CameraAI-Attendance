import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  FileText, 
  History,
  Cctv,
  Settings, 
  Search, 
  Bell, 
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Page } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'live', label: 'Theo dõi Trực tiếp', icon: Video },
    { id: 'employees', label: 'Nhân viên', icon: Users },
    { id: 'logs', label: 'Nhật ký', icon: History },
    { id: 'devices', label: 'Camera & Cửa', icon: Cctv },
    { id: 'reports', label: 'Báo cáo', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ] as const;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="fixed left-0 top-0 h-full bg-slate-100 border-r border-slate-200 flex flex-col z-50 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-3 shrink-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                    <Video className="w-6 h-6 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-black text-blue-900 leading-tight truncate">Sentinel</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold truncate">Surveillance</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "p-2 rounded-xl text-slate-400 hover:bg-white hover:text-primary transition-all",
                isCollapsed && "mx-auto"
              )}
            >
              {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex flex-col gap-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  currentPage === item.id
                    ? "bg-white text-primary shadow-sm font-bold"
                    : "text-slate-600 hover:text-primary hover:bg-slate-200/50",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", currentPage === item.id && "fill-primary/10")} />
                {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-blue-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-2xl bg-white/50 border border-slate-200"
            >
              <p className="text-xs font-semibold text-primary mb-2">Trạng thái Lưu trữ</p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[74%]" />
              </div>
              <p className="text-[10px] mt-2 text-slate-500 font-medium whitespace-nowrap">742 GB trong 1 TB đã dùng</p>
            </motion.div>
          )}

          <div className={cn("flex items-center gap-3 px-2", isCollapsed && "justify-center")}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfUt2hELwE5MHAYCauYC9rvSrfruhAVwWODW8yJTftxiaONqMY1Kw4gI4HUg1Yl6AKX_SA8FOJA0xRLfce8ytHG6k_VgDP5aGBk4BY72mwPJmaihr3A3fqqoYsTEux7Kmwr7vFjTavDvAvllt4Od5knCIYgVTSZV4KvdI1DLXJCq3GU7mmip7PfA05um0RfZJmAmemiRfkx0sykRdiwfrVpQzpemxXxbyeHP4vPmgds1VrOdW4Dfs7uY7l1HEuGfEXykLcjKoGXk3u"
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0"
              referrerPolicy="no-referrer"
            />
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-bold text-on-surface truncate">Alex Rivera</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase">Quản trị</p>
              </motion.div>
            )}
            {!isCollapsed && (
              <button className="text-slate-400 hover:text-error transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div 
        animate={{ marginLeft: isCollapsed ? 80 : 280 }}
        className="flex-1 flex flex-col"
      >
        {/* Top Bar */}
        <header className="sticky top-0 right-0 z-40 bg-slate-50/70 backdrop-blur-xl border-b border-slate-200 flex justify-between items-center px-8 h-16">
          <div className="flex items-center gap-6 flex-1">
            <span className="text-lg font-extrabold tracking-tighter text-blue-900">Ống kính Chính xác</span>
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên, camera hoặc nhật ký..."
                className="w-full bg-slate-200/50 border-none rounded-full py-1.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-blue-50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-blue-50 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-blue-900">Quản trị viên</p>
                <p className="text-[10px] text-slate-500 font-medium">Trụ sở chính</p>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBihgSDqlQ1dGnv5S569PBK1VVJbkEUeWusJX9GtKj3k_eUjMe1_VVtVi-2gqxAjFtB7QFKNkMSlc5cAIXJ-YPe-X6q13xgR7Zy-vw74nm_BgX4Gdmdr4G_Lesy6iPBeAr1me6jPcDPH0GduhIxFoegMrVanTl2zsVTrsYAtvLyLlEXi095YGU2Vfw2VkYQzZ7T0n0jEMKa_v0AF3O7GQrFRY4msI4Fgk6H1J4P2Hp0TdSiP79cBGa2N9qvdwmiBEQe3BZ17Vmit079"
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
