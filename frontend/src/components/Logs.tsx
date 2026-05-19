import React, { useState, useEffect, FormEvent } from 'react';
import { 
  History, 
  RefreshCcw, 
  Loader2, 
  Search, 
  Calendar, 
  User, 
  Video, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AttendanceLog, Employee, Camera } from '@/src/types';

export default function Logs() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AttendanceLog | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    employeeID: '',
    cameraID: 0,
    eventType: 'IN',
    eventTime: new Date().toISOString().split('.')[0],
    confidenceScore: 0.95
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logRes, empRes, camRes] = await Promise.all([
        fetch('/api/attendancelogs'),
        fetch('/api/employees'),
        fetch('/api/cameras')
      ]);

      if (!logRes.ok || !empRes.ok || !camRes.ok) throw new Error('Không thể tải dữ liệu từ máy chủ');
      
      const logData = await logRes.json();
      const empData = await empRes.json();
      const camData = await camRes.json();

      // Sort by time descending by default
      const sortedLogs = (Array.isArray(logData) ? logData : []).sort((a, b) => 
        new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
      );

      setLogs(sortedLogs);
      setEmployees(Array.isArray(empData) ? empData : []);
      setCameras(Array.isArray(camData) ? camData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    // Get local ISO string for current time including seconds (Vietnam UTC+7)
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 19);

    setFormData({
      employeeID: employees.length > 0 ? employees[0].employeeID : '',
      cameraID: cameras.length > 0 ? cameras[0].cameraID : 0,
      eventType: 'IN',
      eventTime: localISOTime,
      confidenceScore: 0
    });
    setEditingLog(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (log: AttendanceLog) => {
    setEditingLog(log);
    
    // datetime-local input expects YYYY-MM-DDTHH:mm:ss when step is 1
    // We must convert the UTC time from server to the user's local time string
    let localDateTime = '';
    if (log.eventTime) {
      const date = new Date(log.eventTime);
      const offset = date.getTimezoneOffset() * 60000;
      localDateTime = new Date(date.getTime() - offset).toISOString().slice(0, 19);
    } else {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      localDateTime = new Date(now.getTime() - offset).toISOString().slice(0, 19);
    }

    setFormData({
      employeeID: log.employeeID,
      cameraID: log.cameraID,
      eventType: log.eventType,
      eventTime: localDateTime,
      confidenceScore: log.confidenceScore
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/attendancelogs/${deleteConfirm.attendanceLogID}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Không thể xóa nhật ký');
      showNotification('Đã xóa nhật ký thành công!');
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi xóa nhật ký', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editingLog ? `/api/attendancelogs/${editingLog.attendanceLogID}` : '/api/attendancelogs';
    const method = editingLog ? 'PUT' : 'POST';

    try {
      // Giữ nguyên chuỗi thời gian từ ô nhập liệu để tránh bị lệch múi giờ khi gửi đi
      const payload: any = {
        ...formData,
        eventTime: formData.eventTime,
        doorID: cameras.find(c => c.cameraID === formData.cameraID)?.doorID || 0
      };

      // Thêm các trường kiểm soát khi tạo mới
      if (!editingLog) {
        // Tạo thời gian hiện tại ở múi giờ Việt Nam (UTC+7)
        const now = new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        payload.createdAt = vnTime.toISOString().slice(0, 19);
        payload.createdBy = 'system';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lưu dữ liệu');
      }

      showNotification(`${editingLog ? 'Cập nhật' : 'Thêm'} nhật ký thành công!`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi khi lưu nhật ký', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    const fullName = log.employee?.fullName?.toLowerCase() || '';
    const employeeInfo = (log.employee?.employeeCode || log.employeeID || '').toString().toLowerCase();
    const cameraName = log.camera?.cameraName?.toLowerCase() || '';
    
    return fullName.includes(s) || employeeInfo.includes(s) || cameraName.includes(s);
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getEventBadge = (type: string) => {
    const t = type.toUpperCase();
    if (t === 'IN' || t === 'CHECKIN') {
      return <span className="px-2 py-1 rounded-lg bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-wider">Vào</span>;
    }
    if (t === 'OUT' || t === 'CHECKOUT') {
      return <span className="px-2 py-1 rounded-lg bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider">Ra</span>;
    }
    return <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-wider">{type}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={cn(
          "fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-4",
          notification.type === 'success' ? "bg-white text-green-600 border border-green-100" : "bg-white text-error border border-error/10"
        )}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold text-sm text-blue-900">{notification.message}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-blue-900">Nhật ký hệ thống</h2>
          <p className="text-slate-500 font-medium">Theo dõi lịch sử hoạt động và sự kiện quẹt thẻ / nhận diện</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm nhân viên, camera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-white border border-slate-100 text-slate-500 hover:text-primary rounded-2xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button 
            onClick={handleOpenModal}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Đang tải nhật ký mới nhất...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Lỗi tải dữ liệu</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={fetchData} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20">
            Thử lại
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Thời gian</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Nhân viên</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Sự kiện</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Camera</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedLogs.length > 0 ? paginatedLogs.map((log) => (
                  <tr key={log.attendanceLogID} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-blue-900 font-bold text-sm">
                          {new Date(log.eventTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(log.eventTime).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {log.employee?.avatarPath ? (
                            <img 
                              src={log.employee.avatarPath.replace(/\\/g, '/')} 
                              alt={log.employee?.fullName || 'Employee'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(log.employee?.fullName || 'U')}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-blue-900 font-bold text-sm">{log.employee?.fullName || 'Người lạ / Chưa rõ'}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{log.employee?.employeeCode || log.employeeID}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getEventBadge(log.eventType || 'UNKNOWN')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-600 font-bold text-sm">
                        <Video className="w-3.5 h-3.5 text-primary" />
                        {log.camera?.cameraName || 'Camera không xác định'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(log)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(log)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-error transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <History className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-medium">Không tìm thấy nhật ký trùng khớp</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-slate-500">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} trong số {filteredLogs.length} nhật ký
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary hover:border-primary/20 disabled:opacity-40 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-8 h-8 rounded-xl text-xs font-bold transition-all",
                            currentPage === pageNum 
                              ? "bg-primary text-white shadow-md shadow-primary/20" 
                              : "bg-white border border-slate-200 text-slate-500 hover:border-primary/20 hover:text-primary"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (
                      (pageNum === 2 && currentPage > 3) || 
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={pageNum} className="text-slate-300 text-xs px-1 font-bold">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary hover:border-primary/20 disabled:opacity-40 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-blue-900">
                  {editingLog ? 'Sửa nhật ký' : 'Thêm nhật ký'}
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {editingLog ? 'Cập nhật lại thông tin sự kiện' : 'Tạo sự kiện điểm danh mới thủ công'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Nhân viên</label>
                <select 
                  required
                  value={formData.employeeID}
                  onChange={e => setFormData({...formData, employeeID: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Chọn nhân viên...</option>
                  {employees.map(emp => (
                    <option key={emp.employeeID} value={emp.employeeID}>{emp.fullName} ({emp.employeeCode || emp.employeeID})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Camera</label>
                  <select 
                    required
                    value={formData.cameraID}
                    onChange={e => setFormData({...formData, cameraID: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value={0}>Chọn camera...</option>
                    {cameras.map(cam => (
                      <option key={cam.cameraID} value={cam.cameraID}>{cam.location}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Loại sự kiện</label>
                  <select 
                    required
                    value={formData.eventType}
                    onChange={e => setFormData({...formData, eventType: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value="IN">Vào (IN)</option>
                    <option value="OUT">Ra (OUT)</option>
                    <option value="CheckIn">CheckIn</option>
                    <option value="BreakOut">BreakOut</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Thời gian (Giờ:Phút:Giây)</label>
                <input 
                  required
                  type="datetime-local"
                  step="1"
                  value={formData.eventTime}
                  onChange={e => setFormData({...formData, eventTime: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>{editingLog ? 'Lưu thay đổi' : 'Xác nhận tạo'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" onClick={() => !submitting && setDeleteConfirm(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-blue-900 mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Bạn có chắc chắn muốn xóa nhật ký của <span className="font-bold text-blue-900">{deleteConfirm.employee?.fullName || 'Người lạ'}</span> vào lúc <span className="font-bold">{new Date(deleteConfirm.eventTime).toLocaleString('vi-VN')}</span>? 
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-4 bg-error text-white font-bold rounded-2xl shadow-lg shadow-error/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Xóa ngay</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
