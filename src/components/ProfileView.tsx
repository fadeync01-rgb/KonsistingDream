import React from 'react';
import { 
  User, 
  GraduationCap, 
  Compass, 
  Award, 
  Sliders, 
  Bell, 
  Save, 
  CheckCircle2, 
  Sparkles,
  Shield
} from 'lucide-react';
import { UserPreferences, EducationLevel, ExperienceLevel } from '../utils/recommendationEngine';
import { UserAccount } from '../types';
import { COMPETITION_CATEGORIES } from '../data/categories';

interface ProfileViewProps {
  user: UserAccount | null;
  preferences: UserPreferences | null;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onOpenQuiz: () => void;
  onOpenAdmin: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  preferences,
  onUpdatePreferences,
  onOpenQuiz,
  onOpenAdmin
}) => {
  const [eduLevel, setEduLevel] = React.useState<EducationLevel>(preferences?.educationLevel || 'D3/D4/S1');
  const [grade, setGrade] = React.useState(preferences?.gradeOrSemester || 'Semester 4');
  const [age, setAge] = React.useState<number>(preferences?.age || 20);
  const [province, setProvince] = React.useState(preferences?.province || 'DKI Jakarta');
  const [city, setCity] = React.useState(preferences?.city || 'Jakarta');
  const [expLevel, setExpLevel] = React.useState<ExperienceLevel>(preferences?.experienceLevel || 'Intermediate');
  const [weeklyHours, setWeeklyHours] = React.useState<number>(preferences?.weeklyHoursAvailable || 12);
  const [budgetMax, setBudgetMax] = React.useState<number>(preferences?.budgetMaxIdr || 200000);
  const [savedNotification, setSavedNotification] = React.useState(false);

  // Notification toggles
  const [notifyDeadlines, setNotifyDeadlines] = React.useState(true);
  const [notifyHandbookUpdates, setNotifyHandbookUpdates] = React.useState(true);
  const [notifyNewCompetitions, setNotifyNewCompetitions] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    const updated: UserPreferences = {
      ...preferences,
      educationLevel: eduLevel,
      gradeOrSemester: grade,
      age,
      province,
      city,
      experienceLevel: expLevel,
      weeklyHoursAvailable: weeklyHours,
      budgetMaxIdr: budgetMax
    };
    onUpdatePreferences(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Summary */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xl shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'KD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  {user?.name || 'Tamu Konsisting Dream'}
                </h1>
                <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-mono">
                  {user?.isGuest ? 'Mode Tamu' : 'Akun Terdaftar'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {user?.email || 'Profil tamu tersimpan di penyimpanan lokal peramban Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQuiz}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Ulang Kuis Minat</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl border border-stone-200 hover:bg-stone-50"
              title="Panel Verifikasi Admin"
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {savedNotification && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Perubahan profil berhasil disimpan! Rekomendasi otomatis diperbarui.</span>
          </div>
        )}
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            Kriteria Pendidikan & Preferensi Kompetisi
          </h2>
          <p className="text-xs text-stone-500">
            Ubah preferensi Anda sewaktu-waktu tanpa perlu mengulang kuis dari awal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Jenjang Pendidikan
            </label>
            <select
              value={eduLevel}
              onChange={(e) => setEduLevel(e.target.value as EducationLevel)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 focus:outline-none"
            >
              <option value="SMP">SMP / MTs</option>
              <option value="SMA/SMK">SMA / SMK / MA</option>
              <option value="D3/D4/S1">D3 / D4 / S1 (Sarjana)</option>
              <option value="S2/S3">S2 / S3 (Pascasarjana)</option>
              <option value="Fresh Graduate">Fresh Graduate</option>
              <option value="Umum">Umum / Terbuka</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Tingkat Kelas / Semester
            </label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Usia
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Provinsi Domisili
            </label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Kota / Kabupaten
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Waktu Persiapan per Minggu ({weeklyHours} Jam)
            </label>
            <input
              type="range"
              min="2"
              max="40"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-900 mb-1">
              Maksimal Anggaran Pendaftaran (Rp {budgetMax.toLocaleString('id-ID')})
            </label>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer"
            />
          </div>
        </div>

        {/* Selected Categories Display */}
        {preferences && preferences.selectedCategories.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-900">
              Kategori Minat Terdaftar:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {preferences.selectedCategories.map(c => (
                <span key={c} className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 text-xs">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan Profil</span>
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-stone-600" />
            <span>Preferensi Pemberitahuan & Notifikasi</span>
          </h2>
          <p className="text-xs text-stone-500">
            Sesuaikan peringatan tenggat waktu dan pembaharuan petunjuk teknis resmi.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-stone-900">Pengingat Tenggat Pendaftaran (H-7 & H-3)</div>
              <div className="text-[11px] text-stone-500">Kirim notifikasi menjelang batas waktu pengunggahan berkas resmi.</div>
            </div>
            <input
              type="checkbox"
              checked={notifyDeadlines}
              onChange={(e) => setNotifyDeadlines(e.target.checked)}
              className="rounded text-stone-900 focus:ring-stone-900"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-stone-900">Pembaruan Buku Panduan & Addendum Juknis</div>
              <div className="text-[11px] text-stone-500">Notifikasi saat penyelenggara merilis surat edaran baru atau revisi rubrik juri.</div>
            </div>
            <input
              type="checkbox"
              checked={notifyHandbookUpdates}
              onChange={(e) => setNotifyHandbookUpdates(e.target.checked)}
              className="rounded text-stone-900 focus:ring-stone-900"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-stone-900">Rekomendasi Kompetisi Baru yang Sesuai Minat</div>
              <div className="text-[11px] text-stone-500">Kirim pemberitahuan saat ada kompetisi resmi baru di bidang keahlian Anda.</div>
            </div>
            <input
              type="checkbox"
              checked={notifyNewCompetitions}
              onChange={(e) => setNotifyNewCompetitions(e.target.checked)}
              className="rounded text-stone-900 focus:ring-stone-900"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
