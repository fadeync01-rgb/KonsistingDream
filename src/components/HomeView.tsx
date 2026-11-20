import React from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Award, 
  FileText, 
  Layers, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Cpu,
  BookOpen,
  Palette,
  Users
} from 'lucide-react';
import { Competition, UserPreferences } from '../utils/recommendationEngine';
import { COMPETITION_CATEGORIES } from '../data/categories';

interface HomeViewProps {
  competitions: Competition[];
  onOpenQuiz: () => void;
  onNavigateExplore: (initialFilter?: { category?: string; query?: string }) => void;
  onSelectCompetition: (competition: Competition) => void;
  onPrepareCompetition: (competition: Competition) => void;
  userPreferences: UserPreferences | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  competitions,
  onOpenQuiz,
  onNavigateExplore,
  onSelectCompetition,
  onPrepareCompetition,
  userPreferences
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateExplore({ query: searchQuery });
  };

  const featured = competitions.slice(0, 4);
  const upcomingDeadlines = [...competitions]
    .filter(c => c.status === 'Open' || c.status === 'Upcoming')
    .sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              
              {/* Trust Tagline (No pill badge - clean typography) */}
              <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                <span className="text-amber-800 font-semibold">Konsisting Dream</span>
                <span aria-hidden="true">·</span>
                <span>Kurasi Resmi Puspresnas & Tingkat Dunia</span>
                <span aria-hidden="true">·</span>
                <span>Didukung AI Persiapan</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] text-balance">
                Temukan & persiapkan kompetisi yang tepat untuk <span className="text-stone-900 underline decoration-amber-400 decoration-4 underline-offset-4">potensimu</span>.
              </h1>

              {/* Description */}
              <p className="text-base text-stone-600 max-w-xl leading-relaxed">
                Tak perlu lagi tersesat di puluhan akun media sosial atau situs kampus yang terpisah. Konsisting Dream menghadirkan kompetisi terverifikasi di Indonesia dan internasional, disesuaikan dengan minat, jenjang, dan panduan persiapan dari asisten AI.
              </p>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl flex items-center gap-2 bg-white p-1.5 border border-stone-300 rounded-xl shadow-xs">
                <Search className="w-4 h-4 text-stone-400 ml-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kompetisi: GEMASTIK, OSN, Business Case, Desain..."
                  className="w-full text-xs sm:text-sm bg-transparent border-0 focus:outline-none text-stone-900 placeholder:text-stone-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                >
                  Cari
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={onOpenQuiz}
                  className="px-5 py-3 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Temukan Peluang Saya</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => onNavigateExplore()}
                  className="px-5 py-3 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-900 transition-colors"
                >
                  Jelajahi Semua Kompetisi
                </button>
              </div>

              {/* Trust Metadata */}
              <div className="pt-2 flex items-center gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tanpa biaya akun (Coba sebagai tamu)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Juknis & sumber resmi terakreditasi</span>
                </div>
              </div>

            </div>

            {/* Right Visual Column (Hero Image) */}
            <div className="lg:col-span-5 relative flex items-center">
              <div className="w-full h-full min-h-[340px] sm:min-h-[420px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative group bg-stone-100">
                <img
                  src="/src/assets/images/hero_student_achievers_1793882552607.jpg"
                  alt="Generasi muda berprestasi merayakan pencapaian kompetisi nasional"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs font-mono text-amber-300 mb-1">Panggung Talenta Nasional</div>
                  <h3 className="text-base font-bold text-white text-balance">
                    Dari ruang kelas hingga podium juara nasional & dunia.
                  </h3>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2">
                    Pelajari strategi jitu, pahami rubrik dewan juri, dan susun berkas persyaratan tanpa terlewat tenggat waktu.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PROOF STRIP (CLAIM-TO-PROOF ADJACENCY) */}
      <section className="border-y border-stone-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-700">
            <div>
              <div className="text-2xl font-extrabold text-stone-900 tabular-nums">16</div>
              <div className="text-xs text-stone-500 mt-0.5">Kategori Kompetisi Lengkap</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-stone-900 tabular-nums">100%</div>
              <div className="text-xs text-stone-500 mt-0.5">Verifikasi Sumber Asli Penyelenggara</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-stone-900 tabular-nums">4 Fase</div>
              <div className="text-xs text-stone-500 mt-0.5">Panduan Persiapan Terstruktur AI</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-stone-900 tabular-nums">Rp 500Jt+</div>
              <div className="text-xs text-stone-500 mt-0.5">Total Dana Pembinaan & Beasiswa</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED OPPORTUNITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-medium text-stone-500 mb-1">Kurasi Terverifikasi</div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Peluang Unggulan Bulan Ini</h2>
          </div>
          <button
            onClick={() => onNavigateExplore()}
            className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Lihat semua {competitions.length} kompetisi</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((comp) => (
            <div
              key={comp.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-400 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Cover */}
                <div className="h-40 bg-stone-100 overflow-hidden relative">
                  <img
                    src={comp.imageUrl || '/src/assets/images/feature_gemastik_tech_1793882552717.jpg'}
                    alt={comp.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
                    {comp.format}
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  {/* Clean unboxed metadata with separators */}
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 flex-wrap">
                    <span className="font-medium text-stone-700">{comp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{comp.scope}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">
                      {comp.isFree ? 'Gratis' : `Rp ${comp.registrationFeeIdr.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectCompetition(comp)}
                    className="text-sm font-bold text-stone-900 hover:text-amber-800 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {comp.name}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="pt-2 text-[11px] text-stone-600 flex items-center justify-between border-t border-stone-100">
                    <span className="truncate max-w-[140px] text-stone-500">
                      Oleh {comp.organiser}
                    </span>
                    <span className="font-mono tabular-nums text-stone-700 shrink-0">
                      Tenggat: {comp.registrationDeadline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => onSelectCompetition(comp)}
                  className="flex-1 py-1.5 px-3 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors text-center"
                >
                  Detail Juknis
                </button>
                <button
                  onClick={() => onPrepareCompetition(comp)}
                  className="py-1.5 px-3 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1"
                  title="Siapkan bersama Konsisting Dream AI"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Siapkan</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 4. UPCOMING DEADLINES TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="text-xs font-mono text-amber-400 mb-1">Prioritas Waktu Pendaftaran</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tenggat Waktu Pendaftaran Terdekat
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                Jangan lewatkan kesempatan. Dokumen administrasi dan surat rekomendasi kampus membutuhkan waktu penyusunan.
              </p>
            </div>
            <button
              onClick={() => onNavigateExplore()}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors whitespace-nowrap self-start md:self-auto"
            >
              Semua Jadwal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlines.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCompetition(c)}
                className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 hover:border-amber-400/50 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="truncate max-w-[160px]">{c.category}</span>
                  <span className="font-mono tabular-nums text-amber-400 font-semibold">{c.registrationDeadline}</span>
                </div>
                <h4 className="text-sm font-semibold text-white line-clamp-1">{c.name}</h4>
                <p className="text-xs text-stone-300 line-clamp-1">{c.organiser}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-700">
                  <span>Peserta: {c.eligibleEducation.join(', ')}</span>
                  <span className="text-stone-300 underline">Lihat &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 16 COMPETITION CATEGORIES (EXPANDABLE DIRECTORY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-medium text-stone-500 mb-1">Eksplorasi Minat & Talenta</div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">16 Kategori Kompetisi</h2>
          <p className="text-xs text-stone-600 mt-1 max-w-xl">
            Dari olimpiade sains murni, pengembangan perangkat lunak, studi kasus bisnis, hingga seni rupa dan kejuruan vokasi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPETITION_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="bg-white border border-stone-200 rounded-xl p-4 transition-all hover:border-stone-400 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-stone-900">{cat.name}</h3>
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                      className="text-stone-400 hover:text-stone-700 text-xs focus:outline-none"
                      aria-label={`Toggle subcategories for ${cat.name}`}
                    >
                      {isExpanded ? 'Tutup' : 'Rincian'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {cat.description}
                  </p>

                  {isExpanded && (
                    <div className="pt-3 border-t border-stone-100 space-y-1.5 animate-fadeIn">
                      <div className="text-[11px] font-semibold text-stone-700">Sub-bidang:</div>
                      <div className="flex flex-wrap gap-1">
                        {cat.subcategories.map(sub => (
                          <button
                            key={sub}
                            onClick={() => onNavigateExplore({ category: cat.name, query: sub })}
                            className="text-[11px] text-stone-600 bg-stone-50 hover:bg-stone-100 hover:text-stone-900 px-2 py-0.5 rounded transition-colors"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onNavigateExplore({ category: cat.name })}
                    className="text-stone-700 hover:text-stone-950 font-medium inline-flex items-center gap-1"
                  >
                    <span>Jelajahi kompetisi</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-stone-400 font-mono tabular-nums">
                    {cat.subcategories.length} bidang
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. HOW KONSISTING DREAM WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f5f3ec] rounded-2xl p-8 border border-stone-200">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-medium text-stone-500 mb-1">Alur Persiapan Mandiri</div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Bagaimana Konsisting Dream Bekerja</h2>
            <p className="text-xs text-stone-600 mt-1">
              Tiga langkah terstruktur membantu Anda beralih dari sekadar mencari info hingga siap bertanding di panggung kompetisi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="space-y-3 bg-white p-6 rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-base font-bold text-stone-900">Petakan Minat & Jenjangmu</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Jawab kuis penemuan minat terpadu tanpa kewajiban mendaftar akun terlebih dahulu. Sistem menganalisis keahlian, pengalaman, dan preferensi anggaran Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 bg-white p-6 rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-stone-900">Kurasi Juknis Terverifikasi</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Akses kompetisi resmi yang disaring berdasarkan kelayakan pendidikan dan kesesuaian minat. Setiap informasi dilengkapi bukti sumber asli dan status verifikasi terbuka.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 bg-white p-6 rounded-xl border border-stone-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-stone-900">Persiapan Terstruktur bersama AI</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Asisten Konsisting Dream AI membedah petunjuk teknis (handbook) menjadi 4 fase aksi: Riset, Pelajari, Siapkan, dan Kirim, lengkap dengan pengingat tenggat.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. OFFICIAL VERIFICATION COMMITMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-stone-200 rounded-2xl p-6 sm:p-8 bg-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Standar Integritas & Transparansi Data</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Komitmen Verifikasi Resmi Konsisting Dream
              </h2>
            </div>
            <div className="text-xs text-stone-500">
              5 Tingkat Status Verifikasi Terbuka
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
            Konsisting Dream berpegang teguh pada prinsip integritas akademik dan profesional. Kami tidak pernah memfabrikasi jadwal, nominal hadiah, ataupun kontak panitia. Apabila panitia resmi belum mengumumkan suatu informasi, kami secara transparan menandainya sebagai <em>"Belum diumumkan resmi"</em> atau <em>"Tidak dinyatakan oleh penyelenggara"</em>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950">
              <div className="font-semibold text-emerald-900">Officially Verified</div>
              <div className="text-[11px] text-emerald-800 mt-1">Divalidasi langsung dari SK, Juknis, atau portal resmi instansi.</div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
              <div className="font-semibold text-amber-900">Pending Review</div>
              <div className="text-[11px] text-amber-800 mt-1">Sedang dalam antrean kurasi tim verifikator independen.</div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950">
              <div className="font-semibold text-blue-900">Partially Verified</div>
              <div className="text-[11px] text-blue-800 mt-1">Informasi utama valid, rincian teknis menunggu surat edaran lanjutan.</div>
            </div>

            <div className="p-3 rounded-lg bg-stone-100 border border-stone-300 text-stone-800">
              <div className="font-semibold text-stone-900">Outdated</div>
              <div className="text-[11px] text-stone-600 mt-1">Tenggat telah berlalu atau periode kompetisi telah selesai.</div>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950">
              <div className="font-semibold text-rose-900">Unverified</div>
              <div className="text-[11px] text-rose-800 mt-1">Belum diverifikasi dari dokumen otoritatif penyelenggara.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Siap Menemukan Panggung Prestasimu?
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            Ikuti kuis 3 menit sebagai tamu untuk mendapatkan rekomendasi kompetisi yang 100% cocok dengan jenjang dan minat bakatmu.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onOpenQuiz}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Mulai Kuis Rekomendasi (Gratis)</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
