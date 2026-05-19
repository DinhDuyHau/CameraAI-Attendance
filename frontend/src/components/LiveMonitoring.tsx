import { useState, useEffect } from 'react';
import { 
  Maximize2, 
  VideoOff, 
  MapPin, 
  User,
  Loader2,
  RefreshCcw,
  Activity,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Camera, AttendanceLog } from '@/src/types';

export default function LiveMonitoring() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maximizedCamera, setMaximizedCamera] = useState<Camera | null>(null);

  const fetchData = async () => {
    try {
      const [camRes, logRes] = await Promise.all([
        fetch('/api/cameras'),
        fetch('/api/attendancelogs')
      ]);

      if (!camRes.ok || !logRes.ok) throw new Error('Không thể tải dữ liệu');

      const camData = await camRes.json();
      const logData = await logRes.json();

      setCameras(Array.isArray(camData) ? camData : []);
      // Sort logs by time descending and take last 10
      const sortedLogs = (Array.isArray(logData) ? logData : []).sort((a, b) => 
        new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
      );
      setRecentLogs(sortedLogs.slice(0, 10));
      setError(null);
    } catch (err) {
      console.error('Error fetching live data:', err);
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading && cameras.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center -m-8">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">Đang kết nối luồng camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-8 overflow-hidden bg-slate-50">
      {/* Video Grid */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar">
        {error ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <Activity className="w-16 h-16 text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">{error}</h3>
            <button 
              onClick={fetchData}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
            >
              <RefreshCcw className="w-4 h-4" /> Thử lại
            </button>
          </div>
        ) : cameras.length > 0 ? (
          cameras.map((cam) => (
            <motion.div
              key={cam.cameraID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-black rounded-[32px] overflow-hidden group shadow-lg aspect-video flex items-center justify-center border-4 border-white shadow-slate-200/50"
            >
              {/* Live Stream Image - Assuming MJPEG converter is running on port 8000 */}
              <img 
                src={`http://localhost:8000/stream/${cam.cameraName.toLowerCase()}`} 
                alt={cam.cameraName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000';
                  (e.target as HTMLImageElement).className = "w-full h-full object-cover opacity-20 grayscale";
                }}
              />
              
              {/* Overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-xl shadow-lg ring-4 ring-red-600/20">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">{cam.location}</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-6">
                <h3 className="text-white font-black text-lg drop-shadow-md">{cam.cameraName}</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-tighter">Vùng giám sát: {cam.zoneType}</p>
              </div>

              <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={() => setMaximizedCamera(cam)}
                  className="bg-white/10 hover:bg-primary backdrop-blur-md p-3 rounded-2xl text-white transition-all shadow-xl"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-error backdrop-blur-md p-3 rounded-2xl text-white transition-all shadow-xl">
                  <VideoOff className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400">
            <VideoOff className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-bold">Không tìm thấy camera khả dụng</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-[360px] bg-slate-100 border-l border-slate-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-1">Lượt vào Gần đây</h2>
          <p className="text-xs text-slate-500 font-medium">Nhật ký Xác minh AI Thời gian thực</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
          {recentLogs.map((log, i) => (
            <motion.div
              key={log.attendanceLogID}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "bg-white p-4 rounded-3xl shadow-sm border-l-4 transition-all hover:shadow-md",
                log.confidenceScore < 0.8 ? 'border-error' : 'border-secondary'
              )}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center",
                  !log.employee?.avatarPath ? 'bg-slate-100 text-slate-400' : 'bg-slate-100'
                )}>
                  {log.employee?.avatarPath ? (
                    <img 
                      src={log.employee.avatarPath.replace(/\\/g, '/')} 
                      alt={log.employee.fullName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(log.employee?.fullName || 'U')}&background=random`;
                      }}
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-blue-900 truncate">{log.employee?.fullName || 'Khách lạ'}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">
                    ID: {log.employeeID} • LOẠI: {log.eventType}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-black text-primary block">
                    {new Date(log.eventTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                    {new Date(log.eventTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span>{log.camera?.location || 'Không rõ vị trí'}</span>
                </div>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                   'bg-secondary/10 text-secondary'
                )}>
                  {'XÁC MINH'}
                </span>
              </div>
            </motion.div>
          ))}
          {recentLogs.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-xs font-bold">Chưa có nhật ký gần đây</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-200/50 mt-auto border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">TẠI CHỖ HÔM NAY</p>
              <p className="text-2xl font-black text-blue-900 leading-tight">412</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">TỶ LỆ THÀNH CÔNG</p>
              <p className="text-2xl font-black text-secondary leading-tight">99.8%</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Maximized Camera Overlay */}
      <AnimatePresence>
        {maximizedCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-xl shadow-lg ring-4 ring-red-600/20">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE STREAM</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{maximizedCamera.location}</span>
                  </div>
                </div>
                <h2 className="text-4xl font-black text-white">{maximizedCamera.cameraName}</h2>
                <p className="text-white/60 font-bold uppercase tracking-tighter mt-1">Vùng giám sát: {maximizedCamera.zoneType}</p>
              </div>

              <button 
                onClick={() => setMaximizedCamera(null)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-[28px] text-white transition-all border border-white/10 group active:scale-95"
              >
                <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Main Stream Area */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
              <motion.div 
                layoutId={`cam-${maximizedCamera.cameraID}`}
                className="relative w-full h-full max-w-7xl rounded-[48px] overflow-hidden bg-slate-900 border-8 border-white/5 shadow-2xl flex items-center justify-center"
              >
                <img 
                  src={`http://localhost:8000/stream/${maximizedCamera.cameraName.toLowerCase()}`} 
                  alt={maximizedCamera.cameraName}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000';
                    (e.target as HTMLImageElement).className = "max-w-full max-h-full object-contain opacity-20 grayscale";
                  }}
                />
                
                {/* Visual accents */}
                <div className="absolute top-12 left-12 flex gap-4 text-white/40">
                  <div className="w-12 h-[1px] bg-current" />
                  <div className="h-12 w-[1px] bg-current -ml-12" />
                </div>
                <div className="absolute top-12 right-12 flex gap-4 text-white/40 justify-end">
                  <div className="w-12 h-[1px] bg-current" />
                  <div className="h-12 w-[1px] bg-current -mr-12" />
                </div>
                <div className="absolute bottom-12 left-12 flex gap-4 text-white/40 items-end">
                  <div className="w-12 h-[1px] bg-current" />
                  <div className="h-12 w-[1px] bg-current -ml-12" />
                </div>
                <div className="absolute bottom-12 right-12 flex gap-4 text-white/40 justify-end items-end">
                  <div className="w-12 h-[1px] bg-current" />
                  <div className="h-12 w-[1px] bg-current -mr-12" />
                </div>
              </motion.div>
            </div>

            {/* Footer / Stats bar (Optional) */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end z-10 bg-gradient-to-t from-black/80 to-transparent">
               <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-[32px] border border-white/10 flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CHẤT LƯỢNG</span>
                    <span className="text-sm font-bold text-white">1080P • 60FPS</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">DUNG LƯỢNG</span>
                    <span className="text-sm font-bold text-white">4.2 MB/s</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
