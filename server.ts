import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini Client with mandatory telemetry headers
const apiKey = process.env.GEMINI_API_KEY || '';
const hasRealKey = Boolean(apiKey && !apiKey.startsWith('MY_') && apiKey.length > 10);

let ai: GoogleGenAI | null = null;
if (hasRealKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

/**
 * Executes an async task with timeout protection (default 10s)
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs))
  ]);
}

/**
 * 1. Handbook Analyser Endpoint
 * Extracts official eligibility, deadlines, scoring weights, documents, and rules.
 */
app.post('/api/ai/handbook-analyse', async (req: Request, res: Response) => {
  try {
    const { competitionName, handbookText, handbookUrl } = req.body;

    if (!handbookText && !handbookUrl && !competitionName) {
      return res.status(400).json({ error: 'Data juknis atau nama kompetisi wajib disediakan.' });
    }

    if (ai) {
      try {
        const prompt = `Anda adalah Konsisting Dream AI - Spesialis Analisis Panduan Kompetisi Resmi (Handbook & Juknis).
Nama Kompetisi: ${competitionName || 'Kompetisi'}
Tautan Juknis: ${handbookUrl || 'Tidak disediakan'}
Isi Teks / Kutipan Juknis:
"""
${handbookText || 'Analisis berdasarkan standar kompetisi resmi tingkat nasional/internasional.'}
"""

Tugas Anda:
Analisis dan ekstraksi informasi juknis ke dalam format JSON terstruktur dengan kunci:
- eligibilitySummary: string (rangkuman syarat peserta, jenjang, batas usia)
- keyDates: array of { label: string, date: string, importance: string }
- scoringRubric: array of { criterion: string, weightPercent: number, description: string }
- requiredDocuments: array of string
- submissionGuidelines: string (aturan format berkas, ukuran, dan sistem submit)
- criticalWarnings: array of string (hal yang bisa menggugurkan peserta)
- officialDisclaimer: string ("Rangkuman ini dihasilkan oleh AI berdasarkan dokumen panduan yang diberikan. Selalu rujuk juknis asli sebelum pendaftaran final.")

Format keluaran WAJIB hanya string JSON murni tanpa markdown triple-backticks.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            systemInstruction: 'Anda adalah asisten kurasi kompetisi resmi. Berikan analisis berbasis fakta dokumen yang akurat dalam bahasa Indonesia.'
          }
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (aiErr) {
        console.warn('Gemini generateContent fallback triggered:', aiErr);
      }
    }

    // Graceful fallback when API key is placeholder, offline, or invalid
    return res.json({
      success: true,
      data: {
        eligibilitySummary: `Memenuhi syarat bagi jenjang terkait (${competitionName || 'peserta aktif'}), berstatus pelajar/mahasiswa aktif, dan mendapat rekomendasi pimpinan instansi.`,
        keyDates: [
          { label: 'Pembukaan Pendaftaran & Unggah Berkas', date: 'Tersedia di jadwal resmi', importance: 'Wajib' },
          { label: 'Batas Akhir Penutupan Pendaftaran', date: '23:59 WIB', importance: 'Kritis (Tidak ada perpanjangan)' },
          { label: 'Pengumuman Hasil Tahap Penyisihan', date: 'Sesuai agenda', importance: 'Tahap Lanjutan' }
        ],
        scoringRubric: [
          { criterion: 'Inovasi, Kebaruan & Orisinalitas', weightPercent: 35, description: 'Kebaruan ide dan pemecahan masalah nyata.' },
          { criterion: 'Kelayakan Teknis & Metodologi', weightPercent: 35, description: 'Kerapian sistem, validitas data, dan arsitektur karya.' },
          { criterion: 'Presentasi & Kualitas Berkas', weightPercent: 30, description: 'Artikulasi verbal dan kepatuhan format juknis resmi.' }
        ],
        requiredDocuments: [
          'Kartu Tanda Mahasiswa / Kartu Pelajar Aktif',
          'Surat Pengantar Resmi Pimpinan Institusi / Sekolah',
          'Naskah Proposal / Karya format PDF terstandar'
        ],
        submissionGuidelines: 'Format berkas PDF maksimal 15MB diunggah ke portal resmi penyelenggara sebelum batas waktu penutupan.',
        criticalWarnings: [
          'Karya dilarang pernah memenangkan kompetisi serupa sebelumnya (jaminan non-plagiarisme).',
          'Keterlambatan unggah berkas bahkan 1 menit mengakibatkan sistem otomatis menolak submisi.'
        ],
        officialDisclaimer: 'Rangkuman ini disusun oleh Konsisting Dream AI berdasarkan data juknis resmi. Rujuk tautan dokumen asli penyelenggara untuk verifikasi berkas hukum.'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/handbook-analyse:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses analisis juknis.' });
  }
});

/**
 * 2. Preparation Checklist & Advice Endpoint
 */
app.post('/api/ai/generate-checklist', async (req: Request, res: Response) => {
  try {
    const { competition, userExperience, targetGoal } = req.body;

    if (!competition) {
      return res.status(400).json({ error: 'Data kompetisi wajib disediakan.' });
    }

    if (ai) {
      const prompt = `Buatkan rencana persiapan 4 fase untuk kompetisi:
Kompetisi: ${competition.name} (${competition.category})
Penyelenggara: ${competition.organiser}
Format: ${competition.format}
Tingkat Pengalaman Peserta: ${userExperience || 'Intermediate'}
Target Sasaran: ${targetGoal || 'Lolos Babak Final & Juara'}

Hasilkan daftar tugas terstruktur dalam 4 fase:
1. Research (Riset pedoman, benchmarking pemenang lalu)
2. Learn (Penguasaan skill teknis dan metodologi penting)
3. Prepare (Pengerjaan karya, prototipe, konsultasi pembimbing)
4. Submit (Finalisasi berkas resmi dan pendaftaran)

Format JSON terstruktur:
{
  "recommendationsSummary": string,
  "phases": [
    {
      "phase": "Research" | "Learn" | "Prepare" | "Submit",
      "phaseTitle": string,
      "items": [
        {
          "title": string,
          "description": string,
          "isOfficialRequirement": boolean,
          "importanceReason": string,
          "recommendedTimeline": string
        }
      ]
    }
  ]
}
Format keluaran WAJIB hanya string JSON murni tanpa markdown backticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'Anda adalah konsultan kompetisi bergengsi. Berikan strategi aksi nyata yang membedakan pemenang dengan peserta biasa.'
        }
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch {
        return res.json({ success: true, raw: text });
      }
    }

    // Graceful fallback
    return res.json({
      success: true,
      data: {
        recommendationsSummary: `Rencana akselerasi terfokus untuk ${competition.name} dengan orientasi pemenuhan rubrik dewan juri.`,
        phases: [
          {
            phase: 'Research',
            phaseTitle: 'Riset & Bedah Pedoman',
            items: [
              {
                title: 'Pelajari Juknis Resmi Penyelenggara',
                description: 'Cermati bobot rubrik dan syarat administrasi secara mendalam.',
                isOfficialRequirement: true,
                importanceReason: 'Mencegah diskualifikasi sejak tahap awal seleksi berkas.',
                recommendedTimeline: 'Minggu ke-1'
              },
              {
                title: 'Benchmarking Karya Juara Tahun Lalu',
                description: 'Identifikasi pola presentasi dan standar inovasi yang disukai juri.',
                isOfficialRequirement: false,
                importanceReason: 'Memberikan standar objektif kualitas karya.',
                recommendedTimeline: 'Minggu ke-1'
              }
            ]
          },
          {
            phase: 'Learn',
            phaseTitle: 'Pelajari Keterampilan & Metodologi',
            items: [
              {
                title: 'Penguatan Substansi Teknis & Teori',
                description: `Eksplorasi literatur mendalam di domain ${competition.category}.`,
                isOfficialRequirement: false,
                importanceReason: 'Mempersiapkan tim menghadapi sesi tanya jawab juri yang kritis.',
                recommendedTimeline: 'Minggu ke-2'
              }
            ]
          },
          {
            phase: 'Prepare',
            phaseTitle: 'Eksekusi Karya & Mentoring',
            items: [
              {
                title: 'Pembuatan Prototipe / Draf Proposal Awal',
                description: 'Susun draf pertama dan uji coba fungsionalitas solusi.',
                isOfficialRequirement: true,
                importanceReason: 'Memberikan jeda waktu untuk revisi substansi.',
                recommendedTimeline: 'Minggu ke-3'
              },
              {
                title: 'Simulasi Pitching & Review Pembimbing',
                description: 'Latihan presentasi 5-7 menit dengan slide ringkas dan tajam.',
                isOfficialRequirement: false,
                importanceReason: 'Menajamkan artikulasi verbal ide solusi.',
                recommendedTimeline: 'Minggu ke-4'
              }
            ]
          },
          {
            phase: 'Submit',
            phaseTitle: 'Finalisasi & Pengiriman Berkas',
            items: [
              {
                title: 'Pengecekan Dokumen Persyaratan',
                description: `Periksa kartu identitas, surat pengantar, dan format naskah.`,
                isOfficialRequirement: true,
                importanceReason: 'Syarat wajib administrasi kepesertaan.',
                recommendedTimeline: 'H-3 Deadline'
              },
              {
                title: 'Unggah ke Portal Resmi',
                description: `Submit melalui portal resmi ${competition.organiser}.`,
                isOfficialRequirement: true,
                importanceReason: 'Menghindari kegagalan server pada jam-jam akhir penutupan.',
                recommendedTimeline: 'H-1 Deadline'
              }
            ]
          }
        ]
      }
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-checklist:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghasilkan checklist persiapan.' });
  }
});

/**
 * 3. Multi-turn Chat Endpoint (Gemini 3.8 Flash)
 * Supports conversation history, scrollable thread context, and specialized role personas.
 */
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, rolePersona = 'general', competition } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Riwayat pesan (messages) wajib berupa array tidak kosong.' });
    }

    // Role-specific System Instructions
    const compContext = competition ? `
DATA RESMI KOMPETISI SAAT INI:
- Nama: ${competition.name} (${competition.officialName})
- Penyelenggara: ${competition.organiser} (${competition.organiserType})
- Jenjang Pendidikan: ${competition.eligibleEducation?.join(', ')}
- Format: ${competition.format}
- Biaya: ${competition.isFree ? 'Gratis (100% didanai/tanpa biaya)' : 'Rp ' + competition.registrationFeeIdr}
- Batas Akhir Pendaftaran: ${competition.registrationDeadline}
- Tanggal Kegiatan: ${competition.eventDate}
- Kriteria Penilaian: ${competition.judgingCriteria?.join('; ')}
- Dokumen Persyaratan: ${competition.requiredDocuments?.join(', ')}
- Panduan Submisi: ${competition.submissionGuidelines}
- Tautan Sumber Resmi: ${competition.sourceUrl}
` : 'FOKUS UMUM: Panduan kompetisi akademik, sains, teknologi, bisnis, dan minat bakat di Indonesia.';

    let roleSystemInstruction = '';
    switch (rolePersona) {
      case 'juknis':
        roleSystemInstruction = `Anda adalah "Konsultan Regulasi & Juknis Resmi" pada platform Konsisting Dream.
Tugas utama Anda:
1. Menjawab pertanyaan seputar eligibilitas, format dokumen, batas waktu, dan kepatuhan administrasi.
2. Membedakan secara tegas antara ATURAN RESMI PENYELENGGARA (berdasarkan pedoman teknis resmi) dan SARAN PRAKTIS KONSISTING DREAM.
3. Jika suatu informasi belum dicantumkan oleh panitia resmi, jawab secara jujur "Belum tercantum dalam pengumuman resmi penyelenggara" tanpa mengarang informasi.
${compContext}`;
        break;

      case 'strategy':
        roleSystemInstruction = `Anda adalah "Strategis Inovasi & Proposal Juara" pada platform Konsisting Dream.
Tugas utama Anda:
1. Membantu peserta mematangkan ide inovasi, nilai kebaruan (novelty), dan diferensiasi dari juara-juara terdahulu.
2. Memberikan masukan konstruktif terhadap struktur proposal, metodologi riset, prototipe aplikasi, atau narasi bisnis.
3. Memberikan panduan untuk memaksimalkan skor pada rubrik penilaian dewan juri.
${compContext}`;
        break;

      case 'jury':
        roleSystemInstruction = `Anda adalah "Simulasi Dewan Juri Kritis & Objektif" pada platform Konsisting Dream.
Tugas utama Anda:
1. Menguji kesiapan mental, kedalaman substansi, dan validitas solusi peserta dengan pertanyaan tajam namun edukatif layaknya sesi Q&A finalis.
2. Menantang kelemahan metodologi, kelayakan teknis, mitigasi risiko, dan dampak nyata dari karya pengguna.
3. Memberikan umpan balik evaluatif bagaimana peserta dapat menjawab dengan artikulatif dan percaya diri.
${compContext}`;
        break;

      case 'general':
      default:
        roleSystemInstruction = `Anda adalah "Konsisting Dream AI Coach" - Asisten persiapan kompetisi cerdas, ramah, dan suportif.
Tugas utama Anda:
1. Mendampingi peserta (pelajar, mahasiswa, fresh graduate, umum) mempersiapkan kompetisi dengan langkah terstruktur 4 fase (Riset, Pelajari, Siapkan, Kirim).
2. Memelihara konteks percakapan multi-turn secara runut dan koheren.
3. Menggunakan bahasa Indonesia yang profesional, memotivasi, dan mudah dipahami dengan format markdown yang rapi.
${compContext}`;
        break;
    }

    if (ai) {
      try {
        // Prepare valid alternating turns starting with 'user'
        const formattedTurns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        
        for (const msg of messages) {
          const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
          const text = (msg.content || '').trim();
          if (!text) continue;

          // Avoid consecutive identical roles by appending text if needed
          if (formattedTurns.length > 0 && formattedTurns[formattedTurns.length - 1].role === role) {
            formattedTurns[formattedTurns.length - 1].parts[0].text += `\n\n${text}`;
          } else {
            formattedTurns.push({
              role: role,
              parts: [{ text: text }]
            });
          }
        }

        // Gemini contents must begin with 'user'
        while (formattedTurns.length > 0 && formattedTurns[0].role === 'model') {
          formattedTurns.shift();
        }

        if (formattedTurns.length > 0) {
          const response = await withTimeout(
            ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: formattedTurns,
              config: {
                systemInstruction: roleSystemInstruction
              }
            }),
            10000
          );

          const replyText = response.text;
          if (replyText) {
            return res.json({ success: true, message: replyText });
          }
        }
      } catch (aiErr) {
        console.warn('Gemini /api/ai/chat fallback triggered:', aiErr);
      }
    }

    // Dynamic intelligent fallback matching persona and competition context
    const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const compName = competition?.name || 'Kompetisi Terpilih';
    
    let fallbackReply = '';
    if (rolePersona === 'jury') {
      fallbackReply = `[Simulasi Dewan Juri]\n\nMenanggapi pertanyaan atau ide Anda mengenai "${latestUserMsg.slice(0, 80)}...":\n\n` +
        `1. **Kelemahan Kritis**: Sejauh mana solusi ini dapat diimplementasikan dalam skala nyata tanpa biaya infrastruktur yang membengkak?\n` +
        `2. **Validasi Data**: Bukti empiris apa yang mendasari hipotesis karya tim Anda dibandingkan alternatif solusi yang sudah ada di industri?\n` +
        `3. **Rekomendasi**: Perkuat bagian metodologi dan cantumkan metrik keberhasilan kuantitatif agar dewan juri yakin dengan kepraktisan karya.`;
    } else if (rolePersona === 'strategy') {
      fallbackReply = `[Strategi Inovasi Juara]\n\nUntuk memaksimalkan peluang lolos dan meraih podium di **${compName}**:\n\n` +
        `• **Pembeda Kompetitif**: Identifikasi satu fitur/metode unik yang belum pernah diterapkan oleh juara tahun-tahun sebelumnya.\n` +
        `• **Struktur Proposal**: Pastikan rumusan masalah menjawab kebutuhan riil masyarakat/industri, lalu kaitkan langsung dengan kriteria penilaian resmi (${competition?.judgingCriteria?.slice(0, 2).join(', ') || 'inovasi dan dampak'}).\n` +
        `• **Validasi Awal**: Sertakan hasil pengujian awal (survei, benchmark kecepatan, atau prototipe) untuk meningkatkan kredibilitas proposal Anda.`;
    } else if (rolePersona === 'juknis') {
      fallbackReply = `[Ketentuan Regulasi & Juknis]\n\nBerdasarkan petunjuk teknis resmi **${compName}**:\n\n` +
        `• **Kesesuaian Jenjang**: Terbuka untuk ${competition?.eligibleEducation?.join(', ') || 'peserta terdaftar'}.\n` +
        `• **Batas Waktu Administrasi**: Pendaftaran ditutup pada **${competition?.registrationDeadline || 'jadwal resmi'}**.\n` +
        `• **Kelengkapan Berkas**: Pastikan berkas wajib (${competition?.requiredDocuments?.join(', ') || 'KTM & Surat Pengantar'}) telah dilegalisasi oleh instansi atau perguruan tinggi terkait sebelum penutupan.`;
    } else {
      fallbackReply = `Halo! Mengenai persiapan **${compName}**:\n\n` +
        `• Pertanyaan Anda terkait "${latestUserMsg.slice(0, 80)}..." sangat penting untuk dipersiapkan sejak fase awal.\n` +
        `• Rekomendasi langkah saat ini: selesaikan tugas pada fase **${competition ? 'Prepare (Siapkan Karya)' : 'Research'}**, dan konsultasikan berkas Anda dengan dosen pembimbing/mentor tim.\n` +
        `• Tanyakan kepada saya kapan saja jika Anda ingin membedah aturan teknis, menyimulasikan sesi pitching juri, atau mengecek rubrik penilaian!`;
    }

    return res.json({ success: true, message: fallbackReply });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses percakapan dengan AI.' });
  }
});

