import React from 'react';
import { Trash2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminPanel({ stats, users, onDeleteUser, showToast }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          แผงควบคุมผู้ดูแลระบบ 👑
        </h1>
        <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3.5 py-1 rounded-full border border-amber-400/30">
          Admin Privilege ✦
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-[24px] border-sky-200/50 dark:border-sky-500/20">
          <div className="text-xs font-bold text-slate-400">ผู้ใช้ทั้งหมด</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-sky-600 dark:text-sky-400">{stats.users}</div>
        </div>
        <div className="glass-card p-5 rounded-[24px] border-sky-200/50 dark:border-sky-500/20">
          <div className="text-xs font-bold text-slate-400">ห้องความปรารถนา</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">{stats.spaces}</div>
        </div>
        <div className="glass-card p-5 rounded-[24px] border-sky-200/50 dark:border-sky-500/20">
          <div className="text-xs font-bold text-slate-400">ของขวัญทั้งหมด</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">{stats.wishes}</div>
        </div>
        <div className="glass-card p-5 rounded-[24px] border-sky-200/50 dark:border-sky-500/20">
          <div className="text-xs font-bold text-slate-400">มอบสำเร็จแล้ว</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
            {stats.fulfilledWishes}
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="glass-card rounded-[32px] overflow-hidden p-6 sm:p-7 border-sky-200/50 dark:border-sky-500/20">
        <h3 className="font-bold text-base mb-4 text-slate-900 dark:text-slate-100">รายชื่อผู้ใช้ทั้งหมดในระบบ</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-sky-300/20 dark:border-sky-500/15 text-slate-400 text-left">
                <th className="pb-3.5 font-bold">ผู้ใช้</th>
                <th className="pb-3.5 font-bold">อีเมล</th>
                <th className="pb-3.5 font-bold">สิทธิ์</th>
                <th className="pb-3.5 text-right font-bold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-300/15 dark:divide-sky-500/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-sky-500/5 transition-colors">
                  <td className="py-3.5 font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="text-lg">{u.emoji}</span> {u.displayName} (@{u.username})
                  </td>
                  <td className="py-3.5 text-slate-500">{u.email}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/20'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => onDeleteUser(u.id, u.username)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors rounded-lg"
                        title="ลบผู้ใช้"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
