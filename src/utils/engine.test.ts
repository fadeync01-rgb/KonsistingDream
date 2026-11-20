import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility, calculateMatchScore, Competition, UserPreferences } from './recommendationEngine';
import { generatePreparationPlan } from './checklistGenerator';

const sampleCompetition: Competition = {
  id: 'gemastik-2025',
  name: 'GEMASTIK XVIII',
  officialName: 'Pagelaran Mahasiswa Nasional Bidang Teknologi Informasi dan Komunikasi',
  theme: 'Teknologi Informasi untuk Akselerasi Kemandirian Bangsa',
  organiser: 'BPTI - Balai Pengembangan Talenta Indonesia / Kemdiktisaintek',
  organiserType: 'Pemerintah / Puspresnas',
  category: 'Technology & Computer Science',
  subcategories: ['Software Development', 'Data Science', 'Cyber Security', 'UI/UX Design'],
  eligibleEducation: ['D3/D4/S1'],
  minAge: 17,
  maxAge: 25,
  format: 'Hybrid',
  scope: 'Nasional',
  participationType: 'Tim',
  maxTeamMembers: 3,
  location: 'Universitas Penyelenggara (Tahap Final)',
  registrationFeeIdr: 0,
  isFree: true,
  registrationStart: '2025-05-01',
  registrationDeadline: '2025-06-30',
  eventDate: '2025-09-15',
  status: 'Open',
  verifiedStatus: 'Officially Verified',
  lastVerifiedDate: '2025-04-10',
  sourceUrl: 'https://puspresnas.kemdikbud.go.id/gemastik',
  sourceType: 'Surat Keputusan / Juknis Resmi',
  officialHandbookUrl: 'https://puspresnas.kemdikbud.go.id/panduan-gemastik.pdf',
  registrationUrl: 'https://gemastik.kemdikbud.go.id',
  contactEmail: 'puspresnas@kemdikbud.go.id',
  contactWebsite: 'https://puspresnas.kemdikbud.go.id',
  prizesSummary: 'Piala Bergilir Samudra Asuh, Medali Emas, Perak, Perunggu & Uang Pembinaan Puspresnas',
  description: 'Ajang bergengsi mahasiswa Indonesia di bidang teknologi informasi dan komunikasi untuk mendorong daya saing bangsa.',
  judgingCriteria: ['Inovasi & Kebaruan (35%)', 'Relevansi Masalah (25%)', 'Kualitas Teknis (25%)', 'Presentasi (15%)'],
  requiredDocuments: ['Kartu Tanda Mahasiswa (KTM) Aktif', 'Surat Rekomendasi Dekan/Wakil Rektor', 'Proposal Karya'],
  submissionGuidelines: 'Format berkas PDF maksimal 10MB diunggah melalui portal SIMMT BPTI.'
};

const userStudent: UserPreferences = {
  educationLevel: 'D3/D4/S1',
  gradeOrSemester: 'Semester 4',
  age: 20,
  country: 'Indonesia',
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  selectedCategories: ['Technology & Computer Science'],
  selectedSubcategories: ['Software Development', 'AI'],
  experienceLevel: 'Intermediate',
  formatPreference: 'Hybrid',
  costPreference: 'Free',
  scopePreference: 'National',
  participationPreference: 'Tim',
  weeklyHoursAvailable: 15,
  budgetMaxIdr: 100000
};

test('checkEligibility correctly qualifies an eligible university student', () => {
  const result = checkEligibility(userStudent, sampleCompetition);
  assert.equal(result.isEligible, true);
  assert.ok(result.reasons.length > 0);
});

test('checkEligibility disqualifies SMP student for university-only competition', () => {
  const juniorUser: Partial<UserPreferences> = {
    educationLevel: 'SMP',
    age: 14
  };
  const result = checkEligibility(juniorUser, sampleCompetition);
  assert.equal(result.isEligible, false);
  assert.ok(result.reasons.some(r => r.includes('SMP tidak tertera')));
});

test('calculateMatchScore produces high score for matching profile', () => {
  const match = calculateMatchScore(userStudent, sampleCompetition);
  assert.equal(match.isEligible, true);
  assert.ok(match.matchScore >= 80, `Expected score >= 80 but got ${match.matchScore}`);
  assert.ok(match.matchReasons.some(r => r.includes('Technology & Computer Science')));
});

test('generatePreparationPlan returns structured 4 phases and timeline', () => {
  const plan = generatePreparationPlan(sampleCompetition);
  assert.equal(plan.tasks.length, 8);
  
  const phases = new Set(plan.tasks.map(t => t.phase));
  assert.ok(phases.has('Research'));
  assert.ok(phases.has('Learn'));
  assert.ok(phases.has('Prepare'));
  assert.ok(phases.has('Submit'));
  
  // Verify official requirements flag separation
  const officialCount = plan.tasks.filter(t => t.isOfficialRequirement).length;
  assert.ok(officialCount >= 3);
  
  assert.equal(plan.timeline.length, 4);
});

import { formatGeminiChatTurns, getPersonaSystemInstruction, ChatMessageItem } from './chatHelper';

test('formatGeminiChatTurns skips initial model greeting and enforces user-first turn', () => {
  const rawMessages: ChatMessageItem[] = [
    { role: 'assistant', content: 'Halo! Ada yang bisa dibantu?' },
    { role: 'user', content: 'Bagaimana cara mendaftar GEMASTIK?' },
    { role: 'assistant', content: 'Melalui portal resmi SIMMT BPTI.' },
    { role: 'user', content: 'Kapan batas akhirnya?' }
  ];

  const turns = formatGeminiChatTurns(rawMessages);
  assert.equal(turns.length, 3);
  assert.equal(turns[0].role, 'user');
  assert.equal(turns[0].parts[0].text, 'Bagaimana cara mendaftar GEMASTIK?');
  assert.equal(turns[1].role, 'model');
  assert.equal(turns[2].role, 'user');
});

test('formatGeminiChatTurns collapses consecutive same-role messages', () => {
  const rawMessages: ChatMessageItem[] = [
    { role: 'user', content: 'Halo' },
    { role: 'user', content: 'Tanya syarat lomba' },
    { role: 'assistant', content: 'Syaratnya mahasiswa aktif.' }
  ];

  const turns = formatGeminiChatTurns(rawMessages);
  assert.equal(turns.length, 2);
  assert.equal(turns[0].role, 'user');
  assert.ok(turns[0].parts[0].text.includes('Halo\n\nTanya syarat lomba'));
  assert.equal(turns[1].role, 'model');
});

test('getPersonaSystemInstruction includes competition context and specialized role', () => {
  const juryInstruction = getPersonaSystemInstruction('jury', sampleCompetition);
  assert.ok(juryInstruction.includes('Simulasi Dewan Juri Kritis'));
  assert.ok(juryInstruction.includes('GEMASTIK XVIII'));
  assert.ok(juryInstruction.includes('BPTI'));

  const juknisInstruction = getPersonaSystemInstruction('juknis', sampleCompetition);
  assert.ok(juknisInstruction.includes('Konsultan Regulasi & Juknis'));
  assert.ok(juknisInstruction.includes('fakta juknis'));
});

