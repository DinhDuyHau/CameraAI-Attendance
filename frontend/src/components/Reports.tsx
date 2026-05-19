import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  Briefcase,
  UserCheck,
  MapPin,
  RefreshCcw,
  SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Employee } from '@/src/types';

type ReportTab = 'overview' | 'daily_attendance';

interface AttendanceReport {
  employeeID: string;
  fullName: string;
  department: string;
  position: string;
  workDate: string;
  checkInCount: number;
  checkOutCount: number;
  firstCheckIn: string | null;
  lastCheckOut: string | null;
  totalMinutesWorked: number | null;
  status: string;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('daily_attendance');
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filters for Daily Attendance
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const departments = ['All', 'IT', 'HR', 'Accounting', 'Sales', 'Marketing', 'Legal'];
  const statuses = ['All', 'On time', 'Late', 'Absent'];

  const fetchAttendanceReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: fromDate,
        endDate: toDate,
      });
      if (selectedDept !== 'All') params.append('department', selectedDept);
      
      const res = await fetch(`/api/Reports/attendance?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceReport(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedDept]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedStatus, fromDate, toDate]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
    fetchAttendanceReport();
  }, []);

  const filteredData = attendanceReport.filter(item => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.employeeID.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On time': return 'bg-secondary/10 text-secondary';
      case 'Late': return 'bg-warning/10 text-warning';
      case 'Absent': return 'bg-error/10 text-error';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'On time': return 'Đúng giờ';
      case 'Late': return 'Muộn';
      case 'Absent': return 'Vắng mặt';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900">Báo cáo & Phân tích</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-tighter">Theo dõi hiệu suất và chuyên cần của nhân sự</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'overview' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('daily_attendance')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
              activeTab === 'daily_attendance' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Chấm công theo ngày
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'daily_attendance' ? (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Từ ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input 
                    type="date" 
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Đến ngày</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input 
                    type="date" 
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Bộ phận</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'Tất cả bộ phận' : dept}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Trạng thái</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Tất cả trạng thái' : getStatusLabel(s)}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={fetchAttendanceReport}
                  className="flex-1 bg-primary text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
                  Lọc dữ liệu
                </button>
                <button className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black text-blue-900">Chi tiết chấm công</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase mt-1">
                    Hiển thị {filteredData.length} kết quả
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên hoặc ID..."
                    className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 w-full md:w-80 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 sticky top-0 z-10">
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Nhân viên</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Ngày làm việc</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Vào đầu</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Ra cuối</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Trạng thái</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-wider">Lần quét (V/R)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Đang tải báo cáo...</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((item, idx) => (
                        <tr key={`${item.employeeID}-${item.workDate}-${idx}`} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-black text-blue-900 leading-none mb-1">{item.fullName}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {item.employeeID} • {item.department}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-black text-slate-700">
                              {new Date(item.workDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className={cn("text-sm font-black", item.firstCheckIn ? "text-primary" : "text-slate-300")}>
                                {item.firstCheckIn ? new Date(item.firstCheckIn).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className={cn("text-sm font-black", item.lastCheckOut ? "text-primary" : "text-slate-300")}>
                                {item.lastCheckOut ? new Date(item.lastCheckOut).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                              getStatusColor(item.status)
                            )}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-secondary">{item.checkInCount}</span>
                              <span className="text-slate-200">/</span>
                              <span className="text-xs font-black text-error">{item.checkOutCount}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-300">
                            <SearchX className="w-12 h-12" />
                            <p className="font-bold uppercase text-xs tracking-widest">Không tìm thấy dữ liệu báo cáo</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {filteredData.length > 0 && (
                <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-white sticky bottom-0">
                  <div className="text-xs font-bold text-slate-400">
                    Hiển thị <span className="text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-primary">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> trên <span className="text-slate-600">{filteredData.length}</span> bản ghi
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && currentPage > 3) {
                          pageNum = currentPage - 3 + i + 1;
                        }
                        if (pageNum <= totalPages) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={cn(
                                "w-9 h-9 rounded-xl text-xs font-black transition-all",
                                currentPage === pageNum ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Overview Tab */
          <motion.div
            key="overview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'TỶ LỆ ĐÚNG GIỜ', value: '94.2%', sub: '+2.4% vs tháng trước', icon: TrendingUp, color: 'text-secondary' },
                { label: 'ĐIỂM DANH TB', value: '08:42 AM', sub: 'Mục tiêu: 09:00 AM', icon: Clock, color: 'text-primary' },
                { label: 'SỐ LẦN VẮNG', value: '14', sub: '3 trường hợp không lý do', icon: AlertTriangle, color: 'text-error' },
                { label: 'ĐANG HOẠT ĐỘNG', value: '142', sub: '98% nhân sự hôm nay', icon: UserCheck, color: 'text-primary' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[38px] shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</div>
                  <div className={cn("text-4xl font-black mb-2", stat.color)}>{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">{stat.sub}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
              <TrendingUp className="w-20 h-20 text-slate-100 mb-6" />
              <h3 className="text-2xl font-black text-blue-900">Biểu đồ Xu hướng</h3>
              <p className="max-w-md text-slate-500 font-bold mt-2">Dữ liệu phân tích nâng cao đang được tích hợp để hiển thị các chỉ số chi tiết hơn.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

