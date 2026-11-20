import { Competition } from './recommendationEngine';

export interface PreparationTask {
  id: string;
  phase: 'Research' | 'Learn' | 'Prepare' | 'Submit';
  phaseLabel: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOfficialRequirement: boolean;
  importanceReason: string;
  recommendedDueDate?: string;
  notes?: string;
}

export interface TimelineMilestone {
  weekNumber: number;
  title: string;
  focus: string;
  targetDaysRemaining: number;
  tasks: string[];
}

/**
 * Generates structured 4-phase preparation tasks tailored to competition category & requirements
 */
export function generatePreparationPlan(competition: Competition): { tasks: PreparationTask[]; timeline: TimelineMilestone[] } {
  const isTech = competition.category.toLowerCase().includes('technology') || competition.category.toLowerCase().includes('computer');
  const isBusiness = competition.category.toLowerCase().includes('business') || competition.category.toLowerCase().includes('entrepreneurship');
  const isScience = competition.category.toLowerCase().includes('academic') || competition.category.toLowerCase().includes('science');
  const isCreative = competition.category.toLowerCase().includes('design') || competition.category.toLowerCase().includes('visual') || competition.category.toLowerCase().includes('writing');

  const tasks: PreparationTask[] = [
    // 1. Research Phase
    {
      id: `${competition.id}-res-1`,
      phase: 'Research',
      phaseLabel: 'Riset & Pahami Pedoman',
      title: 'Kaji Juknis Resmi & Rubrik Penilaian',
      description: `Unduh dan baca panduan lengkap penyelenggara (${competition.organiser}). Soroti bobot kriteria: ${competition.judgingCriteria.slice(0, 2).join(', ')}.`,
      isCompleted: false,
      isOfficialRequirement: true,
      importanceReason: 'Memastikan karya tidak gugur seleksi berkas administrasi dan poin penilaian maksimal.',
      recommendedDueDate: 'H-30 Deadline'
    },
    {
      id: `${competition.id}-res-2`,
      phase: 'Research',
      phaseLabel: 'Riset & Pahami Pedoman',
      title: 'Analisis Juara Tahun Sebelumnya (Benchmarking)',
      description: 'Cari karya atau profil tim pemenang edisi lalu untuk mengidentifikasi standar inovasi dan struktur presentasi.',
      isCompleted: false,
      isOfficialRequirement: false,
      importanceReason: 'Membantu menetapkan batas minimum kualitas dan menghindari ide klise.',
      recommendedDueDate: 'H-28 Deadline'
    },

    // 2. Learn Phase
    {
      id: `${competition.id}-lrn-1`,
      phase: 'Learn',
      phaseLabel: 'Pelajari Keterampilan Inti',
      title: isTech 
        ? 'Pemantapan Arsitektur & Tech Stack Terpilih' 
        : isBusiness 
        ? 'Validasi Problem-Solution Fit & Model Keuangan' 
        : isScience 
        ? 'Tinjauan Literatur & Metodologi Penelitian Kuantitatif'
        : 'Eksplorasi Konsep Estetika & Referensi Visual',
      description: `Fokus pada penguasaan modul terkait: ${competition.subcategories.slice(0, 3).join(', ')}.`,
      isCompleted: false,
      isOfficialRequirement: false,
      importanceReason: 'Mempersiapkan tim agar mampu menjawab pertanyaan teknis dewan juri secara presisi.',
      recommendedDueDate: 'H-21 Deadline'
    },
    {
      id: `${competition.id}-lrn-2`,
      phase: 'Learn',
      phaseLabel: 'Pelajari Keterampilan Inti',
      title: 'Pelatihan Komunikasi & Public Speaking / Pitching',
      description: 'Latihan penyampaian gagasan secara terstruktur dalam format 5-7 menit dengan slide ringkas.',
      isCompleted: false,
      isOfficialRequirement: false,
      importanceReason: 'Juri menilai artikulasi dan penguasaan materi sama tingginya dengan ide itu sendiri.',
      recommendedDueDate: 'H-14 Deadline'
    },

    // 3. Prepare Phase
    {
      id: `${competition.id}-prep-1`,
      phase: 'Prepare',
      phaseLabel: 'Siapkan Karya & Artefak',
      title: 'Eksekusi Prototipe / Draf Proposal Awal',
      description: 'Susun draf pertama solusi atau karya lengkap dengan latar belakang masalah nyata.',
      isCompleted: false,
      isOfficialRequirement: true,
      importanceReason: 'Memberikan ruang waktu untuk revisi substansi sebelum tenggat mendekat.',
      recommendedDueDate: 'H-10 Deadline'
    },
    {
      id: `${competition.id}-prep-2`,
      phase: 'Prepare',
      phaseLabel: 'Siapkan Karya & Artefak',
      title: 'Uji Coba & Review Bersama Mentor/Dosen Pembimbing',
      description: 'Dapatkan umpan balik kritis terkait kelayakan metodologi, etika, dan kebaruan ide.',
      isCompleted: false,
      isOfficialRequirement: false,
      importanceReason: 'Validasi pihak ketiga seringkali menemukan celah logika yang luput dari pandangan peserta.',
      recommendedDueDate: 'H-7 Deadline'
    },

    // 4. Submit Phase
    {
      id: `${competition.id}-sub-1`,
      phase: 'Submit',
      phaseLabel: 'Kirim Berkas Administrasi & Finalisasi',
      title: 'Verifikasi Dokumen Legal & Syarat Peserta',
      description: `Periksa kembali: ${competition.requiredDocuments.join(', ')}. Pastikan format PDF, ukuran file, dan tanda tangan lengkap.`,
      isCompleted: false,
      isOfficialRequirement: true,
      importanceReason: 'Kesalahan format file atau kelalaian identitas kartu pelajar/mahasiswa dapat mendiskualifikasi karya.',
      recommendedDueDate: 'H-3 Deadline'
    },
    {
      id: `${competition.id}-sub-2`,
      phase: 'Submit',
      phaseLabel: 'Kirim Berkas Administrasi & Finalisasi',
      title: `Submit ke Portal Resmi ${competition.organiser}`,
      description: `Lakukan pendaftaran dan unggah tautan karya ke formulir resmi sebelum batas waktu ${competition.registrationDeadline}. Simpan bukti submit!`,
      isCompleted: false,
      isOfficialRequirement: true,
      importanceReason: 'Menghindari kegagalan server akibat lonjakan traffic portal di jam-jam penutupan.',
      recommendedDueDate: 'H-1 Deadline'
    }
  ];

  const timeline: TimelineMilestone[] = [
    {
      weekNumber: 1,
      title: 'Fase Pemahaman & Pembentukan Tim',
      focus: 'Kaji pedoman, rumuskan topik, tetapkan pembagian peran anggota tim.',
      targetDaysRemaining: 30,
      tasks: ['Baca juknis', 'Bedah rubrik juri', 'Sepakati ide utama']
    },
    {
      weekNumber: 2,
      title: 'Fase Riset & Pembuktian Konsep',
      focus: 'Kumpulkan data empiris, uji hipotesis, dan mulai kerangka kerja.',
      targetDaysRemaining: 21,
      tasks: ['Riset literatur/pasar', 'Draf arsitektur solusi', 'Konsultasi pembimbing']
    },
    {
      weekNumber: 3,
      title: 'Fase Pengerjaan Intensif & Prototipe',
      focus: 'Selesaikan 80% karya utama, dokumen proposal, atau materi video.',
      targetDaysRemaining: 14,
      tasks: ['Selesaikan prototipe', 'Tulis proposal bab 1-3', 'Susun infografis']
    },
    {
      weekNumber: 4,
      title: 'Fase Finalisasi, Review & Pengiriman Berkas',
      focus: 'Proofreading proposal, pengecekan berkas persyaratan, dan submission resmi.',
      targetDaysRemaining: 3,
      tasks: ['Verifikasi dokumen identitas', 'Finalisasi format berkas', 'Kirim formulir resmi']
    }
  ];

  return { tasks, timeline };
}
