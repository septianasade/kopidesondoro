import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StaffRole, User } from '../types';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Trash2, 
  Store, 
  UtensilsCrossed, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  onOpenPos: () => void;
  onOpenKitchen: () => void;
}

export const AdminStaffManagementView: React.FC<Props> = ({ onOpenPos, onOpenKitchen }) => {
  const { users, addUser, deleteUser, resetStaffPin } = useAuth();

  // State for Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<StaffRole>('CASHIER');
  const [newPin, setNewPin] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // State for Edit PIN Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editPinValue, setEditPinValue] = useState('');
  const [editPinError, setEditPinError] = useState<string | null>(null);

  // Masked PIN toggle map (userId -> boolean)
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const togglePinReveal = (userId: string) => {
    setRevealedPins((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newName.trim()) {
      setAddError('Nama staf wajib diisi.');
      return;
    }

    if (!/^\d{6}$/.test(newPin.trim())) {
      setAddError('PIN wajib tepat 6 digit angka.');
      return;
    }

    const res = addUser({
      name: newName,
      role: newRole,
      pin_code: newPin,
      email: newRole === 'ADMIN' ? newEmail : null,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setNewName('');
      setNewRole('CASHIER');
      setNewPin('');
      setNewEmail('');
    } else {
      setAddError(res.error || 'Gagal menambahkan staf.');
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setEditPinError(null);

    if (!editingUser) return;

    if (!/^\d{6}$/.test(editPinValue.trim())) {
      setEditPinError('PIN harus tepat 6 digit angka.');
      return;
    }

    const res = resetStaffPin(editingUser.id, editPinValue.trim());
    if (res.success) {
      setEditingUser(null);
      setEditPinValue('');
    } else {
      setEditPinError(res.error || 'Gagal mengubah PIN.');
    }
  };

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-1 bg-stone-900 text-[#FF4F00] border border-[#FF4F00] font-mono text-[10px] font-bold uppercase tracking-wider">
            ADMIN BACK-OFFICE
          </span>
        );
      case 'CASHIER':
        return (
          <span className="px-2.5 py-1 bg-[#233519] text-[#CCFF00] border border-[#CCFF00] font-mono text-[10px] font-bold uppercase tracking-wider">
            KASIR POS
          </span>
        );
      case 'KITCHEN':
        return (
          <span className="px-2.5 py-1 bg-[#3a2512] text-[#FF9900] border border-[#FF9900] font-mono text-[10px] font-bold uppercase tracking-wider">
            TIM DAPUR (KDS)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Supervisor Switchers */}
      <div className="bg-[#1c1c1c] border-2 border-stone-700 p-5 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-lg font-bold font-sans uppercase tracking-tight text-white">
              MANAJEMEN STAF & AKSES OPERASIONAL
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Kelola identitas staf toko, berikan 6 digit PIN unik per karyawan untuk login instan di mesin kasir & layar dapur.
          </p>
        </div>

        {/* Supervisor Quick Test Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPos}
            className="px-3.5 py-2 bg-[#233519] hover:bg-[#2e4720] border-2 border-[#CCFF00] text-[#CCFF00] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
            title="Buka tampilan kasir POS sebagai supervisor"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Buka Layar Kasir</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          <button
            onClick={onOpenKitchen}
            className="px-3.5 py-2 bg-[#3a2512] hover:bg-[#4d3218] border-2 border-[#FF9900] text-[#FF9900] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
            title="Buka tampilan dapur KDS sebagai supervisor"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Buka Layar Dapur</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:translate-y-0.5 cursor-pointer border-2 border-stone-900 shadow-[2px_2px_0px_#000000]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Staf Baru</span>
          </button>
        </div>
      </div>

      {/* Staff List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((staff) => {
          const isPinVisible = Boolean(revealedPins[staff.id]);
          return (
            <div
              key={staff.id}
              className="bg-[#1c1c1c] border-2 border-stone-700 shadow-[4px_4px_0px_#000000] p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Role & Status */}
                <div className="flex items-center justify-between mb-3">
                  {getRoleBadge(staff.role)}
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                      staff.is_active
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-stone-900 text-stone-500 border-stone-700'
                    }`}
                  >
                    {staff.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>

                {/* Staff Name */}
                <h3 className="text-base font-bold text-white font-sans tracking-tight">
                  {staff.name}
                </h3>
                {staff.email && (
                  <p className="text-xs text-stone-400 font-mono mt-0.5">{staff.email}</p>
                )}

                {/* PIN Code Box (Protected with reveal toggle) */}
                <div className="mt-4 p-3 bg-[#121212] border-2 border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-stone-500">
                      PIN AKSES (6 DIGIT)
                    </span>
                    <span className="font-mono text-base font-bold tracking-widest text-[#CCFF00]">
                      {isPinVisible ? staff.pin_code : '••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePinReveal(staff.id)}
                    className="p-1.5 text-stone-400 hover:text-white transition"
                    title={isPinVisible ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  >
                    {isPinVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setEditingUser(staff);
                    setEditPinValue('');
                    setEditPinError(null);
                  }}
                  className="flex-1 py-1.5 px-2 bg-[#2a2a2a] hover:bg-[#383838] border border-stone-600 text-stone-200 font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>Ubah PIN</span>
                </button>

                {staff.role !== 'ADMIN' && (
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus staf "${staff.name}"?`)) {
                        deleteUser(staff.id);
                      }
                    }}
                    className="p-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition"
                    title="Hapus Staf"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Tambah Staf Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStaff}
            className="w-full max-w-md bg-[#1c1c1c] border-2 border-stone-600 shadow-[8px_8px_0px_#000000] p-6 space-y-4"
          >
            <div className="border-b-2 border-stone-800 pb-3">
              <h3 className="text-base font-bold font-sans uppercase tracking-tight text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#CCFF00]" />
                <span>Tambah Staf Operasional Baru</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Akun staf menggunakan PIN 6 digit untuk login cepat di layar sentuh toko.
              </p>
            </div>

            {addError && (
              <div className="p-2.5 bg-rose-950 border border-rose-700 text-rose-200 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1">
                  Nama Lengkap Staf *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Barista / Doni Kasir"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#CCFF00] text-white px-3 py-2 font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1">
                  Peran (Role) *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as StaffRole)}
                  className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#CCFF00] text-white px-3 py-2 font-mono text-xs focus:outline-none"
                >
                  <option value="CASHIER">Kasir (Akses Terminal POS & Buka/Tutup Shift)</option>
                  <option value="KITCHEN">Tim Dapur (Akses KDS Antrean Pesanan)</option>
                  <option value="ADMIN">Admin Back-Office (Akses Penuh Manajemen)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1">
                  6-Digit PIN Unik *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Contoh: 445566"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#CCFF00] text-white px-3 py-2 font-mono text-base tracking-widest focus:outline-none"
                />
                <p className="text-[10px] font-mono text-stone-500 mt-1">
                  Wajib 6 digit angka tanpa huruf. Jangan bagikan PIN ke pihak luar.
                </p>
              </div>

              {newRole === 'ADMIN' && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1">
                    Email Login Admin *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@toko.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#CCFF00] text-white px-3 py-2 font-mono text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs uppercase"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-mono text-xs font-bold uppercase tracking-wider"
              >
                Simpan Staf
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Ubah PIN Staf */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleUpdatePin}
            className="w-full max-w-sm bg-[#1c1c1c] border-2 border-stone-600 shadow-[8px_8px_0px_#000000] p-6 space-y-4"
          >
            <div className="border-b-2 border-stone-800 pb-3">
              <h3 className="text-base font-bold font-sans uppercase tracking-tight text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#CCFF00]" />
                <span>Ubah 6-Digit PIN Staf</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Mengatur ulang PIN untuk <strong>{editingUser.name}</strong> ({editingUser.role})
              </p>
            </div>

            {editPinError && (
              <div className="p-2.5 bg-rose-950 border border-rose-700 text-rose-200 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{editPinError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1">
                PIN Baru (6 Digit Angka) *
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                placeholder="••••••"
                value={editPinValue}
                onChange={(e) => setEditPinValue(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#121212] border-2 border-stone-700 focus:border-[#CCFF00] text-white px-3 py-2 font-mono text-lg tracking-widest text-center focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs uppercase"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-[#121212] font-mono text-xs font-bold uppercase tracking-wider"
              >
                Perbarui PIN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
