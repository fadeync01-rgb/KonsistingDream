import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Calendar, 
  BookOpen, 
  FileText, 
  Send, 
  HelpCircle, 
  Clock, 
  CheckSquare, 
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Bot,
  User as UserIcon,
  Scale,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import { Competition } from '../utils/recommendationEngine';
import { PreparationTask, TimelineMilestone, generatePreparationPlan } from '../utils/checklistGenerator';
import { UserOpportunity, HandbookAnalysisResult } from '../types';

interface AiAssistantViewProps {
  activeCompetition: Competition | null;
  competitions: Competition[];
  onSelectCompetition: (comp: Competition) => void;
  savedOpportunities: UserOpportunity[];
  onUpdateOpportunityTasks: (compId: string, tasks: PreparationTask[]) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  activeCompetition,
  competitions,
  onSelectCompetition,
  savedOpportunities,
  onUpdateOpportunityTasks
}) => {
  const [activeTab, setActiveTab] = React.useState<'checklist' | 'analyser' | 'timeline' | 'qa' | 'resources'>('checklist');

  // Currently selected competition (defaults to activeCompetition or first competition)
  const currentComp = activeCompetition || competitions[0];

  // Checklist state
  const existingOpp = savedOpportunities.find(o => o.competitionId === currentComp?.id);
  const [tasks, setTasks] = React.useState<PreparationTask[]>(() => {
    if (existingOpp && existingOpp.tasks.length > 0) return existingOpp.tasks;
    if (currentComp) return generatePreparationPlan(currentComp).tasks;
    return [];
  });

  const [timeline, setTimeline] = React.useState<TimelineMilestone[]>(() => {
    if (existingOpp && existingOpp.timeline.length > 0) return existingOpp.timeline;
    if (currentComp) return generatePreparationPlan(currentComp).timeline;
    return [];
  });

  // Whenever currentComp changes, refresh tasks if not saved
  React.useEffect(() => {
    if (currentComp) {
      const opp = savedOpportunities.find(o => o.competitionId === currentComp.id);
      if (opp && opp.tasks.length > 0) {
        setTasks(opp.tasks);
        setTimeline(opp.timeline);
      } else {
        const plan = generatePreparationPlan(currentComp);
        setTasks(plan.tasks);
        setTimeline(plan.timeline);
      }
    }
  }, [currentComp?.id, savedOpportunities]);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskPhase, setNewTaskPhase] = React.useState<'Research' | 'Learn' | 'Prepare' | 'Submit'>('Prepare');
  const [showAddTask, setShowAddTask] = React.useState(false);

  // Handbook Analyser state
  const [handbookInputUrl, setHandbookInputUrl] = React.useState(currentComp?.officialHandbookUrl || '');
  const [handbookInputText, setHandbookInputText] = React.useState('');
  const [analysing, setAnalysing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<HandbookAnalysisResult | null>(null);

  // Multi-turn Gemini Chatbot State
  const [rolePersona, setRolePersona] = React.useState<'general' | 'juknis' | 'strategy' | 'jury'>('general');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const getInitialGreeting = (compName: string, role: string) => {
    switch (role) {
      case 'juknis':
        return `Halo! Saya **Konsultan Regulasi & Juknis Resmi** untuk **${compName}**. Saya siap membedah aturan teknis, batas waktu administrasi, format dokumen, dan ketentuan eligibilitas peserta secara akurat berdasarkan juknis resmi.`;
      case 'strategy':
        return `Halo! Saya **Strategis Inovasi & Proposal Juara** untuk **${compName}**. Tanyakan kepada saya cara merumuskan kebaruan (novelty), menyusun struktur proposal ilmiah/bisnis, atau strategi merebut skor tertinggi dewan juri.`;
      case 'jury':
        return `Halo! Saya bertindak sebagai **Simulasi Dewan Juri Kritis** untuk **${compName}**. Uji kesiapan tim Anda sekarang: ajukan ringkasan ide atau solusi Anda, dan saya akan memberikan pertanyaan tajam layaknya sesi tanya-jawab babak final.`;
      case 'general':
      default:
        return `Halo! Saya **Konsisting Dream AI Coach** untuk kompetisi **${compName}** (didukung model **Gemini 3.8 Flash**). Tanyakan apa saja seputar juknis, ide karya, strategi persiapan 4 fase, hingga simulasi presentasi.`;
    }
  };

  const [chatMessages, setChatMessages] = React.useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>>(() => {
    try {
      const saved = localStorage.getItem(`kd_chat_${currentComp?.id || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved chat:', e);
    }
    return [
      {
        role: 'assistant',
        content: getInitialGreeting(currentComp?.name || 'Kompetisi', 'general'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputQuestion, setInputQuestion] = React.useState('');
  const [asking, setAsking] = React.useState(false);

  // Sync chat messages to localStorage
  React.useEffect(() => {
    if (currentComp) {
      try {
        localStorage.setItem(`kd_chat_${currentComp.id}`, JSON.stringify(chatMessages));
      } catch (e) {
        console.warn('Failed to save chat messages:', e);
      }
    }
  }, [chatMessages, currentComp?.id]);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (activeTab === 'qa') {
      scrollToBottom();
    }
  }, [chatMessages, asking, activeTab]);

  // Task Checkbox Toggle
  const toggleTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    setTasks(updated);
    if (currentComp) {
      onUpdateOpportunityTasks(currentComp.id, updated);
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentComp) return;
    const newTask: PreparationTask = {
      id: `${currentComp.id}-custom-${Date.now()}`,
      phase: newTaskPhase,
      phaseLabel: newTaskPhase === 'Research' ? 'Riset' : newTaskPhase === 'Learn' ? 'Pelajari' : newTaskPhase === 'Prepare' ? 'Siapkan' : 'Kirim',
      title: newTaskTitle.trim(),
      description: 'Tugas persiapan yang ditambahkan oleh peserta.',
      isCompleted: false,
      isOfficialRequirement: false,
      importanceReason: 'Inisiatif persiapan mandiri untuk memastikan kelancaran kompetisi.',
      recommendedDueDate: 'Sesuai rencana'
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    onUpdateOpportunityTasks(currentComp.id, updated);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  // Run Handbook Analyser
  const runHandbookAnalysis = async () => {
    if (!currentComp) return;
    setAnalysing(true);
    try {
      const res = await fetch('/api/ai/handbook-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionName: currentComp.name,
          handbookUrl: handbookInputUrl || currentComp.officialHandbookUrl,
          handbookText: handbookInputText || currentComp.submissionGuidelines
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysisResult(data.data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalysing(false);
    }
  };

  // Multi-turn Gemini Chat Question Handler
  const handleAskQuestion = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = (customQuestion || inputQuestion).trim();
    if (!query || !currentComp || asking) return;
    
    setInputQuestion('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user' as const, content: query, timestamp: timeStr };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setAsking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          rolePersona: rolePersona,
          competition: currentComp
        })
      });
      const data = await res.json();
      const reply = data.message || data.answer || 'Mohon maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali.';
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: reply, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Terjadi kendala jaringan saat berkomunikasi dengan server. Silakan kirim ulang pertanyaan Anda.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAsking(false);
    }
  };

  const handleClearChat = () => {
    const resetMessages = [
      {
        role: 'assistant' as const,
        content: getInitialGreeting(currentComp?.name || 'Kompetisi', rolePersona),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatMessages(resetMessages);
    if (currentComp) {
      localStorage.setItem(`kd_chat_${currentComp.id}`, JSON.stringify(resetMessages));
    }
  };

  const handleSelectPersona = (newPersona: 'general' | 'juknis' | 'strategy' | 'jury') => {
    if (newPersona === rolePersona) return;
    setRolePersona(newPersona);
    const personaLabel = newPersona === 'juknis' 
      ? 'Konsultan Regulasi & Juknis' 
      : newPersona === 'strategy' 
      ? 'Strategis Inovasi & Proposal Juara' 
      : newPersona === 'jury' 
      ? 'Simulasi Dewan Juri Kritis' 
      : 'Konsisting Dream AI Coach';

    setChatMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `*Mode persona AI dialihkan ke: **${personaLabel}**.*\n\n${getInitialGreeting(currentComp?.name || 'Kompetisi', newPersona)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Calculate Progress
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Active Competition Switcher */}
      <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Konsisting Dream AI</span>
              </span>
              <span className="text-stone-400 text-xs">·</span>
              <span className="text-xs text-stone-300">Asisten Persiapan Kompetisi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentComp?.name || 'Pilih Kompetisi'}
            </h1>
            <p className="text-xs text-stone-300">
              Penyelenggara: {currentComp?.organiser} · Tenggat: {currentComp?.registrationDeadline}
            </p>
          </div>

          {/* Quick Competition Switcher Dropdown */}
          <div className="shrink-0">
            <label className="block text-[11px] text-stone-400 mb-1">Ganti Target Kompetisi:</label>
            <select
              value={currentComp?.id}
              onChange={(e) => {
                const found = competitions.find(c => c.id === e.target.value);
                if (found) onSelectCompetition(found);
              }}
              className="text-xs py-2 px-3 bg-stone-800 border border-stone-700 text-stone-100 rounded-xl focus:outline-none focus:border-amber-400 max-w-xs truncate"
            >
              {competitions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar & Disclaimer */}
        <div className="pt-2 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-stone-300">Kemajuan Persiapan:</span>
            <div className="w-36 bg-stone-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono tabular-nums text-amber-400 font-semibold">{progressPercent}%</span>
            <span className="text-stone-400 text-[11px]">({completedCount}/{tasks.length} tugas)</span>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Syarat Resmi terpisah jelas dari Rekomendasi Taktis AI</span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3.5 py-2 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'checklist' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Checklist 4-Fase</span>
        </button>

        <button
          onClick={() => setActiveTab('analyser')}
          className={`px-3.5 py-2 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'analyser' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Handbook Analyser</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-2 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'timeline' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Linimasa Sprint</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-3.5 py-2 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'qa' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-amber-600" />
          <span>Gemini Chatbot (Multi-Turn)</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3.5 py-2 font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'resources' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Sumber Belajar</span>
        </button>
      </div>

      {/* TAB 1: 4-PHASE CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Checklist Persiapan Terstruktur
              </h2>
              <p className="text-xs text-stone-500">
                Lacak setiap langkah dari riset ide hingga penyerahan berkas resmi ke panitia.
              </p>
            </div>

            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="px-3.5 py-2 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas Pribadi</span>
            </button>
          </div>

          {/* Add custom task form */}
          {showAddTask && (
            <form onSubmit={addTask} className="p-4 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-stone-900">Tambah Langkah Persiapan Baru</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nama tugas (misal: Selesaikan Bab 2 Metodologi Penelitian)"
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                  />
                </div>
                <div>
                  <select
                    value={newTaskPhase}
                    onChange={(e) => setNewTaskPhase(e.target.value as any)}
                    className="w-full text-xs p-2 border border-stone-200 rounded-lg bg-stone-50 focus:outline-none"
                  >
                    <option value="Research">Fase 1: Research (Riset)</option>
                    <option value="Learn">Fase 2: Learn (Pelajari)</option>
                    <option value="Prepare">Fase 3: Prepare (Siapkan)</option>
                    <option value="Submit">Fase 4: Submit (Kirim)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          )}

          {/* 4 Phases Accordions / Groups */}
          {(['Research', 'Learn', 'Prepare', 'Submit'] as const).map(phaseKey => {
            const phaseTasks = tasks.filter(t => t.phase === phaseKey);
            const phaseName = 
              phaseKey === 'Research' ? 'Fase 1: Riset & Analisis Juknis' :
              phaseKey === 'Learn' ? 'Fase 2: Pembelajaran Keterampilan Inti' :
              phaseKey === 'Prepare' ? 'Fase 3: Pengerjaan Karya & Uji Coba' :
              'Fase 4: Finalisasi & Pengiriman Berkas Resmi';

            return (
              <div key={phaseKey} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                      {phaseKey === 'Research' ? '1' : phaseKey === 'Learn' ? '2' : phaseKey === 'Prepare' ? '3' : '4'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">{phaseName}</h3>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                    {phaseTasks.filter(t => t.isCompleted).length}/{phaseTasks.length} selesai
                  </span>
                </div>

                <div className="p-4 space-y-3 divide-y divide-stone-100">
                  {phaseTasks.map(task => (
                    <div key={task.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="mt-0.5 text-stone-400 hover:text-stone-900 focus:outline-none transition-colors"
                          aria-label={task.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 hover:text-stone-600" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs sm:text-sm font-semibold ${
                              task.isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}>
                              {task.title}
                            </span>

                            {/* Separation: Official Requirement vs AI Recommendation */}
                            {task.isOfficialRequirement ? (
                              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium px-2 py-0.2 rounded">
                                Syarat Resmi
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-medium px-2 py-0.2 rounded">
                                Saran Taktis AI
                              </span>
                            )}

                            {task.recommendedDueDate && (
                              <span className="text-[10px] text-stone-400 font-mono tabular-nums ml-auto">
                                Target: {task.recommendedDueDate}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Importance Reason Box */}
                          <div className="p-2 bg-stone-50 rounded-lg text-[11px] text-stone-500 flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Mengapa penting:</strong> {task.importanceReason}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: HANDBOOK ANALYSER */}
      {activeTab === 'analyser' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Handbook & Juknis Analyser
            </h2>
            <p className="text-xs text-stone-500">
              Ekstraksi otomatis kriteria penilaian, dokumen wajib, bobot skor, dan batasan krusial dari buku panduan resmi.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Tautan Buku Panduan (URL Handbook Resmi):
                </label>
                <input
                  type="url"
                  value={handbookInputUrl}
                  onChange={(e) => setHandbookInputUrl(e.target.value)}
                  placeholder="https://puspresnas.kemdikbud.go.id/juknis-resmi.pdf"
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-1">
                  Atau Salin Kutipan Teks Juknis / Ketentuan Khusus:
                </label>
                <textarea
                  rows={4}
                  value={handbookInputText}
                  onChange={(e) => setHandbookInputText(e.target.value)}
                  placeholder="Tempel teks bab rubrik penilaian atau persyaratan berkas di sini..."
                  className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={runHandbookAnalysis}
                  disabled={analysing}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{analysing ? 'Menganalisis Juknis...' : 'Bedah Juknis dengan AI'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6 animate-fadeIn shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Hasil Ekstraksi Petunjuk Teknis Resmi
                  </h3>
                </div>
                <span className="text-xs text-stone-400">Model: Gemini 3.8 Flash</span>
              </div>

              {/* Rangkuman Syarat */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-stone-900">Rangkuman Kelayakan Peserta:</div>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
                  {analysisResult.eligibilitySummary}
                </p>
              </div>

              {/* Rubrik Penilaian */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-stone-900">Bobot & Rubrik Penilaian Dewan Juri:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analysisResult.scoringRubric.map((r, i) => (
                    <div key={i} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                        <span>{r.criterion}</span>
                        <span className="font-mono text-amber-700">{r.weightPercent}%</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-snug">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Warnings */}
              {analysisResult.criticalWarnings && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-xs text-rose-950">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Hal Krusial yang Dapat Menggugurkan Peserta:</span>
                  </div>
                  <div className="space-y-1 pl-5 list-disc">
                    {analysisResult.criticalWarnings.map((w, idx) => (
                      <div key={idx}>• {w}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-stone-900">Dokumen yang Wajib Disiapkan:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  {analysisResult.requiredDocuments.map((d, i) => (
                    <div key={i} className="p-2 rounded bg-stone-50 border border-stone-100 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 italic">
                {analysisResult.officialDisclaimer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMELINE SPRINT ROADMAP */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Linimasa Persiapan Mingguan (Sprint Roadmap)
            </h2>
            <p className="text-xs text-stone-500">
              Rencana aksi berbasis waktu menuju tanggal penutupan pendaftaran ({currentComp?.registrationDeadline}).
            </p>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
            {timeline.map((mile) => (
              <div key={mile.weekNumber} className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 z-10 shadow-xs">
                  W{mile.weekNumber}
                </div>

                <div className="flex-1 bg-white border border-stone-200 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      {mile.title}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-500">
                      Target: H-{mile.targetDaysRemaining} Deadline
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong>Fokus Utama:</strong> {mile.focus}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 text-[11px]">
                    {mile.tasks.map((t, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GEMINI MULTI-TURN CHATBOT (AI ASSISTANT COACH) */}
      {activeTab === 'qa' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col h-[640px]">
          {/* Chat Header & Persona Selector */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      Konsisting Dream AI Coach
                    </h3>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      gemini-3.8-flash
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Target: <strong className="text-stone-700">{currentComp?.name}</strong> · Memelihara riwayat multi-turn
                  </p>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Hapus riwayat obrolan dan mulai sesi baru"
                  className="px-2.5 py-1.5 text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors flex items-center gap-1.5 border border-stone-200 bg-white"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Mulai Ulang</span>
                </button>
              </div>
            </div>

            {/* Persona Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
              <span className="text-[11px] text-stone-400 shrink-0 font-medium mr-1">Peran:</span>
              <button
                type="button"
                onClick={() => handleSelectPersona('general')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  rolePersona === 'general'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Coach Umum</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPersona('juknis')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  rolePersona === 'juknis'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <FileCheck className="w-3 h-3 text-emerald-400" />
                <span>Konsultan Juknis</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPersona('strategy')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  rolePersona === 'strategy'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-amber-300" />
                <span>Strategi Proposal</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPersona('jury')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  rolePersona === 'jury'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Scale className="w-3 h-3 text-rose-300" />
                <span>Simulasi Juri</span>
              </button>
            </div>
          </div>

          {/* Scrollable Chat Thread Container */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed bg-[#fcfbfa]">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-stone-900 text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-stone-900 rounded-tl-none border border-stone-200 shadow-2xs'
                  }`}>
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                  {msg.timestamp && (
                    <div className={`text-[10px] text-stone-400 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {asking && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-white border border-stone-200 text-stone-600 p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-stone-500 ml-1">
                    {rolePersona === 'jury' ? 'Dewan juri sedang menelaah kelemahan karya...' : 'Gemini 3.8 Flash sedang memproses respon multi-turn...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Discovery Bar */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-stone-400 shrink-0 font-medium">Saran:</span>
            {rolePersona === 'juknis' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Apa saja berkas administrasi yang paling sering menggugurkan peserta di lomba ini?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Syarat rawan diskualifikasi?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Bolehkah anggota tim berasal dari program studi atau angkatan yang berbeda?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Anggota beda prodi/angkatan?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Berapa batas halaman proposal dan apa ketentuan format penulisan resminya?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Format & batas halaman proposal?
                </button>
              </>
            )}

            {rolePersona === 'strategy' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Bagaimana cara merumuskan kebaruan (novelty) agar proposal kami dinilai bernilai inovasi tinggi?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Cara formulasi novelty ide?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Bantu saya menstrukturkan Executive Summary 1 halaman yang padat dan menarik dewan juri.')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Struktur Executive Summary juara?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Apa yang membedakan presentasi juara 1 dengan finalis biasa pada babak final?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Pembeda juara 1 di final?
                </button>
              </>
            )}

            {rolePersona === 'jury' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Simulasikan 3 pertanyaan kritis dewan juri mengenai kelayakan teknis dan skalabilitas ide kami!')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Tantang kelayakan teknis ide kami
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Bagaimana jika juri menanyakan validitas data riset dan metodologi pengujian?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Pertanyaan validasi metodologi
                </button>
              </>
            )}

            {rolePersona === 'general' && (
              <>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Bagaimana cara menyusun strategi persiapan 4 minggu menuju tenggat pendaftaran?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Linimasa 4 minggu persiapan?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskQuestion(undefined, 'Apa tips komunikasi tim saat membagi tugas proposal dan prototipe?')}
                  className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-stone-400 transition-colors whitespace-nowrap"
                >
                  Tips kolaborasi tim kompetisi?
                </button>
              </>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={(e) => handleAskQuestion(e)} className="p-3 sm:p-4 bg-white border-t border-stone-200 flex gap-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={
                rolePersona === 'jury'
                  ? "Tuliskan ide/solusi tim Anda untuk ditantang oleh dewan juri..."
                  : rolePersona === 'strategy'
                  ? "Tanyakan perumusan ide, struktur proposal, atau kriteria penilaian..."
                  : rolePersona === 'juknis'
                  ? "Tanyakan regulasi juknis, format berkas, atau batas waktu..."
                  : "Tanyakan apa saja seputar persiapan kompetisi ini..."
              }
              className="flex-1 text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={asking || !inputQuestion.trim()}
              className="px-4 py-3 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: LEARNING RESOURCE FINDER */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Kurasi Modul & Sumber Belajar Pendukung
            </h2>
            <p className="text-xs text-stone-500">
              Daftar bacaan, bank soal tahun lalu, dan standar referensi yang relevan untuk {currentComp?.category}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">Bank Soal & Studi Kasus Edisi Lalu</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Akses arsip soal penyisihan dan final edisi sebelumnya untuk mengukur tingkat kesulitan dan estimasi durasi pengerjaan.
              </p>
              <div className="pt-2">
                <a
                  href={currentComp?.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-900 underline hover:text-amber-800 font-medium inline-flex items-center gap-1"
                >
                  <span>Buka Repositori Resmi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">Standar Format Proposal & Karya Tulis</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Templat struktur dokumen ilmiah (Latar Belakang, Metodologi, Rancangan Prototipe, Analisis Dampak, dan Daftar Pustaka APA 7th).
              </p>
              <div className="pt-2 text-xs text-stone-500 font-mono">
                Format: PDF · Maksimal 15MB
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-stone-900">Tips Sesi Tanya Jawab (Q&A Juri)</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Strategi menjawab pertanyaan jebakan dewan juri, pembagian giliran bicara anggota tim, dan teknik validasi data empiris.
              </p>
              <div className="pt-2 text-xs text-stone-500">
                Durasi ideal: 5 menit paparan + 10 menit Q&A
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
