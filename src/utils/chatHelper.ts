/**
 * Helper utility for formatting multi-turn conversation history
 * and constructing role-grounded system instructions for Gemini 3.8 Flash.
 */
import { Competition } from './recommendationEngine';

export type ChatRole = 'user' | 'assistant' | 'model';

export interface ChatMessageItem {
  role: ChatRole;
  content: string;
  timestamp?: string;
}

export type PersonaType = 'general' | 'juknis' | 'strategy' | 'jury';

/**
 * Formats a raw list of chat messages into valid Gemini API Content turns:
 * 1. Maps 'assistant' to 'model'.
 * 2. Removes empty messages.
 * 3. Collapses consecutive turns of the same role.
 * 4. Ensures the thread starts with 'user' role (skips initial bot greetings).
 */
export function formatGeminiChatTurns(messages: ChatMessageItem[]): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const turns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    const role: 'user' | 'model' = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
    const text = (msg.content || '').trim();
    if (!text) continue;

    if (turns.length > 0 && turns[turns.length - 1].role === role) {
      turns[turns.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      turns.push({
        role,
        parts: [{ text }]
      });
    }
  }

  // Ensure first turn is from user
  while (turns.length > 0 && turns[0].role === 'model') {
    turns.shift();
  }

  return turns;
}

/**
 * Generates the role-specific system instruction grounded in official competition data.
 */
export function getPersonaSystemInstruction(rolePersona: PersonaType, competition?: Competition | null): string {
  const compContext = competition ? `
DATA RESMI KOMPETISI SAAT INI:
- Nama: ${competition.name} (${competition.officialName})
- Penyelenggara: ${competition.organiser} (${competition.organiserType})
- Jenjang Pendidikan: ${competition.eligibleEducation?.join(', ')}
- Format: ${competition.format}
- Biaya: ${competition.isFree ? 'Gratis' : 'Rp ' + competition.registrationFeeIdr}
- Batas Akhir: ${competition.registrationDeadline}
- Tanggal Kegiatan: ${competition.eventDate}
- Kriteria Penilaian: ${competition.judgingCriteria?.join('; ')}
- Dokumen Persyaratan: ${competition.requiredDocuments?.join(', ')}
- Panduan Submisi: ${competition.submissionGuidelines}
` : 'FOKUS UMUM: Panduan kompetisi resmi di Indonesia dan internasional.';

  switch (rolePersona) {
    case 'juknis':
      return `Anda adalah Konsultan Regulasi & Juknis Resmi Konsisting Dream. Jawab berdasarkan ketentuan resmi penyelenggara dan bedakan tegas antara fakta juknis dan saran praktis.\n${compContext}`;
    case 'strategy':
      return `Anda adalah Strategis Inovasi & Proposal Juara Konsisting Dream. Bantu peserta mematangkan nilai kebaruan (novelty), proposal juara, dan strategi penilaian juri.\n${compContext}`;
    case 'jury':
      return `Anda adalah Simulasi Dewan Juri Kritis & Objektif Konsisting Dream. Uji kesiapan peserta dengan pertanyaan tajam mengenai kelayakan teknis, metodologi, dan mitigasi risiko.\n${compContext}`;
    case 'general':
    default:
      return `Anda adalah Konsisting Dream AI Coach (Gemini 3.8 Flash). Bimbing peserta dalam 4 fase persiapan terstruktur (Riset, Pelajari, Siapkan, Kirim) secara profesional dan ramah.\n${compContext}`;
  }
}
