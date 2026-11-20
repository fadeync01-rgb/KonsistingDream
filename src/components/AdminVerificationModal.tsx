import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Plus, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  FileCheck, 
  Clock, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { Competition, VerifiedStatus } from '../utils/recommendationEngine';
import { COMPETITION_CATEGORIES, CategoryDefinition } from '../data/categories';

interface AdminVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitions: Competition[];
  onAddCompetition: (comp: Competition) => void;
  onUpdateCompetition: (comp: Competition) => void;
  onDeleteCompetition: (id: string) => void;
}

export const AdminVerificationModal: React.FC<AdminVerificationModalProps> = ({
  isOpen,
  onClose,
  competitions,
  onAddCompetition,
  onUpdateCompetition,
  onDeleteCompetition
}) => {
  const [activeAdminTab, setActiveAdminTab] = React.useState<'list' | 'add' | 'audit'>('list');
  const [auditLogs, setAuditLogs] = React.useState<Array<{ timestamp: string; action: string; target: string; admin: string }>>([
    {
      timestamp: '2025-04-12 14:30',
      action: 'Verifikasi Resmi Juknis',
      target: 'GEMASTIK XVIII (BPTI Kemdiktisaintek)',
      admin: 'Kurator Otoritatif Puspresnas'
    },
    {
      timestamp: '2025-04-10 09:15',
      action: 'Validasi Tanggal Pendaftaran',
      target: 'OSN Tingkat Nasional 2025',
      admin: 'Tim Verifikator Kemendikdasmen'
    },
    {
      timestamp: '2025-04-08 16:45',
      action: 'Pembaruan Dokumen Persyaratan',
      target: 'BCA Business Case Challenge',
      admin: 'Partner Kurasi Industri'
    }
  ]);

  // Form state for adding new competition
  const [formName, setFormName] = React.useState('');
  const [formOfficialName, setFormOfficialName] = React.useState('');
  const [formOrganiser, setFormOrganiser] = React.useState('');
  const [formCategory, setFormCategory] = React.useState('Technology & Computer Science');
  const [formFormat, setFormFormat] = React.useState<'Online' | 'Offline' | 'Hybrid'>('Hybrid');
  const [formScope, setFormScope] = React.useState<'Lokal' | 'Nasional' | 'Internasional'>('Nasional');
  const [formRegistrationDeadline, setFormRegistrationDeadline] = React.useState('2025-08-30');
  const [formEventDate, setFormEventDate] = React.useState('2025-09-20');
  const [formSourceUrl, setFormSourceUrl] = React.useState('');
  const [formVerifiedStatus, setFormVerifiedStatus] = React.useState<VerifiedStatus>('Officially Verified');
  const [formIsFree, setFormIsFree] = React.useState(true);
  const [formFee, setFormFee] = React.useState(0);
  const [formDescription, setFormDescription] = React.useState('');

  if (!isOpen) return null;

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formOrganiser || !formSourceUrl) return;

    const newComp: Competition = {
      id: `admin-comp-${Date.now()}`,
      name: formName,
      officialName: formOfficialName || formName,
      organiser: formOrganiser,
      organiserType: 'Pemerintah / Puspresnas',
      category: formCategory,
      subcategories: ['Umum', 'Inovasi'],
      eligibleEducation: ['D3/D4/S1', 'SMA/SMK'],
      format: formFormat,
      scope: formScope,
      participationType: 'Individu atau Tim',
      location: 'Sesuai Juknis Penyelenggara',
      registrationFeeIdr: formIsFree ? 0 : formFee,
      isFree: formIsFree,
      registrationStart: new Date().toISOString().split('T')[0],
      registrationDeadline: formRegistrationDeadline,
      eventDate: formEventDate,
      status: 'Open',
      verifiedStatus: formVerifiedStatus,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      sourceUrl: formSourceUrl,
      sourceType: 'Surat Keputusan / Juknis Resmi',
      registrationUrl: formSourceUrl,
      contactEmail: 'panitia@resmi.id',
      contactWebsite: formSourceUrl,
      prizesSummary: 'Sesuai edaran resmi panitia.',
      description: formDescription || 'Kompetisi resmi terverifikasi melalui konsol kurasi.',
      judgingCriteria: ['Kualitas Substansi (50%)', 'Presentasi (50%)'],
      requiredDocuments: ['Kartu Identitas Aktif', 'Naskah Karya PDF'],
      submissionGuidelines: 'Format berkas diunggah melalui formulir resmi.',
      isDemoData: false
    };

    onAddCompetition(newComp);
    setAuditLogs([
      {
        timestamp: new Date().toLocaleString('id-ID'),
        action: `Publikasi Kompetisi Baru (${formVerifiedStatus})`,
        target: formName,
        admin: 'Admin Konsisting Dream'
      },
      ...auditLogs
    ]);

    // Reset form
    setFormName('');
    setFormOrganiser('');
    setFormSourceUrl('');
    setFormDescription('');
    setActiveAdminTab('list');
  };

  const updateStatus = (comp: Competition, newStatus: VerifiedStatus) => {
    const updated = { ...comp, verifiedStatus: newStatus, lastVerifiedDate: new Date().toISOString().split('T')[0] };
    onUpdateCompetition(updated);
    setAuditLogs([
      {
        timestamp: new Date().toLocaleString('id-ID'),
        action: `Ubah Status Verifikasi -> ${newStatus}`,
        target: comp.name,
        admin: 'Admin Konsisting Dream'
      },
      ...auditLogs
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Panel Admin & Verifikasi Kurasi Resmi
              </h2>
              <p className="text-xs text-stone-300">
                Pemeriksaan juknis, manajemen kategori, transparansi sumber, dan riwayat audit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-stone-100 border-b border-stone-200 text-xs shrink-0">
          <button
            onClick={() => setActiveAdminTab('list')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors ${
              activeAdminTab === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Daftar Kompetisi ({competitions.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('add')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1 ${
              activeAdminTab === 'add' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kompetisi Terverifikasi</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors ${
              activeAdminTab === 'audit' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Riwayat Audit Verifikasi ({auditLogs.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* TAB 1: LIST & VERIFY ACTIONS */}
          {activeAdminTab === 'list' && (
            <div className="space-y-4">
              <div className="text-xs text-stone-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <strong>Kebijakan Integritas:</strong> Seluruh kompetisi yang ditandai <em>"Officially Verified"</em> wajib memiliki tautan surat keputusan (SK), juknis resmi berstempel, atau laman domain resmi pemerintah/universitas.
              </div>

              <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden bg-white">
                {competitions.map((comp) => (
                  <div key={comp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-stone-900">{comp.name}</span>
                        {comp.isDemoData && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 rounded font-mono">
                            DEMO
                          </span>
                        )}
                        <span className="text-stone-400">·</span>
                        <span className="text-stone-500">{comp.category}</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Penyelenggara: {comp.organiser} · Sumber: {comp.sourceType}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Batas: {comp.registrationDeadline} · Verifikasi Terakhir: {comp.lastVerifiedDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={comp.verifiedStatus}
                        onChange={(e) => updateStatus(comp, e.target.value as VerifiedStatus)}
                        className="text-xs py-1.5 px-2.5 bg-white border border-stone-300 rounded-lg text-stone-800 font-medium focus:outline-none"
                      >
                        <option value="Officially Verified">Officially Verified</option>
                        <option value="Partially Verified">Partially Verified</option>
                        <option value="Pending">Pending Review</option>
                        <option value="Outdated">Outdated</option>
                        <option value="Unverified">Unverified</option>
                      </select>

                      <button
                        onClick={() => onDeleteCompetition(comp.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                        title="Hapus kompetisi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW VERIFIED COMPETITION */}
          {activeAdminTab === 'add' && (
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Nama Kompetisi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: KNMIPA 2025"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Nama Resmi Kepanitiaan
                  </label>
                  <input
                    type="text"
                    value={formOfficialName}
                    onChange={(e) => setFormOfficialName(e.target.value)}
                    placeholder="Contoh: Kompetisi Nasional Matematika dan Ilmu Pengetahuan Alam"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Instansi Penyelenggara Resmi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formOrganiser}
                    onChange={(e) => setFormOrganiser(e.target.value)}
                    placeholder="Contoh: Balai Pengembangan Talenta Indonesia (BPTI)"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Kategori Utama
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                  >
                    {COMPETITION_CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">Format</label>
                  <select
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">Cakupan</label>
                  <select
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Lokal">Lokal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">Status Verifikasi</label>
                  <select
                    value={formVerifiedStatus}
                    onChange={(e) => setFormVerifiedStatus(e.target.value as VerifiedStatus)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none"
                  >
                    <option value="Officially Verified">Officially Verified</option>
                    <option value="Partially Verified">Partially Verified</option>
                    <option value="Pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Tenggat Pendaftaran Resmi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formRegistrationDeadline}
                    onChange={(e) => setFormRegistrationDeadline(e.target.value)}
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-900 mb-1">
                    Tautan Dokumen Sumber Resmi (Juknis/SK) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formSourceUrl}
                    onChange={(e) => setFormSourceUrl(e.target.value)}
                    placeholder="https://puspresnas.kemdikbud.go.id/pedoman.pdf"
                    className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Deskripsi & Cakupan Lomba
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ringkasan objektif kompetisi, kriteria utama dan tahapan..."
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('list')}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Publikasikan Kompetisi
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeAdminTab === 'audit' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900">
                Log Audit Aktivitas Verifikasi Kurasi
              </h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl bg-white text-xs">
                {auditLogs.map((log, i) => (
                  <div key={i} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-stone-900">{log.action}</div>
                      <div className="text-stone-500 mt-0.5">Target: {log.target}</div>
                    </div>
                    <div className="text-[11px] text-stone-400 sm:text-right">
                      <div>{log.admin}</div>
                      <div className="font-mono tabular-nums">{log.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium"
          >
            Tutup Panel
          </button>
        </div>

      </div>
    </div>
  );
};
