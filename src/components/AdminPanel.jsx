import React from 'react';
import { Trash2, ShieldCheck } from 'lucide-react';

export default function AdminPanel({ stats, users, onDeleteUser, showToast }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">แผงควบคุมผู้ดูแลระบบ 👑</h1>
        <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
          Admin Privilege
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-bold text-stone-400">ผู้ใช้ทั้งหมด</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-rose-500">{stats.users}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-bold text-stone-400">ห้องความปรารถนา</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-pink-500">{stats.spaces}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-bold text-stone-400">ของขวัญทั้งหมด</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-amber-500">{stats.wishes}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-bold text-stone-400">ซื้อสำเร็จแล้ว</div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-emerald-500">
            {stats.fulfilledWishes}
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="glass-card rounded-3xl overflow-hidden p-6">
        <h3 className="font-bold text-base mb-4">รายชื่อผู้ใช้ทั้งหมดในระบบ</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-rose-500/10 text-stone-400 text-left">
                <th className="pb-3">ผู้ใช้</th>
                <th className="pb-3">อีเมล</th>
                <th className="pb-3">สิทธิ์</th>
                <th className="pb-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-500/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-rose-500/5">
                  <td className="py-3 font-bold flex items-center gap-2">
                    <span>{u.emoji}</span> {u.displayName} (@{u.username})
                  </td>
                  <td className="py-3 text-stone-500">{u.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => onDeleteUser(u.id, u.username)}
                        className="text-rose-500 hover:text-rose-700 p-1"
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
