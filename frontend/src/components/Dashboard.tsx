import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  AlertTriangle, 
  Clock, 
  Users, 
  Download, 
  Calendar,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const data = [
  { name: 'TH 2', present: 1120, late: 150 },
  { name: 'TH 3', present: 1180, late: 100 },
  { name: 'TH 4', present: 1244, late: 40 },
  { name: 'TH 5', present: 1150, late: 120 },
  { name: 'TH 6', present: 1100, late: 180 },
  { name: 'TH 7', present: 400, late: 20 },
  { name: 'CN', present: 100, late: 10 },
];

const stats = [
  { label: 'Total Employees', value: '1,284', change: '+12', type: 'primary' },
  { label: 'Present Now', value: '1,102', change: '86%', type: 'secondary' },
  { label: 'Absent', value: '42', change: 'warning', type: 'error' },
  { label: 'Late Entries', value: '140', change: '11%', type: 'tertiary' },
];

const alerts = [
  { 
    title: 'Nỗ lực Xâm nhập Trái phép', 
    desc: 'Hệ thống phát hiện khuôn mặt lạ tại Cổng 4. Đã thông báo bảo vệ.', 
    time: '09:42 AM • Gate 04',
    type: 'error'
  },
  { 
    title: 'Phát hiện Độ trễ cao', 
    desc: 'Camera WEST_W_02 báo cáo độ trễ 400ms khi nhận diện luồng video.', 
    time: '08:15 AM • Server 02',
    type: 'warning'
  },
  { 
    title: 'Báo cáo Ca làm việc Đã tạo', 
    desc: 'Bản tóm tắt chuyên cần hàng ngày cho Ca A hiện đã sẵn sàng để tải về.', 
    time: '07:00 AM • Reports',
    type: 'success'
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-primary font-bold text-sm tracking-tight mb-1">Tổng quan</p>
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Chỉ số Ca sáng</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-primary text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Hôm nay: 24 thg 10, 2023
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <Download className="w-4 h-4" />
            Xuất Báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.type}/5 rounded-full group-hover:scale-125 transition-transform duration-500`} />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-on-surface leading-none">{stat.value}</span>
              <span className={cn(
                "text-xs font-bold flex items-center mb-1",
                stat.type === 'error' ? "text-error" : stat.type === 'secondary' ? "text-secondary" : "text-primary"
              )}>
                {stat.change === 'warning' ? <AlertTriangle className="w-3 h-3" /> : stat.change}
                {stat.change.startsWith('+') && <ArrowUpRight className="w-3 h-3" />}
              </span>
            </div>
            <div className="mt-4 flex gap-1">
              <div className={cn("h-1 flex-1 rounded-full", `bg-${stat.type}`)} />
              <div className={cn("h-1 flex-1 rounded-full opacity-20", `bg-${stat.type}`)} />
              <div className={cn("h-1 flex-1 rounded-full opacity-20", `bg-${stat.type}`)} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-extrabold text-on-surface">Xu hướng Chuyên cần Hàng tuần</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-slate-500">Có mặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="text-xs font-bold text-slate-500">Muộn</span>
                </div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3ff" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="present" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'TH 4' ? '#003d9b' : '#003d9b20'} />
                    ))}
                  </Bar>
                  <Bar dataKey="late" fill="#85180020" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Recognition */}
          <div>
            <h3 className="text-xl font-extrabold text-on-surface mb-6">Nhận diện Thời gian thực</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-slate-200 aspect-video shadow-sm">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPp58Fw4uYSDPze7ERlKpVAlqx40tPkQGDGFxJ-HuIUlvU4YKiFiyrKd8K-ju9-jmAcY7BM_GynMM4GADOcsOtl7H8S3herrVKQlRNSB-rsqp86x7X5v7ymo_kuTYvXYhcN8RKw_07qAfWWNJI7dQVYv4KJnpJRVV0wFJar7zkMkY_k-Gw621JALv3064MFOUeH__wDdMTb_l6kE82PlBrPOF7Aayh73d81MfqHFzFtXNqL7QPnc_estgsYoigM00Nqr2_tQQaA_4f" 
                  alt="Camera 1"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">SẢNH_01 • TRỰC TIẾP</span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user${i}/32/32`} 
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">+4</div>
                  </div>
                </div>
                {/* Recognition Frame */}
                <div className="absolute top-1/4 left-1/3 w-20 h-24 border-2 border-primary/60 rounded-lg">
                  <div className="absolute -top-6 left-0 bg-primary px-2 py-0.5 rounded text-[8px] text-white font-bold">ALEX R. - 98.4%</div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-slate-200 aspect-video shadow-sm">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1HDhiXjCgYIu96DXXk7K-dbMtHV6qP5KkJ6RMp_laocX8Cc15jbzUOsWzjj7hxNP1sa3sRMdwRWuZfB0IWSBgl7PN0Kyp1OntcN-jpqKjNjpDpaqvGyxV0HeTQJZpbxGc0OstuDbgaOHky51bD95tSx62THMfORfuJHx0Yh81b8tq1DpmdkaNMVH7QLYDVGt8oXy6B-PFUUih94aTFVtHdD7aLnyqUmmsf_n93gZ4SEw6UTeqIYELIHQ12nuK3XgQ5X_rgEN7TFwW" 
                  alt="Camera 2"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">CÁNH_ĐÔNG_04 • TRỰC TIẾP</span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-bold">Lối vào Cánh Đông</p>
                  <p className="text-[10px] opacity-70">34 lượt nhận diện trong giờ qua</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-lg font-extrabold text-on-surface mb-6">Cảnh báo Gần đây</h3>
            <div className="space-y-6">
              {alerts.map((alert, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className={cn(
                    "mt-1 w-2 h-2 rounded-full shrink-0 ring-4",
                    alert.type === 'error' ? "bg-error ring-error/10" : 
                    alert.type === 'warning' ? "bg-tertiary ring-tertiary/10" : 
                    "bg-secondary ring-secondary/10"
                  )} />
                  <div>
                    <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{alert.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{alert.desc}</p>
                    <span className="text-[9px] font-bold text-slate-400 mt-2 block uppercase">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2.5 text-[11px] font-bold text-primary uppercase tracking-widest hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
              Xem Tất cả Cảnh báo
            </button>
          </div>

          <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
            <Zap className="w-6 h-6 mb-4 opacity-50" />
            <h4 className="text-lg font-bold leading-tight mb-2">Tối ưu hóa AI đang Hoạt động</h4>
            <p className="text-xs opacity-80 leading-relaxed">Độ chính xác nhận diện tăng 2,4% hôm nay sau bản cập nhật mô hình qua đêm.</p>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Trạng thái: Cao điểm</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
