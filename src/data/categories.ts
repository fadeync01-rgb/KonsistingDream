export interface CategoryDefinition {
  id: string;
  name: string;
  iconName: string;
  description: string;
  subcategories: string[];
}

export const COMPETITION_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'academic-science',
    name: 'Academic & Science',
    iconName: 'Atom',
    description: 'Olimpiade sains murni, karya tulis ilmiah, riset empiris, dan penalaran akademis tingkat pelajar dan perguruan tinggi.',
    subcategories: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Astronomy',
      'Geography',
      'History',
      'Economics',
      'Computer Science',
      'Science Olympiad',
      'Research & Science Papers'
    ]
  },
  {
    id: 'tech-cs',
    name: 'Technology & Computer Science',
    iconName: 'Code',
    description: 'Pemrograman kompetitif, rekayasa perangkat lunak, AI/Machine Learning, keamanan siber, dan rekayasa data.',
    subcategories: [
      'Coding',
      'Competitive Programming',
      'Web Development',
      'Mobile Apps',
      'AI',
      'Machine Learning',
      'Data Science',
      'Cyber Security',
      'Game Development',
      'IoT & Robotics'
    ]
  },
  {
    id: 'business-entrepreneurship',
    name: 'Business & Entrepreneurship',
    iconName: 'TrendingUp',
    description: 'Kompetisi studi kasus bisnis (BCC), rencana bisnis, startup pitching, strategi pemasaran, dan analisis keuangan.',
    subcategories: [
      'Business Case Competitions',
      'Business Plan',
      'Startup Pitching',
      'Marketing',
      'Finance',
      'Accounting',
      'Entrepreneurship'
    ]
  },
  {
    id: 'engineering-innovation',
    name: 'Engineering & Innovation',
    iconName: 'Cpu',
    description: 'Rancang bangun robotika, kendaraan hemat energi, energi terbarukan, elektronika, dan inovasi produk fisik.',
    subcategories: [
      'Robotics',
      'Drones',
      'Automotive',
      'Mechanical',
      'Electrical',
      'Renewable Energy',
      'Architecture',
      'Product Innovation'
    ]
  },
  {
    id: 'literacy-writing',
    name: 'Literacy & Writing',
    iconName: 'BookOpen',
    description: 'Lomba esai kritis, penulisan kreatif, cerita pendek, puisi, jurnalisme investigatif, dan penerjemahan naskah.',
    subcategories: [
      'Essay',
      'Creative Writing',
      'Short Stories',
      'Novels',
      'Poetry',
      'Journalism',
      'Book Reviews',
      'Storytelling',
      'Translation & Science Writing'
    ]
  },
  {
    id: 'language-communication',
    name: 'Language & Communication',
    iconName: 'MessageSquare',
    description: 'Debat parlemen (KDMI/NUDC), pidato publik, speech contest, spelling bee, dan penguasaan bahasa asing.',
    subcategories: [
      'Debate',
      'Public Speaking',
      'Speech',
      'Spelling Bee',
      'Storytelling',
      'Foreign Language'
    ]
  },
  {
    id: 'design-creative',
    name: 'Design & Creative Industry',
    iconName: 'Palette',
    description: 'Desain pengalaman pengguna (UI/UX), grafis komunikasi visual, arsitektur tata ruang, branding, dan fotografi produk.',
    subcategories: [
      'Graphic Design',
      'UI/UX',
      'Web Design',
      'Product Design',
      'Fashion',
      'Architecture',
      'Branding',
      'Packaging',
      'Photography'
    ]
  },
  {
    id: 'visual-arts',
    name: 'Visual Arts',
    iconName: 'Brush',
    description: 'Seni rupa murni, ilustrasi digital, komik, seni patung, serta pelestarian batik dan kriya nusantara.',
    subcategories: [
      'Drawing',
      'Painting',
      'Digital Illustration',
      'Comics',
      'Manga',
      'Sculpture',
      'Batik & Crafts'
    ]
  },
  {
    id: 'film-multimedia',
    name: 'Film & Multimedia',
    iconName: 'Film',
    description: 'Produksi film pendek independen, dokumenter sains, animasi 2D/3D, sinematografi, dan podcast edukatif.',
    subcategories: [
      'Short Films',
      'Documentaries',
      'Screenwriting',
      'Animation',
      'Cinematography',
      'Video Editing',
      'Podcasts',
      'Video Storytelling'
    ]
  },
  {
    id: 'music-singing',
    name: 'Music & Singing',
    iconName: 'Music',
    description: 'Paduan suara mahasiswa/pelajar, vokal solo, komposisi instrumen klasik, cipta lagu, dan pertunjukan akustik.',
    subcategories: [
      'Solo Singing',
      'Choir',
      'Bands',
      'Piano',
      'Guitar',
      'Violin',
      'Music Composition',
      'Songwriting'
    ]
  },
  {
    id: 'dance-performing',
    name: 'Dance & Performing Arts',
    iconName: 'Sparkles',
    description: 'Tari tradisional nusantara, tari kontemporer/modern, teater monolog, drama musikal, dan koreografi orisinal.',
    subcategories: [
      'Traditional Dance',
      'Modern Dance',
      'Ballet',
      'Choreography',
      'Theatre',
      'Drama',
      'Musical Performances'
    ]
  },
  {
    id: 'social-environment',
    name: 'Social Impact & Environment',
    iconName: 'Globe',
    description: 'Inovasi sosial pemberdayaan masyarakat, aksi mitigasi krisis iklim, pengelolaan limbah, dan implementasi target SDGs.',
    subcategories: [
      'Social Innovation',
      'Sustainability',
      'Climate Change',
      'Waste Management',
      'Community Development',
      'SDG Competitions'
    ]
  },
  {
    id: 'ball-sports',
    name: 'Ball Sports',
    iconName: 'Trophy',
    description: 'Kompetisi beregu dan individu cabang olahraga bola resmi dinaungi federasi nasional seperti PBSI, PERBASI, dan PSSI.',
    subcategories: [
      'Badminton',
      'Basketball',
      'Football',
      'Futsal',
      'Volleyball',
      'Tennis',
      'Table Tennis',
      'Rugby',
      'Hockey',
      'Baseball & Softball'
    ]
  },
  {
    id: 'individual-sports',
    name: 'Individual Sports & Athletics',
    iconName: 'Activity',
    description: 'Lomba atletik lari sprint, maraton, renang gaya dada/bebas, panahan, panjat tebing, senam, dan balap sepeda.',
    subcategories: [
      'Swimming',
      'Sprinting',
      'Marathon',
      'Long Jump',
      'High Jump',
      'Archery',
      'Cycling',
      'Gymnastics',
      'Climbing',
      'Rowing',
      'Surfing'
    ]
  },
  {
    id: 'martial-mind',
    name: 'Martial Arts & Mind Sports',
    iconName: 'Shield',
    description: 'Cabang seni bela diri pencak silat, karate, taekwondo, judo serta cabang asah otak catur cepat dan esports taktis.',
    subcategories: [
      'Pencak Silat',
      'Karate',
      'Taekwondo',
      'Judo',
      'Boxing',
      'Fencing',
      'Chess',
      'Esports'
    ]
  },
  {
    id: 'vocational-skills',
    name: 'Vocational, Cooking & Professional Skills',
    iconName: 'Wrench',
    description: 'Uji kompetensi vokasi kuliner pastry/baking, barista kopi, kejuruan otomotif, pengelasan, dan hospitaliti perhotelan.',
    subcategories: [
      'Cooking',
      'Baking',
      'Pastry',
      'Barista',
      'Hospitality',
      'Tourism',
      'Automotive Repair',
      'Welding',
      'Professional Skills'
    ]
  }
];
