import React from 'react';
import { ShieldCheck, ExternalLink, Mail, Globe } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onNavigateExplore: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onNavigateExplore }) => {
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);

  return (
    <footer className="border-t border-stone-200 bg-[#f7f5f0] text-stone-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                KD
              </div>
              <span className="text-base font-bold text-stone-900 tracking-tight">Konsisting Dream</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Platform kurasi dan persiapan kompetisi terintegrasi bagi siswa, mahasiswa, fresh graduate, dan masyarakat umum di Indonesia dan internasional.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Berbasis Dokumen & Juknis Resmi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Eksplorasi</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={onNavigateExplore} className="hover:text-stone-900 transition-colors">
                  Kompetisi Teknologi & AI
                </button>
              </li>
              <li>
                <button onClick={onNavigateExplore} className="hover:text-stone-900 transition-colors">
                  Olimpiade Sains (OSN/KNMIPA)
                </button>
              </li>
              <li>
                <button onClick={onNavigateExplore} className="hover:text-stone-900 transition-colors">
                  Business Case & Pitching
                </button>
              </li>
              <li>
                <button onClick={onNavigateExplore} className="hover:text-stone-900 transition-colors">
                  Seni, Desain UI/UX & Kriya
                </button>
              </li>
              <li>
                <button onClick={onNavigateExplore} className="hover:text-stone-900 transition-colors">
                  Debat & Bahasa (KDMI/NUDC)
                </button>
              </li>
            </ul>
          </div>

          {/* Official Verification Sources */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Sumber Kurasi Resmi</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Data dihimpun dari instansi penyelenggara terakreditasi:
            </p>
            <div className="text-xs text-stone-600 space-y-1">
              <div>• Pusat Prestasi Nasional (Puspresnas)</div>
              <div>• Balai Pengembangan Talenta Indonesia (BPTI)</div>
              <div>• Direktorat Belmawa Kemdiktisaintek</div>
              <div>• Portal Resmi Universitas Terkemuka</div>
              <div>• Federasi Olahraga & Organisasi Profesi</div>
            </div>
          </div>

          {/* Contact & Governance */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">Tata Kelola & Kontak</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>kurasi@konsistingdream.id</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <span>Jakarta & Bandung, Indonesia</span>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="hover:text-stone-900 underline text-stone-500"
                >
                  Kebijakan Privasi
                </button>
                <span>·</span>
                <button
                  onClick={() => setShowTerms(true)}
                  className="hover:text-stone-900 underline text-stone-500"
                >
                  Syarat Layanan
                </button>
                <span>·</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-700 font-medium text-stone-600"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Konsisting Dream. Menginspirasi talenta muda berprestasi di seluruh Indonesia.
          </div>
          <div className="text-stone-400 text-[11px]">
            Data kompetisi selalu diverifikasi dengan pedoman resmi. Konsisting Dream menghargai hak cipta penyelenggara.
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900">Kebijakan Privasi Konsisting Dream</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Konsisting Dream berkomitmen melindungi data pribadi pengguna. Pengisian kuis penemuan minat sebagai tamu (guest) disimpan secara lokal di peramban Anda dan tidak disebarluaskan ke pihak ketiga tanpa persetujuan.
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kami tidak memungut biaya terselubung ataupun mengomersialkan berkas proposal yang diunggah untuk analisis juknis AI. Seluruh pemrosesan dilakukan semata-mata untuk menghasilkan panduan persiapan kompetisi yang akurat.
            </p>
            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900">Syarat & Ketentuan Kurasi</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              1. Seluruh jadwal pendaftaran, persyaratan berkas, dan rubrik penjurian berasal dari dokumen petunjuk teknis resmi yang diterbitkan panitia penyelenggara.
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              2. Konsisting Dream AI memberikan saran taktis persiapan kompetisi yang berstatus sebagai panduan penunjang dan bukan merupakan keputusan dewan juri penyelenggara resmi.
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              3. Pengguna bertanggung jawab memastikan kesahihan berkas sebelum melakukan submisi final pada portal resmi masing-masing lomba.
            </p>
            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
