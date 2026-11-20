import React from 'react';
import { 
  X, 
  Sparkles, 
  Bookmark, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Mail, 
  Globe, 
  MapPin, 
  Users, 
  Clock,
  Share2
} from 'lucide-react';
import { Competition, UserPreferences, checkEligibility } from '../utils/recommendationEngine';

interface CompetitionDetailModalProps {
  competition: Competition | null;
  onClose: () => void;
  onPrepare: (comp: Competition) => void;
  onToggleBookmark: (comp: Competition) => void;
  isSaved: boolean;
  userPreferences: UserPreferences | null;
}

export const CompetitionDetailModal: React.FC<CompetitionDetailModalProps> = ({
  competition,
  onClose,
  onPrepare,
  onToggleBookmark,
  isSaved,
  userPreferences
}) => {
  if (!competition) return null;

  const eligibility = userPreferences ? checkEligibility(userPreferences, competition) : null;

  const getVerifiedBadge = (status: Competition['verifiedStatus']) => {
    switch (status) {
      case 'Officially Verified':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Officially Verified</span>
          </span>
        );
      case 'Partially Verified':
        return (
          <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Partially Verified</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      case 'Outdated':
        return (
          <span className="inline-flex items-center gap-1 text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-0.5 rounded text-xs font-semibold">
            <span>Outdated</span>
          </span>
        );
      case 'Unverified':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Unverified</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-start justify-between gap-4 bg-stone-50/70 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getVerifiedBadge(competition.verifiedStatus)}
              <span className="text-xs text-stone-500">
                Terakhir diverifikasi: <span className="font-mono">{competition.lastVerifiedDate}</span>
              </span>
              {competition.isDemoData && (
                <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                  [Simulasi Demo Data]
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-stone-900 leading-tight">
              {competition.name}
            </h2>
            <div className="text-xs text-stone-600">
              {competition.officialName}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(competition)}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
              title={isSaved ? 'Hapus bookmark' : 'Simpan ke Peluang Saya'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              aria-label="Tutup rincian"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 text-stone-800 text-xs sm:text-sm">
          
          {/* Eligibility Alert (if user has profile) */}
          {eligibility && (
            <div className={`p-3.5 rounded-xl border ${
              eligibility.isEligible 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
              <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                {eligibility.isEligible ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {eligibility.isEligible 
                    ? `Anda Memenuhi Syarat Resmi (${userPreferences?.educationLevel})` 
                    : `Perhatian Terhadap Syarat Peserta`}
                </span>
              </div>
              <div className="text-[11px] space-y-0.5">
                {eligibility.reasons.map((r, i) => <div key={i}>• {r}</div>)}
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <div className="text-[11px] text-stone-500">Penyelenggara</div>
              <div className="font-semibold text-stone-900 mt-0.5 line-clamp-1">{competition.organiser}</div>
              <div className="text-[10px] text-stone-400">{competition.organiserType}</div>
            </div>

            <div>
              <div className="text-[11px] text-stone-500">Format & Cakupan</div>
              <div className="font-semibold text-stone-900 mt-0.5">{competition.format}</div>
              <div className="text-[10px] text-stone-400">Tingkat {competition.scope}</div>
            </div>

            <div>
              <div className="text-[11px] text-stone-500">Biaya Pendaftaran</div>
              <div className="font-semibold text-stone-900 mt-0.5">
                {competition.isFree ? '100% Gratis' : `Rp ${competition.registrationFeeIdr.toLocaleString('id-ID')}`}
              </div>
              <div className="text-[10px] text-stone-400">
                {competition.isFree ? 'Didanai Pemerintah/Penyelenggara' : 'Sesuai Juknis'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-stone-500">Batas Akhir (Deadline)</div>
              <div className="font-semibold font-mono text-stone-900 mt-0.5">
                {competition.registrationDeadline}
              </div>
              <div className="text-[10px] text-amber-700 font-medium">
                Pelaksanaan: {competition.eventDate}
              </div>
            </div>
          </div>

          {/* Description & Theme */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Deskripsi & Tema Resmi
            </h3>
            {competition.theme && (
              <div className="p-3 rounded-lg bg-stone-100 text-stone-800 text-xs italic">
                "{competition.theme}"
              </div>
            )}
            <p className="text-xs leading-relaxed text-stone-600">
              {competition.description}
            </p>
          </div>

          {/* Judging Criteria */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Kriteria Penilaian Resmi Dewan Juri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {competition.judgingCriteria.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-700 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents & Submission Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Dokumen Wajib Peserta
              </h3>
              <div className="space-y-1.5">
                {competition.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                    <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Panduan Pengunggahan Submisi
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
                {competition.submissionGuidelines}
              </p>
            </div>
          </div>

          {/* Prizes & Awards */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Apresiasi, Hadiah & Rekognisi</span>
            </h3>
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed">
              {competition.prizesSummary || 'Belum diumumkan resmi oleh penyelenggara.'}
            </div>
          </div>

          {/* Verification Source Details (No Fabricated Data Commitment) */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
            <h4 className="text-xs font-bold text-stone-900">
              Metadata Verifikasi & Sumber Otoritatif
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
              <div>
                <span className="text-stone-400">Jenis Dokumen Sumber:</span>{' '}
                <span className="font-medium text-stone-800">{competition.sourceType}</span>
              </div>
              <div>
                <span className="text-stone-400">Status Verifikasi:</span>{' '}
                <span className="font-medium text-stone-800">{competition.verifiedStatus}</span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <span className="text-stone-400 shrink-0">Tautan Resmi:</span>
                <a
                  href={competition.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-900 underline truncate hover:text-amber-800 inline-flex items-center gap-1"
                >
                  <span className="truncate">{competition.sourceUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Public Official Contact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-900">
              Kontak Resmi Penyelenggara
            </h4>
            <div className="flex flex-wrap gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-mono">{competition.contactEmail}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <a href={competition.contactWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {competition.contactWebsite}
                </a>
              </div>
              {competition.contactSocialMedia && (
                <div className="text-stone-500">
                  {competition.contactSocialMedia}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/70 shrink-0">
          <div className="text-xs text-stone-500">
            Tenggat Pendaftaran: <span className="font-mono font-semibold text-stone-900">{competition.registrationDeadline}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={competition.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors text-center inline-flex items-center justify-center gap-1.5"
            >
              <span>Portal Registrasi</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => {
                onClose();
                onPrepare(competition);
              }}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Siapkan Kompetisi Ini</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
