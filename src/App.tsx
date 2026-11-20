/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ExploreCompetitionsView } from './components/ExploreCompetitionsView';
import { MyOpportunitiesView } from './components/MyOpportunitiesView';
import { AiAssistantView } from './components/AiAssistantView';
import { ProfileView } from './components/ProfileView';
import { InterestQuizModal } from './components/InterestQuizModal';
import { CompetitionDetailModal } from './components/CompetitionDetailModal';
import { AdminVerificationModal } from './components/AdminVerificationModal';

import { INITIAL_COMPETITIONS } from './data/competitions';
import { Competition, UserPreferences, OpportunityStatus } from './utils/recommendationEngine';
import { UserAccount, UserOpportunity, AppNotification } from './types';
import { generatePreparationPlan, PreparationTask } from './utils/checklistGenerator';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = React.useState<'home' | 'explore' | 'opportunities' | 'ai-assistant' | 'profile'>('home');

  // Competitions state (persisted or seeded)
  const [competitions, setCompetitions] = React.useState<Competition[]>(() => {
    const saved = localStorage.getItem('kd_competitions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_COMPETITIONS;
  });

  // User Account state
  const [user, setUser] = React.useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('kd_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'guest-user-1',
      name: 'Tamu Berprestasi',
      email: 'tamu@konsistingdream.id',
      isGuest: true,
      role: 'student',
      createdAt: new Date().toISOString()
    };
  });

  // User Preferences (from quiz or profile)
  const [userPreferences, setUserPreferences] = React.useState<UserPreferences | null>(() => {
    const saved = localStorage.getItem('kd_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      educationLevel: 'D3/D4/S1',
      gradeOrSemester: 'Semester 4',
      age: 20,
      country: 'Indonesia',
      province: 'DKI Jakarta',
      city: 'Jakarta',
      selectedCategories: ['Technology & Computer Science'],
      selectedSubcategories: ['Software Development', 'Data Science', 'AI'],
      experienceLevel: 'Intermediate',
      formatPreference: 'All',
      costPreference: 'Free',
      scopePreference: 'National',
      participationPreference: 'All',
      weeklyHoursAvailable: 12,
      budgetMaxIdr: 200000
    };
  });

  // Saved Opportunities & Pipelines
  const [savedOpportunities, setSavedOpportunities] = React.useState<UserOpportunity[]>(() => {
    const saved = localStorage.getItem('kd_opportunities');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Seed default 1 saved opportunity (GEMASTIK)
    const gem = INITIAL_COMPETITIONS[0];
    const plan = generatePreparationPlan(gem);
    return [
      {
        competitionId: gem.id,
        status: 'Preparing',
        savedAt: '2025-04-10',
        personalNotes: 'Fokus pada pengembangan prototipe AI dan konsultasi berkas KTM dengan BEM.',
        checklistProgressPercent: 25,
        tasks: plan.tasks,
        timeline: plan.timeline
      }
    ];
  });

  // In-app notifications
  const [notifications, setNotifications] = React.useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Tenggat Pendaftaran GEMASTIK XVIII',
      message: 'Pendaftaran gelombang utama ditutup dalam 15 hari. Pastikan surat pengantar dekanat telah selesai.',
      timestamp: '2 jam yang lalu',
      type: 'deadline',
      isRead: false
    },
    {
      id: 'notif-2',
      title: 'Juknis Resmi OSN 2025 Dirilis',
      message: 'Puspresnas merilis addendum silabus kompetisi sains jenjang SMA.',
      timestamp: '1 hari yang lalu',
      type: 'verified_update',
      isRead: false
    }
  ]);

  // Modal triggers
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [selectedCompetitionDetail, setSelectedCompetitionDetail] = React.useState<Competition | null>(null);
  const [activeAiCompetition, setActiveAiCompetition] = React.useState<Competition | null>(competitions[0]);

  // Explore Filter Forwarding
  const [exploreFilter, setExploreFilter] = React.useState<{ category?: string; query?: string }>({});

  // Sync state to localStorage
  React.useEffect(() => {
    localStorage.setItem('kd_competitions', JSON.stringify(competitions));
  }, [competitions]);

  React.useEffect(() => {
    if (userPreferences) {
      localStorage.setItem('kd_preferences', JSON.stringify(userPreferences));
    }
  }, [userPreferences]);

  React.useEffect(() => {
    if (user) {
      localStorage.setItem('kd_user', JSON.stringify(user));
    }
  }, [user]);

  React.useEffect(() => {
    localStorage.setItem('kd_opportunities', JSON.stringify(savedOpportunities));
  }, [savedOpportunities]);

  // Check URL params for ?autostart=1 or tab navigation
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'explore') {
      setCurrentTab('explore');
    } else if (params.get('tab') === 'ai') {
      setCurrentTab('ai-assistant');
    }
  }, []);

  // Handlers
  const handleSavePreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
  };

  const handleRegisterAccount = (name: string, email: string, prefs: UserPreferences) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      isGuest: false,
      role: 'student',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    setUserPreferences(prefs);
  };

  const handleToggleBookmark = (comp: Competition) => {
    const exists = savedOpportunities.find(o => o.competitionId === comp.id);
    if (exists) {
      setSavedOpportunities(savedOpportunities.filter(o => o.competitionId !== comp.id));
    } else {
      const plan = generatePreparationPlan(comp);
      const newOpp: UserOpportunity = {
        competitionId: comp.id,
        status: 'Saved',
        savedAt: new Date().toISOString().split('T')[0],
        personalNotes: '',
        checklistProgressPercent: 0,
        tasks: plan.tasks,
        timeline: plan.timeline
      };
      setSavedOpportunities([...savedOpportunities, newOpp]);
    }
  };

  const handleUpdateOpportunityStatus = (compId: string, status: OpportunityStatus) => {
    setSavedOpportunities(savedOpportunities.map(o => 
      o.competitionId === compId ? { ...o, status } : o
    ));
  };

  const handleUpdateOpportunityNotes = (compId: string, personalNotes: string) => {
    setSavedOpportunities(savedOpportunities.map(o => 
      o.competitionId === compId ? { ...o, personalNotes } : o
    ));
  };

  const handleRemoveOpportunity = (compId: string) => {
    setSavedOpportunities(savedOpportunities.filter(o => o.competitionId !== compId));
  };

  const handleUpdateOpportunityTasks = (compId: string, tasks: PreparationTask[]) => {
    const completed = tasks.filter(t => t.isCompleted).length;
    const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    setSavedOpportunities(savedOpportunities.map(o => 
      o.competitionId === compId ? { ...o, tasks, checklistProgressPercent: percent } : o
    ));
  };

  const handlePrepareCompetition = (comp: Competition) => {
    setActiveAiCompetition(comp);
    // ensure it's in opportunities if not already
    const exists = savedOpportunities.find(o => o.competitionId === comp.id);
    if (!exists) {
      const plan = generatePreparationPlan(comp);
      setSavedOpportunities([...savedOpportunities, {
        competitionId: comp.id,
        status: 'Preparing',
        savedAt: new Date().toISOString().split('T')[0],
        personalNotes: '',
        checklistProgressPercent: 0,
        tasks: plan.tasks,
        timeline: plan.timeline
      }]);
    }
    setCurrentTab('ai-assistant');
  };

  const handleNavigateExplore = (filter?: { category?: string; query?: string }) => {
    if (filter) setExploreFilter(filter);
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCompetition = (newComp: Competition) => {
    setCompetitions([newComp, ...competitions]);
  };

  const handleUpdateCompetition = (updated: Competition) => {
    setCompetitions(competitions.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCompetition = (id: string) => {
    setCompetitions(competitions.filter(c => c.id !== id));
  };

  const savedIds = savedOpportunities.map(o => o.competitionId);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1e293b]">
      
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        notifications={notifications}
        user={user}
        savedCount={savedOpportunities.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            competitions={competitions}
            onOpenQuiz={() => setIsQuizOpen(true)}
            onNavigateExplore={handleNavigateExplore}
            onSelectCompetition={(comp) => setSelectedCompetitionDetail(comp)}
            onPrepareCompetition={handlePrepareCompetition}
            userPreferences={userPreferences}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreCompetitionsView
            competitions={competitions}
            userPreferences={userPreferences}
            savedCompetitionIds={savedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCompetition={(comp) => setSelectedCompetitionDetail(comp)}
            onPrepareCompetition={handlePrepareCompetition}
            initialCategory={exploreFilter.category}
            initialQuery={exploreFilter.query}
          />
        )}

        {currentTab === 'opportunities' && (
          <MyOpportunitiesView
            opportunities={savedOpportunities}
            competitions={competitions}
            onUpdateStatus={handleUpdateOpportunityStatus}
            onUpdateNotes={handleUpdateOpportunityNotes}
            onRemoveOpportunity={handleRemoveOpportunity}
            onSelectCompetition={(comp) => setSelectedCompetitionDetail(comp)}
            onPrepareCompetition={handlePrepareCompetition}
            onNavigateExplore={() => handleNavigateExplore()}
          />
        )}

        {currentTab === 'ai-assistant' && (
          <AiAssistantView
            activeCompetition={activeAiCompetition}
            competitions={competitions}
            onSelectCompetition={(comp) => setActiveAiCompetition(comp)}
            savedOpportunities={savedOpportunities}
            onUpdateOpportunityTasks={handleUpdateOpportunityTasks}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            preferences={userPreferences}
            onUpdatePreferences={handleSavePreferences}
            onOpenQuiz={() => setIsQuizOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}
      </main>

      {/* Comprehensive Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateExplore={() => handleNavigateExplore()}
      />

      {/* Modals */}
      <InterestQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSavePreferences={handleSavePreferences}
        onRegisterAccount={handleRegisterAccount}
        initialPreferences={userPreferences}
        currentUser={user}
        competitions={competitions}
        onSelectCompetition={(c) => setSelectedCompetitionDetail(c)}
      />

      <CompetitionDetailModal
        competition={selectedCompetitionDetail}
        onClose={() => setSelectedCompetitionDetail(null)}
        onPrepare={handlePrepareCompetition}
        onToggleBookmark={handleToggleBookmark}
        isSaved={selectedCompetitionDetail ? savedIds.includes(selectedCompetitionDetail.id) : false}
        userPreferences={userPreferences}
      />

      <AdminVerificationModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        competitions={competitions}
        onAddCompetition={handleAddCompetition}
        onUpdateCompetition={handleUpdateCompetition}
        onDeleteCompetition={handleDeleteCompetition}
      />

    </div>
  );
}
