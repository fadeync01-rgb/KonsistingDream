import React from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  GraduationCap, 
  Compass, 
  Award, 
  Sliders, 
  UserPlus, 
  CheckCircle2,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { EducationLevel, ExperienceLevel, UserPreferences, Competition } from '../utils/recommendationEngine';
import { COMPETITION_CATEGORIES } from '../data/categories';
import { UserAccount } from '../types';

interface InterestQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (prefs: UserPreferences) => void;
  onRegisterAccount: (name: string, email: string, prefs: UserPreferences) => void;
  initialPreferences: UserPreferences | null;
  currentUser: UserAccount | null;
  competitions: Competition[];
  onSelectCompetition: (comp: Competition) => void;
}

export const InterestQuizModal: React.FC<InterestQuizModalProps> = ({
  isOpen,
  onClose,
  onSavePreferences,
  onRegisterAccount,
  initialPreferences,
  currentUser,
  competitions,
  onSelectCompetition
}) => {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1); // Step 5 is Personalized Results View

  // Step 1: Education & Demographics
  const [educationLevel, setEducationLevel] = React.useState<EducationLevel>(initialPreferences?.educationLevel || 'D3/D4/S1');
  const [gradeOrSemester, setGradeOrSemester] = React.useState(initialPreferences?.gradeOrSemester || 'Semester 4');
  const [age, setAge] = React.useState<number>(initialPreferences?.age || 20);
  const [country, setCountry] = React.useState(initialPreferences?.country || 'Indonesia');
  const [province, setProvince] = React.useState(initialPreferences?.province || 'DKI Jakarta');
  const [city, setCity] = React.useState(initialPreferences?.city || 'Jakarta');

  // Step 2: Categories & Subcategories
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    initialPreferences?.selectedCategories || ['Technology & Computer Science']
  );
  const [selectedSubcategories, setSelectedSubcategories] = React.useState<string[]>(
    initialPreferences?.selectedSubcategories || ['Software Development', 'Data Science', 'AI']
  );

  // Step 3: Experience & Past Records
  const [experienceLevel, setExperienceLevel] = React.useState<ExperienceLevel>(
    initialPreferences?.experienceLevel || 'Intermediate'
  );
  const [skillsList, setSkillsList] = React.useState<string[]>(['Problem Solving', 'Python / JavaScript', 'Public Speaking']);
  const [newSkillInput, setNewSkillInput] = React.useState('');
  const [previousAchievements, setPreviousAchievements] = React.useState(
    initialPreferences?.previousAchievements || 'Pernah mengikuti kompetisi esai tingkat provinsi & hackathon kampus.'
  );

  // Step 4: Preferences & Budget
  const [formatPreference, setFormatPreference] = React.useState<'All' | 'Online' | 'Offline' | 'Hybrid'>(
    initialPreferences?.formatPreference || 'All'
  );
  const [costPreference, setCostPreference] = React.useState<'All' | 'Free' | 'Paid'>(
    initialPreferences?.costPreference || 'Free'
  );
  const [scopePreference, setScopePreference] = React.useState<'All' | 'Local' | 'National' | 'International'>(
    initialPreferences?.scopePreference || 'National'
  );
  const [participationPreference, setParticipationPreference] = React.useState<'All' | 'Individu' | 'Tim'>(
    initialPreferences?.participationPreference || 'All'
  );
  const [weeklyHoursAvailable, setWeeklyHoursAvailable] = React.useState<number>(
    initialPreferences?.weeklyHoursAvailable || 10
  );
  const [budgetMaxIdr, setBudgetMaxIdr] = React.useState<number>(
    initialPreferences?.budgetMaxIdr || 150000
  );

  // Account creation state after quiz results
  const [accountName, setAccountName] = React.useState('');
  const [accountEmail, setAccountEmail] = React.useState('');
  const [accountCreatedSuccess, setAccountCreatedSuccess] = React.useState(false);

  if (!isOpen) return null;

  const currentPrefs: UserPreferences = {
    educationLevel,
    gradeOrSemester,
    age,
    country,
    province,
    city,
    selectedCategories,
    selectedSubcategories,
    experienceLevel,
    previousAchievements,
    formatPreference,
    costPreference,
    scopePreference,
    participationPreference,
    weeklyHoursAvailable,
    budgetMaxIdr
  };

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const toggleSubcategory = (sub: string) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skillsList.includes(newSkillInput.trim())) {
      setSkillsList([...skillsList, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleFinishQuiz = () => {
    onSavePreferences(currentPrefs);
    setStep(5); // Show results view
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !accountEmail) return;
    onRegisterAccount(accountName, accountEmail, currentPrefs);
    setAccountCreatedSuccess(true);
  };

  // Matched competitions for step 5
  const matchedCompetitions = competitions.filter(c => {
    const isCategoryMatch = selectedCategories.some(cat => cat.toLowerCase() === c.category.toLowerCase());
    const isEducationMatch = c.eligibleEducation.includes(educationLevel) || c.eligibleEducation.includes('Umum');
    return isCategoryMatch && isEducationMatch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Interest Discovery · Penemuan Minat
              </span>
              <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                Guest Mode
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5">
              {step === 5 ? 'Profil Minat & Rekomendasi Terpersonalisasi' : `Langkah ${step} dari 4: ${
                step === 1 ? 'Latar Belakang Pendidikan' :
                step === 2 ? 'Eksplorasi Minat & Kategori' :
                step === 3 ? 'Pengalaman & Portofolio' :
                'Preferensi Kompetisi & Anggaran'
              }`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            aria-label="Tutup kuis"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Only during steps 1-4) */}
        {step <= 4 && (
          <div className="w-full bg-stone-100 h-1 shrink-0">
            <div 
              className="bg-stone-900 h-1 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* STEP 1: Pendidikan & Domisili */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-2">
                  Jenjang Pendidikan Saat Ini <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(['SMP', 'SMA/SMK', 'D3/D4/S1', 'S2/S3', 'Fresh Graduate', 'Umum'] as EducationLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEducationLevel(lvl)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                        educationLevel === lvl 
                          ? 'border-stone-900 bg-stone-900 text-white font-medium shadow-xs' 
                          : 'border-stone-200 bg-white hover:border-stone-400 text-stone-700'
                      }`}
                    >
                      <span className="font-semibold">{lvl}</span>
                      <span className={`text-[10px] mt-1 ${educationLevel === lvl ? 'text-stone-300' : 'text-stone-400'}`}>
                        {lvl === 'SMP' ? 'Tingkat Menengah Pertama' :
                         lvl === 'SMA/SMK' ? 'Tingkat Menengah Atas/Kejuruan' :
                         lvl === 'D3/D4/S1' ? 'Sarjana / Diploma Terapan' :
                         lvl === 'Fresh Graduate' ? 'Lulusan 1-2 tahun terakhir' :
                         lvl === 'S2/S3' ? 'Pascasarjana' : 'Masyarakat luas'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Tingkat Kelas / Semester Saat Ini
                  </label>
                  <input
                    type="text"
                    value={gradeOrSemester}
                    onChange={(e) => setGradeOrSemester(e.target.value)}
                    placeholder="Contoh: Kelas 11, Semester 4, atau Baru Lulus"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Usia (Tahun)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
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
                    placeholder="Contoh: DKI Jakarta, Jawa Barat, Jawa Timur, dll."
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
                    placeholder="Contoh: Jakarta Selatan, Bandung, Surabaya, dll."
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Kategori Minat & Sub-bidang */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Pilih Kategori Kompetisi Utama (Bisa Lebih Dari Satu) <span className="text-rose-600">*</span>
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Pilih bidang yang membangkitkan rasa ingin tahu dan passion Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-stone-100 rounded-xl">
                  {COMPETITION_CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.name)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-medium'
                            : 'border-stone-200 hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategories picker based on selected categories */}
              {selectedCategories.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="block text-xs font-semibold text-stone-900">
                    Spesialisasi / Topik Minat Terkait:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                    {COMPETITION_CATEGORIES
                      .filter(c => selectedCategories.includes(c.name))
                      .flatMap(c => c.subcategories)
                      .slice(0, 24)
                      .map(sub => {
                        const isSubSelected = selectedSubcategories.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => toggleSubcategory(sub)}
                            className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                              isSubSelected
                                ? 'bg-stone-900 text-white border-stone-900 font-medium'
                                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Pengalaman, Keahlian & Portofolio */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-2">
                  Tingkat Pengalaman Berkompetisi Anda
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Experienced'] as ExperienceLevel[]).map(exp => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperienceLevel(exp)}
                      className={`p-3 rounded-xl border text-center text-xs transition-colors ${
                        experienceLevel === exp
                          ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                          : 'border-stone-200 hover:border-stone-400 text-stone-700'
                      }`}
                    >
                      {exp === 'Beginner' ? 'Pemula (0-1 kali)' :
                       exp === 'Intermediate' ? 'Menengah (2-3 kali)' :
                       exp === 'Advanced' ? 'Mahir (Sering Finalis)' : 'Berpengalaman (Langganan Juara)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills currently possessed */}
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Keahlian & Kemampuan yang Anda Kuasai Saat Ini (Skills)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skillsList.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-stone-100 text-stone-800 border border-stone-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-stone-400 hover:text-stone-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={addCustomSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Tambah keahlian (contoh: Figma, C++, Riset Kualitatif, Pitching)"
                    className="flex-1 text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg"
                  >
                    Tambah
                  </button>
                </form>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Riwayat Prestasi, Proyek, atau Sertifikasi Sebelumnya (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={previousAchievements}
                  onChange={(e) => setPreviousAchievements(e.target.value)}
                  placeholder="Ceritakan singkat lomba yang pernah Anda ikuti atau proyek yang dibanggakan..."
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Preferensi & Anggaran */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1.5">
                    Format Kegiatan yang Diminati
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['All', 'Online', 'Offline', 'Hybrid'] as const).map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setFormatPreference(fmt)}
                        className={`p-2 rounded-lg text-xs border text-center ${
                          formatPreference === fmt 
                            ? 'bg-stone-900 text-white font-medium border-stone-900' 
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {fmt === 'All' ? 'Semua Format' : fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1.5">
                    Biaya Pendaftaran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['All', 'Free', 'Paid'] as const).map(cost => (
                      <button
                        key={cost}
                        type="button"
                        onClick={() => setCostPreference(cost)}
                        className={`p-2 rounded-lg text-xs border text-center ${
                          costPreference === cost 
                            ? 'bg-stone-900 text-white font-medium border-stone-900' 
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {cost === 'All' ? 'Semua' : cost === 'Free' ? 'Gratis Saja' : 'Berbayar'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1.5">
                    Cakupan Wilayah
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['All', 'National', 'International', 'Local'] as const).map(scp => (
                      <button
                        key={scp}
                        type="button"
                        onClick={() => setScopePreference(scp)}
                        className={`p-2 rounded-lg text-xs border text-center ${
                          scopePreference === scp 
                            ? 'bg-stone-900 text-white font-medium border-stone-900' 
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {scp === 'All' ? 'Semua Tingkat' :
                         scp === 'National' ? 'Nasional' :
                         scp === 'International' ? 'Internasional' : 'Lokal / Daerah'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1.5">
                    Sistem Kepesertaan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['All', 'Individu', 'Tim'] as const).map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setParticipationPreference(pt)}
                        className={`p-2 rounded-lg text-xs border text-center ${
                          participationPreference === pt 
                            ? 'bg-stone-900 text-white font-medium border-stone-900' 
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        {pt === 'All' ? 'Semua' : pt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Waktu Persiapan yang Tersedia per Minggu: <span className="font-mono text-stone-900">{weeklyHoursAvailable} Jam</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="40"
                    step="1"
                    value={weeklyHoursAvailable}
                    onChange={(e) => setWeeklyHoursAvailable(Number(e.target.value))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                    <span>3 jam/minggu (Santai)</span>
                    <span>20 jam/minggu (Fokus)</span>
                    <span>40 jam (Intensif)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Maksimal Anggaran Pendaftaran: <span className="font-mono text-stone-900">Rp {budgetMaxIdr.toLocaleString('id-ID')}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={budgetMaxIdr}
                    onChange={(e) => setBudgetMaxIdr(Number(e.target.value))}
                    className="w-full accent-stone-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                    <span>Rp 0 (Hanya Gratis)</span>
                    <span>Rp 500rb</span>
                    <span>Rp 1jt+</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PERSONALISED INTEREST PROFILE & RECOMMENDATIONS */}
          {step === 5 && (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                      Ringkasan Profil Minat & Bakat
                    </span>
                    <h3 className="text-base font-bold text-stone-900">
                      {educationLevel} · {experienceLevel} Level
                    </h3>
                  </div>
                  <div className="text-xs text-stone-500 tabular-nums">
                    Domisili: {city}, {province}
                  </div>
                </div>

                {/* Clear separation: Keahlian vs Minat Utama vs Yang Ingin Dipelajari */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                  <div className="p-3 bg-white rounded-lg border border-stone-200">
                    <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-700" />
                      <span>Keahlian Saat Ini (Skills)</span>
                    </div>
                    <div className="text-stone-600 space-y-0.5 text-[11px]">
                      {skillsList.map(s => <div key={s}>• {s}</div>)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-stone-200">
                    <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-stone-800" />
                      <span>Minat Utama (Interests)</span>
                    </div>
                    <div className="text-stone-600 space-y-0.5 text-[11px]">
                      {selectedCategories.map(c => <div key={c}>• {c}</div>)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-stone-200">
                    <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Fokus Pengembangan</span>
                    </div>
                    <div className="text-stone-600 space-y-0.5 text-[11px]">
                      {selectedSubcategories.slice(0, 4).map(sub => <div key={sub}>• {sub}</div>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Competitions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900">
                    Rekomendasi Kompetisi yang Sesuai ({matchedCompetitions.length})
                  </h4>
                  <span className="text-xs text-stone-500">
                    Disaring berdasarkan jenjang {educationLevel}
                  </span>
                </div>

                {matchedCompetitions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                    Belum ada kompetisi yang cocok persis dengan kombinasi filter ini. Anda dapat menjelajahi seluruh kompetisi di halaman Jelajahi.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {matchedCompetitions.map(c => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-white border border-stone-200 rounded-xl hover:border-stone-400 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span className="font-medium text-stone-900">{c.category}</span>
                            <span>·</span>
                            <span>{c.scope}</span>
                            <span>·</span>
                            <span className="text-emerald-700 font-medium">
                              {c.isFree ? 'Gratis' : `Rp ${c.registrationFeeIdr.toLocaleString('id-ID')}`}
                            </span>
                          </div>
                          <h5 className="text-xs sm:text-sm font-bold text-stone-900">{c.name}</h5>
                          <div className="text-[11px] text-stone-500">
                            Penyelenggara: {c.organiser} · Batas: {c.registrationDeadline}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onSelectCompetition(c);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg whitespace-nowrap shrink-0 transition-colors"
                        >
                          Lihat Juknis
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seamless Account Creation Prompt (Preserves Quiz Progress!) */}
              {!currentUser || currentUser.isGuest ? (
                <div className="bg-stone-900 text-stone-100 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-amber-400" />
                        <span>Simpan Hasil & Buat Akun Anda</span>
                      </h4>
                      <p className="text-[11px] text-stone-300 mt-0.5">
                        Data kuis Anda akan otomatis tersimpan. Anda tidak perlu mengulang kuis di kemudian hari.
                      </p>
                    </div>
                  </div>

                  {accountCreatedSuccess ? (
                    <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Akun berhasil disimpan! Profil minat Anda telah terhubung.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <input
                        type="text"
                        required
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Nama Lengkap"
                        className="text-xs p-2 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="email"
                        required
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        placeholder="Alamat Email Kampus / Pribadi"
                        className="text-xs p-2 rounded-lg bg-stone-800 border border-stone-700 text-white placeholder:text-stone-400 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition-colors whitespace-nowrap"
                      >
                        Simpan Akun
                      </button>
                    </form>
                  )}
                </div>
              ) : null}

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-stone-200 flex items-center justify-between gap-3 bg-stone-50/70 shrink-0">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                onClick={() => setStep((step + 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : step === 4 ? (
              <button
                onClick={handleFinishQuiz}
                className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Lihat Rekomendasi Profil Saya</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Selesai & Tutup
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
