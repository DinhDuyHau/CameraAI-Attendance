import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Camera as CameraIcon, 
  DoorOpen, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Power, 
  Loader2, 
  RefreshCcw, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Camera, Door } from '@/src/types';

export default function Devices() {
  const [activeTab, setActiveTab] = useState<'camera' | 'door'>('camera');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Camera | Door | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, type: 'camera' | 'door', name: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    // Camera fields
    cameraName: '',
    doorID: 0,
    zoneType: '',
    rtsp: '',
    location: '',
    // Door fields
    doorName: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [camRes, doorRes] = await Promise.all([
        fetch('/api/cameras'),
        fetch('/api/doors')
      ]);

      if (!camRes.ok || !doorRes.ok) {
        throw new Error('Không thể tải dữ liệu từ máy chủ');
      }

      const camData = await camRes.json();
      const doorData = await doorRes.json();

      setCameras(Array.isArray(camData) ? camData : []);
      setDoors(Array.isArray(doorData) ? doorData : []);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Đã xảy ra lỗi khi kết nối với hệ thống. Vui lòng thử lại.');
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
    setFormData({
      cameraName: '',
      doorID: doors.length > 0 ? doors[0].doorID : 0,
      zoneType: '',
      rtsp: '',
      location: '',
      doorName: '',
      description: ''
    });
    setEditingDevice(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (device: Camera | Door) => {
    setEditingDevice(device);
    if ('cameraID' in device) {
      setFormData({
        ...formData,
        cameraName: device.cameraName,
        doorID: device.doorID,
        zoneType: device.zoneType,
        rtsp: device.rtsp,
        location: device.location
      });
    } else {
      setFormData({
        ...formData,
        doorName: device.doorName,
        description: device.description
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setSubmitting(true);
    const { id, type } = deleteConfirm;
    const url = type === 'camera' ? `/api/cameras/${id}` : `/api/doors/${id}`;
    
    try {
      const response = await fetch(url, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể xóa thiết bị');
      }
      
      showNotification(`Đã xóa ${type === 'camera' ? 'camera' : 'cửa'} thành công!`);
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      console.error('Delete error:', err);
      showNotification(err.message || 'Có lỗi xảy ra khi xóa thiết bị', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const isCamera = activeTab === 'camera';
    let url = isCamera ? '/api/cameras' : '/api/doors';
    const method = editingDevice ? 'PUT' : 'POST';
    
    if (editingDevice) {
      const id = isCamera ? (editingDevice as Camera).cameraID : (editingDevice as Door).doorID;
      url = `${url}/${id}`;
    }
    
    const payload = isCamera ? {
      cameraName: formData.cameraName,
      doorID: Number(formData.doorID),
      zoneType: formData.zoneType,
      rtsp: formData.rtsp,
      location: formData.location
    } : {
      doorName: formData.doorName,
      description: formData.description
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể lưu dữ liệu');
      }

      showNotification(`${editingDevice ? 'Cập nhật' : 'Thêm'} ${isCamera ? 'camera' : 'cửa'} thành công!`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Submit error:', err);
      showNotification(err.message || 'Có lỗi xảy ra khi lưu thiết bị', 'error');
    } finally {
      setSubmitting(false);
    }
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

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-blue-900">Camera & Cửa</h2>
          <p className="text-slate-500 font-medium">Quản lý hệ thống thiết bị giám sát và kiểm soát</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-3 text-slate-500 hover:text-primary bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow transition-all disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button 
            onClick={handleOpenModal}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('camera')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'camera' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <CameraIcon className="w-4 h-4" />
          Camera ({cameras.length})
        </button>
        <button 
          onClick={() => setActiveTab('door')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'door' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <DoorOpen className="w-4 h-4" />
          Cửa ({doors.length})
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium font-sans">Đang tải dữ liệu thiết bị...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Đã có lỗi xảy ra</h3>
          <p className="text-slate-500 max-w-sm mb-6">{error}</p>
          <button onClick={fetchData} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">
            Thử lại
          </button>
        </div>
      ) : activeTab === 'camera' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.length > 0 ? cameras.map((camera) => (
            <div key={camera.cameraID} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <CameraIcon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    camera.status ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {camera.status ? 'online' : 'offline'}
                  </span>
                  <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-blue-900">{camera.cameraName}</h3>
                <p className="text-xs text-slate-500">{camera.location}</p>
                <div className="pt-2 space-y-1">
                  <p className="text-[10px] text-slate-400 font-mono">Vùng: {camera.zoneType}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate" title={camera.rtsp}>
                    Stream: {camera.rtsp}
                  </p>
                  {camera.door && (
                    <p className="text-[10px] text-primary font-bold">
                      Kết nối với: {camera.door.doorName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(camera)}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ id: camera.cameraID, type: 'camera', name: camera.cameraName })}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-error transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button className={cn(
                  "p-2 rounded-xl transition-all shadow-sm",
                  camera.status ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"
                )}>
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400">Không tìm thấy camera nào.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doors.length > 0 ? doors.map((door) => (
            <div key={door.doorID} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-1 mb-6">
                <h3 className="font-bold text-blue-900">{door.doorName}</h3>
                <p className="text-xs text-slate-500">{door.description}</p>
                <p className="text-[10px] text-slate-400 mt-2">Ngày tạo: {new Date(door.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(door)}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ id: door.doorID, type: 'door', name: door.doorName })}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-error transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-2 rounded-xl bg-primary text-white transition-all shadow-sm">
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400">Không tìm thấy cửa nào.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Device Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-blue-900">
                  {editingDevice ? 'Chỉnh sửa' : 'Thêm'} {activeTab === 'camera' ? 'Camera' : 'Cửa'}
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {editingDevice ? 'Cập nhật lại thông tin cấu hình' : 'Điền thông tin cấu hình cho thiết bị'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeTab === 'camera' ? (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Tên Camera</label>
                      <input 
                        required
                        type="text"
                        value={formData.cameraName}
                        onChange={e => setFormData({...formData, cameraName: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Nhập tên camera..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Thuộc Cửa</label>
                      <select 
                        required
                        value={formData.doorID}
                        onChange={e => setFormData({...formData, doorID: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                      >
                        <option value={0}>Chọn cửa kết nối...</option>
                        {doors.map(door => (
                          <option key={door.doorID} value={door.doorID}>{door.doorName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Phân loại Vùng (Zone)</label>
                      <input 
                        required
                        type="text"
                        value={formData.zoneType}
                        onChange={e => setFormData({...formData, zoneType: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Ví dụ: A, B, v.v..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Đường dẫn RTSP</label>
                      <input 
                        required
                        type="text"
                        value={formData.rtsp}
                        onChange={e => setFormData({...formData, rtsp: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-[13px] font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="rtsp://admin:password@1.2.3.4:554/stream"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Vị trí lắp đặt</label>
                      <input 
                        required
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Mô tả nơi đặt camera..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Tên Cửa</label>
                      <input 
                        required
                        type="text"
                        value={formData.doorName}
                        onChange={e => setFormData({...formData, doorName: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Nhập tên cửa (vd: Cửa chính tầng 1)..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Mô tả</label>
                      <textarea 
                        required
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                        placeholder="Nhập mô tả chi tiết về lối đi này..."
                      />
                    </div>
                  </>
                )}
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
                    <span>{editingDevice ? 'Lưu thay đổi' : 'Xác nhận thêm'}</span>
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
              Bạn có chắc chắn muốn xóa <span className="font-bold text-blue-900">{deleteConfirm.name}</span>? 
              Hành động này không thể hoàn tác.
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
