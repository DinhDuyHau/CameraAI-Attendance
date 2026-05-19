import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  Cpu, 
  Eye,
  Search,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Settings() {
  const [sensitivity, setSensitivity] = useState(99);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Cấu hình Hệ thống</h1>
          <p className="text-slate-500 font-medium">Quản lý các thông số vận hành và bảo mật của Analytical Sentinel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Settings Nav */}
        <div className="space-y-2">
          {[
            { label: 'Chung', icon: SettingsIcon, active: true },
            { label: 'Bảo mật & Quyền', icon: Shield },
            { label: 'Thông báo', icon: Bell },
            { label: 'Dữ liệu & Lưu trữ', icon: Database },
            { label: 'Cấu hình AI', icon: Cpu },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Độ nhạy Nhận diện
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                  <span>LỎNG LẺO (50%)</span>
                  <span>CHẶT CHẼ (99%)</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="99" 
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-primary">Lưu ý:</span> Độ nhạy hiện tại đang ở mức <span className="font-bold">{sensitivity}%</span>. 
                    Mức độ này yêu cầu sự trùng khớp cao giữa dữ liệu khuôn mặt và hình ảnh thực tế, giúp giảm thiểu sai sót nhưng có thể tăng thời gian xử lý.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold mb-6">Thông tin Phiên bản</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <VideoIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Precision Lens Enterprise</p>
                  <p className="text-xs text-slate-500">v2.4.0-Enterprise • Build 20231024</p>
                </div>
                <button className="ml-auto text-xs font-bold text-primary hover:underline">Kiểm tra cập nhật</button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all">Hủy bỏ</button>
            <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  );
}