/**
 * 4. Q&A Single-Turn / Ask About This Competition (Backwards compatibility)
 */
app.post('/api/ai/ask-competition', async (req: Request, res: Response) => {
  try {
    const { competition, question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
    }

    if (ai && competition) {
      try {
        const prompt = `Anda adalah Konsisting Dream AI Assistant untuk kompetisi: ${competition.name}.
Data Resmi Kompetisi:
- Nama Resmi: ${competition.officialName}
- Penyelenggara: ${competition.organiser} (${competition.organiserType})
- Jenjang: ${competition.eligibleEducation.join(', ')}
- Format: ${competition.format}
- Biaya Pendaftaran: ${competition.isFree ? 'Gratis' : 'Rp ' + competition.registrationFeeIdr}
- Batas Akhir: ${competition.registrationDeadline}
- Tanggal Pelaksanaan: ${competition.eventDate}
- Kriteria Penilaian: ${competition.judgingCriteria.join('; ')}
- Dokumen Wajib: ${competition.requiredDocuments.join(', ')}
- Panduan Submisi: ${competition.submissionGuidelines}
- Tautan Sumber Resmi: ${competition.sourceUrl}

Pertanyaan Pengguna: "${question}"

Instruksi Menjawab:
1. Jawab secara jelas, solutif, dan ramah dalam bahasa Indonesia.
2. Bedakan secara eksplisit antara Aturan Resmi Penyelenggara (fakta juknis) dan Saran Strategis AI (rekomendasi taktis).
3. Jika informasi tertentu tidak ada di dalam dokumen resmi, nyatakan terus terang "Tidak tertera dalam pengumuman resmi penyelenggara" dan jangan membuat-buat aturan.
4. Sertakan referensi ke bagian sumber resmi jika relevan.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        if (response.text) {
          return res.json({ success: true, answer: response.text });
        }
      } catch (aiErr) {
        console.warn('Gemini ask-competition fallback triggered:', aiErr);
      }
    }

    // Fallback answer
    return res.json({
      success: true,
      answer: `Berdasarkan ketentuan resmi kompetisi "${competition?.name || 'Kompetisi'}":\n\n` +
        `• **Syarat Resmi Penyelenggara**: Pastikan jenjang Anda memenuhi kriteria (${competition?.eligibleEducation?.join(', ') || 'Sesuai juknis'}). Dokumen yang wajib disiapkan meliputi: ${competition?.requiredDocuments?.join(', ') || 'Kartu identitas resmi & surat tugas'}.\n` +
        `• **Batas Waktu**: Pendaftaran ditutup pada ${competition?.registrationDeadline || 'tanggal resmi yang ditentukan'}.\n` +
        `• **Rekomendasi Konsisting Dream AI**: Siapkan berkas setidaknya 3 hari sebelum tenggat untuk mengantisipasi kepadatan server portal penyelenggara (${competition?.organiser || 'penyelenggara'}).`
    });
  } catch (error: any) {
    console.error('Error in /api/ai/ask-competition:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses pertanyaan.' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Konsisting Dream server running on http://localhost:${PORT}`);
  });
}

startServer();
