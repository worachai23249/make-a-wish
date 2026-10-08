import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditWishModal({ isOpen, onClose, wish, onSave }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'item',
    price: '',
    linkUrl: '',
    emoji: '🎁',
  });

  useEffect(() => {
    if (wish && isOpen) {
      setForm({
        title: wish.title || '',
        description: wish.description || '',
        category: wish.category || 'item',
        price: wish.price || '',
        linkUrl: wish.linkUrl || '',
        emoji: wish.emoji || '🎁',
      });
    }
  }, [wish, isOpen]);

  if (!isOpen || !wish) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(wish.id, form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-4 border-rose-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">แก้ไขความปรารถนา ✏️</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">หมวดหมู่</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'item', label: '🎁 สิ่งของ', emoji: '🎁' },
                { id: 'food', label: '🍜 อาหาร', emoji: '🍲' },
                { id: 'place', label: '📍 สถานที่', emoji: '🏖️' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.id, emoji: c.emoji })}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    form.category === c.id
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                      : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">สิ่งที่อยากได้</label>
            <input
              type="text"
              required
              placeholder="เช่น หูฟัง AirPods, ชาบูชิ, ทะเลพัทยา"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">ราคาโดยประมาณ (฿)</label>
              <input
                type="text"
                placeholder="เช่น 1,590"
                className="form-input text-xs"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">ลิงก์สินค้า / พิกัดร้าน</label>
              <input
                type="text"
                placeholder="https://..."
                className="form-input text-xs"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              placeholder="สี ไซส์ นัดวันไหน หรือสิ่งที่อยากบอก"
              className="form-input text-xs"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-xs font-bold mt-2">
            บันทึกการแก้ไข ✏️
          </button>
        </form>
      </div>
    </div>
  );
}
