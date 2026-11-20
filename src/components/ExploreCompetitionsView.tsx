import React from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { Competition, UserPreferences, calculateMatchScore } from '../utils/recommendationEngine';
import { COMPETITION_CATEGORIES } from '../data/categories';

interface ExploreCompetitionsViewProps {
  competitions: Competition[];
  userPreferences: UserPreferences | null;
  savedCompetitionIds: string[];
  onToggleBookmark: (comp: Competition) => void;
  onSelectCompetition: (comp: Competition) => void;
  onPrepareCompetition: (comp: Competition) => void;
  initialCategory?: string;
  initialQuery?: string;
}

export const ExploreCompetitionsView: React.FC<ExploreCompetitionsViewProps> = ({
  competitions,
  userPreferences,
  savedCompetitionIds,
  onToggleBookmark,
  onSelectCompetition,
  onPrepareCompetition,
  initialCategory,
  initialQuery
}) => {
  const [searchQuery, setSearchQuery] = React.useState(initialQuery || '');
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory || 'All');
  const [selectedEducation, setSelectedEducation] = React.useState<string>(userPreferences?.educationLevel || 'All');
  const [selectedFormat, setSelectedFormat] = React.useState<string>('All');
  const [selectedCost, setSelectedCost] = React.useState<string>('All');
  const [selectedScope, setSelectedScope] = React.useState<string>('All');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');
  const [sortBy, setSortBy] = React.useState<'relevance' | 'nearestDeadline' | 'latestAnnouncement'>('relevance');
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);
  const [filterOnlyEligible, setFilterOnlyEligible] = React.useState(false);

  // Compute matched metadata for each competition
  const processedCompetitions = React.useMemo(() => {
    return competitions.map(comp => {
      let matchInfo = null;
      if (userPreferences) {
        matchInfo = calculateMatchScore(userPreferences, comp);
      }
      return { comp, matchInfo };
    });
  }, [competitions, userPreferences]);

  // Filtering
  const filteredCompetitions = React.useMemo(() => {
    return processedCompetitions.filter(({ comp, matchInfo }) => {
      // Search query across name, organiser, subcategories, description, theme, location
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = comp.name.toLowerCase().includes(q) || comp.officialName.toLowerCase().includes(q);
        const inOrganiser = comp.organiser.toLowerCase().includes(q);
        const inCategory = comp.category.toLowerCase().includes(q);
        const inSubcats = comp.subcategories.some(s => s.toLowerCase().includes(q));
        const inLocation = comp.location.toLowerCase().includes(q);
        if (!inName && !inOrganiser && !inCategory && !inSubcats && !inLocation) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && comp.category !== selectedCategory) {
        return false;
      }

      // Education level
      if (selectedEducation !== 'All' && !comp.eligibleEducation.includes(selectedEducation as any) && !comp.eligibleEducation.includes('Umum')) {
        return false;
      }

      // Format
      if (selectedFormat !== 'All' && comp.format !== selectedFormat) {
        return false;
      }

      // Cost
      if (selectedCost === 'Free' && !comp.isFree) return false;
      if (selectedCost === 'Paid' && comp.isFree) return false;

      // Scope
      if (selectedScope !== 'All') {
        if (selectedScope === 'Nasional' && comp.scope !== 'Nasional') return false;
        if (selectedScope === 'Internasional' && comp.scope !== 'Internasional') return false;
        if (selectedScope === 'Lokal' && comp.scope !== 'Lokal') return false;
      }

      // Registration Status
      if (selectedStatus !== 'All' && comp.status !== selectedStatus) {
        return false;
      }

      // Only eligible toggle
      if (filterOnlyEligible && matchInfo && !matchInfo.isEligible) {
        return false;
      }

      return true;
    });
  }, [
    processedCompetitions,
    searchQuery,
    selectedCategory,
    selectedEducation,
    selectedFormat,
    selectedCost,
    selectedScope,
    selectedStatus,
    filterOnlyEligible
  ]);

  // Sorting
  const sortedCompetitions = React.useMemo(() => {
    return [...filteredCompetitions].sort((a, b) => {
      if (sortBy === 'relevance') {
        const scoreA = a.matchInfo?.matchScore || 0;
        const scoreB = b.matchInfo?.matchScore || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.comp.lastVerifiedDate).getTime() - new Date(a.comp.lastVerifiedDate).getTime();
      }
      if (sortBy === 'nearestDeadline') {
        return new Date(a.comp.registrationDeadline).getTime() - new Date(b.comp.registrationDeadline).getTime();
      }
      if (sortBy === 'latestAnnouncement') {
        return new Date(b.comp.lastVerifiedDate).getTime() - new Date(a.comp.lastVerifiedDate).getTime();
      }
      return 0;
    });
  }, [filteredCompetitions, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedEducation('All');
    setSelectedFormat('All');
    setSelectedCost('All');
    setSelectedScope('All');
    setSelectedStatus('All');
    setFilterOnlyEligible(false);
  };

  const getStatusBadgeStyle = (status: Competition['status']) => {
    switch (status) {
      case 'Open':
        return 'text-emerald-700 font-semibold';
      case 'Upcoming':
        return 'text-amber-700 font-semibold';
      case 'Closed':
        return 'text-stone-500 line-through';
      case 'Delayed':
        return 'text-orange-700 font-medium';
      case 'Cancelled':
        return 'text-rose-700 font-medium';
      case 'Unconfirmed':
      default:
        return 'text-stone-400 font-medium';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Jelajahi Kompetisi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Cari dan saring kompetisi terverifikasi dari Puspresnas, perguruan tinggi, dan organisasi resmi.
          </p>
        </div>

        {/* Global Search and Control Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama lomba, penyelenggara, topik keahlian, atau kota..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2.5 px-3 bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none"
            >
              <option value="relevance">Urutkan: Paling Relevan</option>
              <option value="nearestDeadline">Urutkan: Deadline Terdekat</option>
              <option value="latestAnnouncement">Urutkan: Pengumuman Terbaru</option>
            </select>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden px-3 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Results Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filter Sidebar */}
        <div className={`space-y-6 bg-white p-5 rounded-2xl border border-stone-200 ${
          showFiltersMobile ? 'block' : 'hidden lg:block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <span>Penyaring Lomba</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* User Match Toggle */}
          {userPreferences && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-amber-950">
                <input
                  type="checkbox"
                  checked={filterOnlyEligible}
                  onChange={(e) => setFilterOnlyEligible(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Hanya yang Memenuhi Syarat</span>
              </label>
              <p className="text-[11px] text-amber-800 leading-tight">
                Menyaring hanya lomba yang memenuhi jenjang pendidikan ({userPreferences.educationLevel}) dan usia Anda.
              </p>
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-900">
              Kategori Bidang
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
            >
              <option value="All">Semua Kategori (16 Bidang)</option>
              {COMPETITION_CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-900">
              Jenjang Pendidikan
            </label>
            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
            >
              <option value="All">Semua Jenjang</option>
              <option value="SMP">SMP / MTs</option>
              <option value="SMA/SMK">SMA / SMK / MA</option>
              <option value="D3/D4/S1">D3 / D4 / S1 (Sarjana)</option>
              <option value="S2/S3">S2 / S3 (Pascasarjana)</option>
              <option value="Fresh Graduate">Fresh Graduate</option>
              <option value="Umum">Umum / Terbuka</option>
            </select>
          </div>

          {/* Format (Online / Offline / Hybrid) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-900">
              Format Kegiatan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(['All', 'Online', 'Offline', 'Hybrid'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFormat(f)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition-colors ${
                    selectedFormat === f
                      ? 'bg-stone-900 text-white font-medium border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {f === 'All' ? 'Semua' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-900">
              Biaya Pendaftaran
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['All', 'Free', 'Paid'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCost(c)}
                  className={`py-1.5 px-1.5 text-xs rounded-lg border text-center transition-colors ${
                    selectedCost === c
                      ? 'bg-stone-900 text-white font-medium border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {c === 'All' ? 'Semua' : c === 'Free' ? 'Gratis' : 'Berbayar'}
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-900">
              Cakupan Wilayah
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
            >
              <option value="All">Semua Cakupan</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
              <option value="Lokal">Lokal / Wilayah</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-900">
              Status Pendaftaran
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
            >
              <option value="All">Semua Status</option>
              <option value="Open">Open (Pendaftaran Dibuka)</option>
              <option value="Upcoming">Upcoming (Segera Hadir)</option>
              <option value="Closed">Closed (Ditutup)</option>
              <option value="Delayed">Delayed (Ditunda)</option>
              <option value="Cancelled">Cancelled (Dibatalkan)</option>
              <option value="Unconfirmed">Unconfirmed (Belum Dikonfirmasi)</option>
            </select>
          </div>

        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-stone-600 px-1">
            <div>
              Menampilkan <span className="font-semibold text-stone-900 tabular-nums">{sortedCompetitions.length}</span> kompetisi
              {selectedCategory !== 'All' && <span> di kategori <span className="font-semibold text-stone-900">{selectedCategory}</span></span>}
            </div>
            {userPreferences && (
              <span className="text-amber-800 font-medium">
                Sesuai Profil: {userPreferences.educationLevel}
              </span>
            )}
          </div>

          {/* Empty State */}
          {sortedCompetitions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Tidak ada kompetisi yang cocok</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Coba sesuaikan kata kunci pencarian atau bersihkan filter jenjang dan kategori untuk melihat opsi lainnya.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            /* Competitions List Cards */
            <div className="space-y-4">
              {sortedCompetitions.map(({ comp, matchInfo }) => {
                const isSaved = savedCompetitionIds.includes(comp.id);
                return (
                  <div
                    key={comp.id}
                    className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-400 transition-all shadow-2xs space-y-3"
                  >
                    {/* Top Row: Category, Scope, Cost, Status, Bookmark */}
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                        <span className="font-medium text-stone-800">{comp.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{comp.scope}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium">
                          {comp.isFree ? 'Gratis' : `Rp ${comp.registrationFeeIdr.toLocaleString('id-ID')}`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={getStatusBadgeStyle(comp.status)}>
                          Status: {comp.status}
                        </span>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => onToggleBookmark(comp)}
                        className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                          isSaved 
                            ? 'bg-amber-50 border-amber-300 text-amber-800' 
                            : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900'
                        }`}
                        title={isSaved ? 'Hapus dari Peluang Saya' : 'Simpan ke Peluang Saya'}
                        aria-label={isSaved ? 'Hapus bookmark' : 'Simpan bookmark'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                      </button>
                    </div>

                    {/* Title and Organiser */}
                    <div>
                      <h3
                        onClick={() => onSelectCompetition(comp)}
                        className="text-base sm:text-lg font-bold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer"
                      >
                        {comp.name}
                      </h3>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Penyelenggara: <span className="font-medium text-stone-700">{comp.organiser}</span> ({comp.organiserType})
                      </div>
                    </div>

                    {/* Eligibility Summary & Format */}
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {comp.description}
                    </p>

                    {/* Match Score & Transparent Reasoning (if profile exists) */}
                    {matchInfo && (
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Kesesuaian Minat: {matchInfo.matchScore}%</span>
                          </span>
                          <span className={`text-[11px] font-medium ${matchInfo.isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {matchInfo.isEligible ? 'Memenuhi Syarat Resmi' : 'Perlu Cek Ulang Syarat'}
                          </span>
                        </div>
                        {matchInfo.matchReasons.length > 0 && (
                          <div className="text-[11px] text-stone-500">
                            Alasan: {matchInfo.matchReasons.join(' · ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Metadata & Actions */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 text-stone-500 text-[11px]">
                        <span>Peserta: {comp.eligibleEducation.join(', ')}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums text-stone-700">
                          Deadline: {comp.registrationDeadline}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectCompetition(comp)}
                          className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                          Rincian Juknis
                        </button>
                        <button
                          onClick={() => onPrepareCompetition(comp)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Siapkan Kompetisi</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
