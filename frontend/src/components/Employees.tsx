import { 
  UserPlus, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  Trash2,
  Edit2,
  Upload,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useEffect, useState, FormEvent, useRef, ChangeEvent } from 'react';
import { Employee } from '@/src/types';

const stats = [
  { label: 'Tổng nhân lực', value: '1,248', trend: '+12 tháng này', type: 'primary' },
  { label: 'Nhận dạng khuôn mặt', value: '98.2%', trend: '1.225 hồ sơ đã đào tạo', type: 'secondary' },
  { label: 'Đang chờ đào tạo', value: '23', trend: 'Cần chú ý', type: 'tertiary' },
  { label: 'Vùng nhận dạng', value: '14', trend: 'Đầu cuối đang hoạt động', type: 'primary' },
];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recognitionFiles, setRecognitionFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    employeeID: '',
    department: '',
    position: '',
    phone: '',
    email: '',
    status: true,
    avatarPath: '',
    faceEmbeddings: null as string | null
  });

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/Employees')
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
        }
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.warn('Received non-JSON response:', text);
          return [];
        }
        const text = await res.text();
        return text ? JSON.parse(text) : [];
      })
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching employees:', err);
        setEmployees([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenModal = (employee?: Employee) => {
    setSelectedFile(null);
    setRecognitionFiles([]);
    setPreviewUrl('');
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        fullName: employee.fullName,
        employeeID: employee.employeeID,
        department: employee.department,
        position: employee.position,
        phone: employee.phone || '',
        email: employee.email || '',
        status: employee.status,
        avatarPath: employee.avatarPath,
        faceEmbeddings: employee.faceEmbeddings
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        fullName: '',
        employeeID: '',
        department: '',
        position: '',
        phone: '',
        email: '',
        status: true,
        avatarPath: '',
        faceEmbeddings: null
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRecognitionFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setRecognitionFiles(prev => [...prev, ...newFiles]);
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleRemoveRecognitionFile = (index: number) => {
    setRecognitionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getAvatarUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Normalize slashes
    let normalizedPath = path.replace(/\\/g, '/');
    
    // Handle Windows/Server specific paths
    // Remove "wwwroot" if present at start as it's typically internal
    if (normalizedPath.toLowerCase().startsWith('wwwroot/')) {
      normalizedPath = normalizedPath.substring(8);
    }
    
    // Remove leading dots (e.g., ../../)
    normalizedPath = normalizedPath.replace(/^(\.\.\/)+/, '');
    
    // Ensure path starts with a single slash
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    
    return normalizedPath;
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingEmployee;
    const url = isEditing 
      ? `/api/Employees/${editingEmployee.employeeID}` 
      : '/api/Employees';
    const method = isEditing ? 'PUT' : 'POST';

    const now = new Date().toISOString();
    let payload: any = {
      employeeID: formData.employeeID,
      fullName: formData.fullName,
      department: formData.department,
      position: formData.position,
      phone: formData.phone,
      email: formData.email
    };

    if (isEditing) {
      payload = {
        ...payload,
        employeeID: editingEmployee.employeeID,
        status: formData.status,
        avatarPath: formData.avatarPath,
        faceEmbeddings: formData.faceEmbeddings,
        createdAt: editingEmployee?.createdAt,
        createdBy: editingEmployee?.createdBy,
        updatedAt: now,
        updatedBy: 'admin'
      };
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Try to parse response to get the ID if it's a new employee
        let employeeId = isEditing ? editingEmployee?.employeeID : null;
        try {
          const result = await response.json();
          if (result && result.employeeID) {
            employeeId = result.employeeID;
          }
        } catch (e) {
          console.warn('Could not parse employee ID for upload:', e);
        }

        // Upload avatar if selected and we have an ID
        if (selectedFile && employeeId) {
          const uploadData = new FormData();
          uploadData.append('file', selectedFile);
          
          await fetch(`/api/Employees/upload-avatar/${employeeId}`, {
            method: 'POST',
            body: uploadData
          }).catch(err => console.error('Failed to upload avatar:', err));
        }

        // Upload recognition photos if selected
        if (recognitionFiles.length > 0 && employeeId) {
          const photosData = new FormData();
          recognitionFiles.forEach((file: File) => {
            photosData.append('files', file);
          });
          
          await fetch(`/api/Employees/upload-photos/${employeeId}`, {
            method: 'POST',
            body: photosData
          }).catch(err => console.error('Failed to upload recognition photos:', err));
        }

        setIsModalOpen(false);
        setRecognitionFiles([]);
        fetchEmployees();
        showNotification(isEditing ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên mới thành công');
      } else {
        const errorText = await response.text();
        console.error('Failed to save employee:', errorText);
        showNotification(`Lỗi khi lưu nhân viên: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      showNotification('Lỗi kết nối máy chủ', 'error');
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await fetch(`/api/Employees/${employeeToDelete.employeeID}`, { method: 'DELETE' });
      if (response.ok) {
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
        fetchEmployees();
        showNotification('Đã xóa nhân viên thành công');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete employee:', errorText);
        showNotification('Lỗi khi xóa nhân viên', 'error');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      showNotification('Lỗi kết nối máy chủ', 'error');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Danh bạ nhân sự</h1>
          <p className="text-slate-500 font-medium">Quản lý danh tính doanh nghiệp và hồ sơ nhận dạng khuôn mặt.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-primary">{stat.value}</p>
            <div className={cn(
              "mt-2 flex items-center gap-1 font-bold text-xs",
              stat.type === 'tertiary' ? "text-tertiary" : stat.type === 'secondary' ? "text-secondary" : "text-slate-400 font-medium"
            )}>
              {stat.type === 'primary' && stat.trend.includes('+') && <TrendingUp className="w-3 h-3" />}
              {stat.type === 'tertiary' && <AlertCircle className="w-3 h-3" />}
              <span>{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-100 rounded-3xl p-1">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-20 text-center text-slate-500 font-medium">Đang tải danh sách nhân viên...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nhân viên</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Mã nhân viên</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Phòng ban</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Chức vụ</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Liên lạc</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Chấm công</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.employeeID} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-on-surface">{emp.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono text-sm text-primary font-semibold">{emp.employeeID}</td>
                    <td className="px-6 py-6 text-slate-600 font-medium">{emp.department}</td>
                    <td className="px-6 py-6 text-slate-600 font-medium">{emp.position}</td>
                    <td className="px-6 py-6 text-sm text-slate-500 font-medium">
                      {emp.phone && <p className="flex items-center gap-1"><span className="text-[10px] text-slate-400 uppercase w-8">Tel:</span> {emp.phone}</p>}
                      {emp.email && <p className="flex items-center gap-1"><span className="text-[10px] text-slate-400 uppercase w-8">Mail:</span> {emp.email}</p>}
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit",
                        emp.status 
                          ? "bg-secondary-container text-secondary" 
                          : "bg-slate-100 text-slate-500"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", emp.status ? "bg-secondary" : "bg-slate-400")} />
                        {emp.status ? 'Có' : 'Không'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(emp)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(emp)}
                          className="p-2 hover:bg-error-container hover:text-error rounded-xl text-slate-400 transition-all active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <div className="px-6 py-5 flex items-center justify-between text-sm border-t border-slate-100 bg-slate-50/30">
            <p className="text-slate-500 font-medium">Hiển thị <span className="font-bold text-on-surface">1 - {employees.length}</span> trên tổng số <span className="font-bold text-on-surface">{employees.length}</span> nhân viên</p>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm font-bold text-primary">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all">3</button>
              <span className="px-2 text-slate-400 py-1">...</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm transition-all">42</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl relative overflow-hidden shadow-2xl"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <h2 className="text-2xl font-black text-on-surface">
                  {editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : formData.avatarPath ? (
                        <img 
                          src={`/uploads/${formData.avatarPath}`}
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <UserPlus className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-lg shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã nhân viên</label>
                    <input 
                      required
                      type="text"
                      disabled={!!editingEmployee}
                      className={cn(
                        "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300",
                        editingEmployee && "opacity-60 cursor-not-allowed bg-slate-100"
                      )}
                      placeholder="Ví dụ: PL-77241"
                      value={formData.employeeID}
                      onChange={e => setFormData({...formData, employeeID: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Ví dụ: Marcus Sterling"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số điện thoại</label>
                    <input 
                      type="tel"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                      placeholder="example@company.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phòng ban</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Ví dụ: Kỹ thuật"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chức vụ</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Ví dụ: Lập trình viên"
                      value={formData.position}
                      onChange={e => setFormData({...formData, position: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Dữ liệu nhận dạng {recognitionFiles.length > 0 && `(${recognitionFiles.length} ảnh đã chọn)`}
                    </label>
                    {recognitionFiles.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setRecognitionFiles([])}
                        className="text-[10px] font-bold text-error uppercase hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button" 
                        onClick={() => recognitionInputRef.current?.click()}
                        className="flex items-center justify-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-secondary hover:text-secondary transition-all group"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-xs">Chọn ảnh từ máy</span>
                      </button>
               
                    </div>

                    <input 
                      type="file" 
                      ref={recognitionInputRef}
                      onChange={handleRecognitionFilesChange}
                      className="hidden" 
                      multiple
                      accept="image/*"
                    />

                    <input 
                      type="file" 
                      ref={cameraInputRef}
                      onChange={handleRecognitionFilesChange}
                      className="hidden" 
                      accept="image/*"
                      capture="user"
                    />

                    {recognitionFiles.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                        {recognitionFiles.map((file, idx) => (
                          <div key={`${file.name}-${idx}`} className="relative aspect-square group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Recognition ${idx}`} 
                              className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm"
                            />
                            <button 
                              type="button"
                              onClick={() => handleRemoveRecognitionFile(idx)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, status: !formData.status})}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors p-1",
                      formData.status ? "bg-secondary" : "bg-slate-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: formData.status ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-600">Chấm công tự động</span>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    {editingEmployee ? 'Cập nhật hồ sơ' : 'Xác nhận thêm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm relative overflow-hidden shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-error-container text-error rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">Xác nhận xóa</h3>
              <p className="text-slate-500 font-medium mb-8">
                Bạn có chắc chắn muốn xóa nhân viên <span className="font-bold text-on-surface">"{employeeToDelete?.fullName}"</span>? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-error text-white shadow-lg shadow-error/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border",
              notification.type === 'success' 
                ? "bg-secondary/90 border-secondary/20 text-white" 
                : "bg-error/90 border-error/20 text-white"
            )}>
              {notification.type === 'success' ? <TrendingUp className="w-5 h-5 rotate-90" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-bold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
