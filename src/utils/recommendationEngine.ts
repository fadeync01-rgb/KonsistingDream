export type EducationLevel = 
  | 'SMP' 
  | 'SMA/SMK' 
  | 'D3/D4/S1' 
  | 'S2/S3' 
  | 'Fresh Graduate' 
  | 'Umum';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Experienced';
export type CompetitionFormat = 'Online' | 'Offline' | 'Hybrid';
export type ParticipationType = 'Individu' | 'Tim' | 'Individu atau Tim';
export type VerifiedStatus = 'Officially Verified' | 'Pending' | 'Partially Verified' | 'Outdated' | 'Unverified';
export type OpportunityStatus = 'Saved' | 'Considering' | 'Preparing' | 'Registered' | 'Submitted' | 'Completed' | 'Dismissed';

export interface UserPreferences {
  educationLevel: EducationLevel;
  gradeOrSemester?: string;
  age?: number;
  country: string;
  province?: string;
  city?: string;
  selectedCategories: string[];
  selectedSubcategories: string[];
  experienceLevel: ExperienceLevel;
  previousAchievements?: string;
  formatPreference: 'All' | 'Online' | 'Offline' | 'Hybrid';
  costPreference: 'All' | 'Free' | 'Paid';
  scopePreference: 'All' | 'Local' | 'National' | 'International';
  participationPreference: 'All' | 'Individu' | 'Tim';
  weeklyHoursAvailable: number;
  budgetMaxIdr: number;
}

export interface Competition {
  id: string;
  name: string;
  officialName: string;
  theme?: string;
  organiser: string;
  organiserType: 'Pemerintah / Puspresnas' | 'Universitas' | 'Federasi Olahraga' | 'Komunitas / NGO' | 'Perusahaan Swasta';
  category: string;
  subcategories: string[];
  eligibleEducation: EducationLevel[];
  minAge?: number;
  maxAge?: number;
  format: CompetitionFormat;
  scope: 'Lokal' | 'Nasional' | 'Internasional';
  participationType: ParticipationType;
  maxTeamMembers?: number;
  location: string;
  registrationFeeIdr: number;
  isFree: boolean;
  registrationStart: string;
  registrationDeadline: string;
  eventDate: string;
  status: 'Open' | 'Upcoming' | 'Closed' | 'Delayed' | 'Cancelled' | 'Unconfirmed';
  verifiedStatus: VerifiedStatus;
  lastVerifiedDate: string;
  sourceUrl: string;
  sourceType: 'Surat Keputusan / Juknis Resmi' | 'Website Resmi Universitas' | 'Portal Puspresnas / BPTI' | 'Akun Resmi Media Sosial';
  officialHandbookUrl?: string;
  registrationUrl: string;
  contactEmail: string;
  contactWebsite: string;
  contactSocialMedia?: string;
  prizesSummary: string;
  description: string;
  judgingCriteria: string[];
  requiredDocuments: string[];
  submissionGuidelines: string;
  imageUrl?: string;
  isDemoData?: boolean;
}

export interface MatchResult {
  isEligible: boolean;
  eligibilityReasons: string[];
  matchScore: number; // 0 - 100
  matchReasons: string[];
}

/**
 * Checks if a user is eligible for a competition based on official requirements
 */
export function checkEligibility(profile: Partial<UserPreferences>, competition: Competition): { isEligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let eligible = true;

  // Education level check
  if (profile.educationLevel) {
    if (!competition.eligibleEducation.includes(profile.educationLevel) && !competition.eligibleEducation.includes('Umum')) {
      eligible = false;
      reasons.push(`Jenjang ${profile.educationLevel} tidak tertera pada syarat resmi (${competition.eligibleEducation.join(', ')})`);
    } else {
      reasons.push(`Memenuhi syarat jenjang pendidikan (${profile.educationLevel})`);
    }
  }

  // Age check
  if (profile.age !== undefined && profile.age > 0) {
    if (competition.minAge && profile.age < competition.minAge) {
      eligible = false;
      reasons.push(`Usia ${profile.age} tahun di bawah batas minimal (${competition.minAge} tahun)`);
    } else if (competition.maxAge && profile.age > competition.maxAge) {
      eligible = false;
      reasons.push(`Usia ${profile.age} tahun melebihi batas maksimal (${competition.maxAge} tahun)`);
    }
  }

  return { isEligible: eligible, reasons };
}

/**
 * Calculates interest match score and generates natural reasoning
 */
export function calculateMatchScore(profile: UserPreferences, competition: Competition): MatchResult {
  const eligibility = checkEligibility(profile, competition);
  let score = 0;
  const matchReasons: string[] = [];

  // Category match (+40 max)
  const hasDirectCategoryMatch = profile.selectedCategories.some(cat => 
    cat.toLowerCase() === competition.category.toLowerCase()
  );
  if (hasDirectCategoryMatch) {
    score += 30;
    matchReasons.push(`Sesuai bidang utama minatmu: ${competition.category}`);
  }

  const matchingSubcats = profile.selectedSubcategories.filter(sub =>
    competition.subcategories.some(cSub => cSub.toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes(cSub.toLowerCase()))
  );
  if (matchingSubcats.length > 0) {
    score += Math.min(15, matchingSubcats.length * 5);
    matchReasons.push(`Mencakup topik keahlian: ${matchingSubcats.join(', ')}`);
  }

  // Format preference match (+15)
  if (profile.formatPreference === 'All' || profile.formatPreference === competition.format) {
    score += 15;
    matchReasons.push(`Format kegiatan sesuai: ${competition.format}`);
  }

  // Cost match (+15)
  if (competition.isFree) {
    score += 15;
    matchReasons.push('Pendaftaran 100% gratis tanpa biaya');
  } else if (profile.budgetMaxIdr >= competition.registrationFeeIdr) {
    score += 10;
    matchReasons.push(`Biaya terjangkau sesuai anggaranmu (Rp ${competition.registrationFeeIdr.toLocaleString('id-ID')})`);
  } else {
    score += 2;
  }

  // Scope match (+10)
  if (profile.scopePreference === 'All' || 
     (profile.scopePreference === 'National' && competition.scope === 'Nasional') ||
     (profile.scopePreference === 'International' && competition.scope === 'Internasional') ||
     (profile.scopePreference === 'Local' && competition.scope === 'Lokal')) {
    score += 10;
    matchReasons.push(`Tingkat kompetisi ${competition.scope}`);
  }

  // Participation type match (+10)
  if (profile.participationPreference === 'All' || 
     competition.participationType === 'Individu atau Tim' || 
     profile.participationPreference === competition.participationType) {
    score += 10;
    matchReasons.push(`Sistem peserta: ${competition.participationType}`);
  }

  // Experience level weighting
  if (profile.experienceLevel === 'Beginner' && competition.isDemoData === false) {
    // Verified beginner friendly
    score += 5;
  }

  const finalScore = Math.min(100, Math.max(10, score));

  return {
    isEligible: eligibility.isEligible,
    eligibilityReasons: eligibility.reasons,
    matchScore: finalScore,
    matchReasons: matchReasons.slice(0, 3)
  };
}
