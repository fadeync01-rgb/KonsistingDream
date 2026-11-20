import React from 'react';
import { 
  Bookmark, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Trash2, 
  Search,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { Competition, OpportunityStatus } from '../utils/recommendationEngine';
import { UserOpportunity } from '../types';

interface MyOpportunitiesViewProps {
  opportunities: UserOpportunity[];
  competitions: Competition[];
  onUpdateStatus: (competitionId: string, status: OpportunityStatus) => void;
  onUpdateNotes: (competitionId: string, notes: string) => void;
  onRemoveOpportunity: (competitionId: string) => void;
  onSelectCompetition: (comp: Competition) => void;
  onPrepareCompetition: (comp: Competition) => void;
  onNavigateExplore: () => void;
}

export const MyOpportunitiesView: React.FC<MyOpportunitiesViewProps> = ({
  opportunities,
  competitions,
  onUpdateStatus,
  onUpdateNotes,
  onRemoveOpportunity,
  onSelectCompetition,
  onPrepareCompetition,
  onNavigateExplore
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingNotesId, setEditingNotesId] = React.useState<string | null>(null);
  const [tempNotes, setTempNotes] = React.useState('');

  const oppData = React.useMemo(() => {
    return opportunities.map(opp => {
      const comp = competitions.find(c => c.id === opp.competitionId);
      return { opp, comp };
    }).filter(item => item.comp !== undefined) as Array<{ opp: UserOpportunity; comp: Competition }>;
  }, [opportunities, competitions]);

  const filtered = React.useMemo(() => {
    return oppData.filter(({ opp, comp }) => {
      if (selectedStatusFilter !== 'All' && opp.status !== selectedStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return comp.name.toLowerCase().includes(q) || comp.organiser.toLowerCase().includes(q);
      }
      return true;
    });
  }, [oppData, selectedStatusFilter, searchQuery]);

  const startEditNotes = (compId: string, currentNotes?: string) => {
    setEditingNotesId(compId);
    setTempNotes(currentNotes || '');
  };

  const saveNotes = (compId: string) => {
    onUpdateNotes(compId, tempNotes);
    setEditingNotesId(null);
  };

  // Status mapping
  const statuses: OpportunityStatus[] = [
    'Saved',
    'Considering',
    'Preparing',
    'Registered',
    'Submitted',
    'Completed',
    'Dismissed'
  ];

  const getStatusLabel = (s: OpportunityStatus) => {
    switch (s) {
      case 'Saved': return 'Tersimpan';
      case 'Considering': return 'Mempertimbangkan';
      case 'Preparing': return 'Menyiapkan';
      case 'Registered': return 'Terdaftar';
      case 'Submitted': return 'Dikirim (Submit)';
      case 'Completed': return 'Selesai';
      case 'Dismissed': return 'Tidak Diteruskan';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Peluang Saya & Favorit
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Pantau status pendaftaran, tenggat waktu berkas, dan catatan persiapan pribadi Anda.
          </p>
        </div>

        <button
          onClick={onNavigateExplore}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors self-start sm:self-auto"
        >
          + Tambah Kompetisi Lain
        </button>
      </div>

      {/* Pipeline Status Summary Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <button
          onClick={() => setSelectedStatusFilter('All')}
          className={`p-3 rounded-xl border text-left text-xs transition-colors ${
            selectedStatusFilter === 'All'
              ? 'bg-stone-900 text-white font-semibold border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
          }`}
        >
          <div className="text-[10px] opacity-75">Semua</div>
          <div className="text-base font-extrabold tabular-nums mt-0.5">{oppData.length}</div>
        </button>

        {statuses.map(st => {
          const count = oppData.filter(o => o.opp.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                selectedStatusFilter === st
                  ? 'bg-stone-900 text-white font-semibold border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="text-[10px] opacity-75 truncate">{getStatusLabel(st)}</div>
              <div className="text-base font-extrabold tabular-nums mt-0.5">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam daftar tersimpan..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
          />
        </div>
      </div>

      {/* List of Saved Opportunities */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Belum Ada Kompetisi Tersimpan</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Simpan kompetisi yang menarik dari halaman Jelajahi untuk melacak tenggat dan menyusun rencana persiapan.
          </p>
          <button
            onClick={onNavigateExplore}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium"
          >
            Jelajahi Kompetisi Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ opp, comp }) => (
            <div
              key={opp.competitionId}
              className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500 flex-wrap">
                    <span className="font-medium text-stone-800">{comp.category}</span>
                    <span>·</span>
                    <span>{comp.format}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums text-stone-700">
                      Tenggat: {comp.registrationDeadline}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectCompetition(comp)}
                    className="text-base font-bold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer"
                  >
                    {comp.name}
                  </h3>

                  <div className="text-xs text-stone-500">
                    Oleh {comp.organiser} · Status Pendaftaran: {comp.status}
                  </div>
                </div>

                {/* Pipeline Status Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] text-stone-400">Status:</label>
                  <select
                    value={opp.status}
                    onChange={(e) => onUpdateStatus(comp.id, e.target.value as OpportunityStatus)}
                    className="text-xs py-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium focus:outline-none"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{getStatusLabel(st)}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => onRemoveOpportunity(comp.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Hapus dari daftar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Personal Notes Section */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-900">
                  <span>Catatan Persiapan Pribadi:</span>
                  {editingNotesId !== comp.id && (
                    <button
                      onClick={() => startEditNotes(comp.id, opp.personalNotes)}
                      className="text-stone-500 hover:text-stone-900 flex items-center gap-1 font-normal"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{opp.personalNotes ? 'Ubah' : 'Tulis Catatan'}</span>
                    </button>
                  )}
                </div>

                {editingNotesId === comp.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Tulis catatan (misal: perlu menghubungi dosen pembimbing, butuh anggota tim frontend)..."
                      className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-2.5 py-1 text-xs text-stone-600"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => saveNotes(comp.id)}
                        className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-medium"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-600 italic">
                    {opp.personalNotes || 'Belum ada catatan khusus.'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-stone-500">
                  Ditambahkan pada {opp.savedAt}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCompetition(comp)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium transition-colors"
                  >
                    Buka Panduan
                  </button>

                  <button
                    onClick={() => onPrepareCompetition(comp)}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Buka Konsisting Dream AI</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
