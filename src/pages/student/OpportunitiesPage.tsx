import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Briefcase, Building2, Timer, ExternalLink, CalendarDays, X, Search, Sparkles, Code2, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManageableGrid, ManageableCardOverlay, DeleteConfirmModal } from '../../components/ManageableGrid';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  opportunity_type: 'internship' | 'job' | 'hackathon' | 'scholarship';
  description: string;
  apply_url: string;
  deadline: string | null;
}

export const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  // INTERNSHIPS
  {
    id: 'opp-1',
    title: "Google Summer of Code (GSoC) 2026/2027",
    company_name: "Google Open Source",
    opportunity_type: "internship",
    description: "Global, stipended online program focused on bringing new contributors into open source software development. Work with mentor organizations on 12-week coding projects with international recognition.",
    apply_url: "https://summerofcode.withgoogle.com/",
    deadline: new Date(Date.now() + 45 * 86400000).toISOString()
  },
  {
    id: 'opp-2',
    title: "Software Engineering Intern - Summer 2027",
    company_name: "Microsoft",
    opportunity_type: "internship",
    description: "Join Microsoft engineering teams building Azure, Office 365, and AI platforms. Engage in real-world shipping software, architecture reviews, 1:1 mentorship, and competitive monthly stipends with housing support.",
    apply_url: "https://careers.microsoft.com/students/us/en",
    deadline: new Date(Date.now() + 35 * 86400000).toISOString()
  },
  {
    id: 'opp-3',
    title: "Student Software Development Engineer (SDE) Intern",
    company_name: "Amazon",
    opportunity_type: "internship",
    description: "Work on ultra-scale distributed backend systems, AWS infrastructure, and e-commerce algorithmic pipelines. Solve customer-facing problems with industry leading tech stacks and full-time conversion opportunities.",
    apply_url: "https://www.amazon.jobs/en/teams/internships-for-students",
    deadline: new Date(Date.now() + 28 * 86400000).toISOString()
  },
  {
    id: 'opp-4',
    title: "Uber STAR Software Engineering Intern",
    company_name: "Uber",
    opportunity_type: "internship",
    description: "Accelerated engineering internship for undergraduate students focusing on ride-matching algorithms, map telemetry, distributed systems, and modern mobile/web microservices.",
    apply_url: "https://www.uber.com/us/en/careers/",
    deadline: new Date(Date.now() + 21 * 86400000).toISOString()
  },
  {
    id: 'opp-5',
    title: "ISRO Student Research & Technical Internship",
    company_name: "Indian Space Research Organisation (ISRO)",
    opportunity_type: "internship",
    description: "Hands-on research internship at ISRO centres (VSSC, URSC, SAC) for pre-final and final year engineering students focusing on satellite communications, embedded telemetry, and avionics software.",
    apply_url: "https://www.isro.gov.in/Internship.html",
    deadline: new Date(Date.now() + 50 * 86400000).toISOString()
  },

  // JOBS
  {
    id: 'opp-6',
    title: "Graduate Software Engineer 2026/2027",
    company_name: "Cisco Systems",
    opportunity_type: "job",
    description: "Design and develop high-throughput network operating systems, cybersecurity tools, and cloud infrastructure. Open to graduating batch students in CS/IT/ECE with proficiency in Python, C++, or Go.",
    apply_url: "https://jobs.cisco.com/",
    deadline: new Date(Date.now() + 30 * 86400000).toISOString()
  },
  {
    id: 'opp-7',
    title: "Engineering Analyst Program 2026",
    company_name: "Goldman Sachs",
    opportunity_type: "job",
    description: "Work at the intersection of finance and cutting-edge tech. Build low-latency financial exchanges, quantitative models, machine learning risk engines, and enterprise security platforms.",
    apply_url: "https://www.goldmansachs.com/careers/students/programs/",
    deadline: new Date(Date.now() + 25 * 86400000).toISOString()
  },
  {
    id: 'opp-8',
    title: "Associate Software Engineer - New Grad",
    company_name: "Atlassian",
    opportunity_type: "job",
    description: "Build tools loved by millions of developers worldwide (Jira, Confluence, Trello, Bitbucket). Collaborate in remote-first agile teams with world-class engineering mentorship and equity packages.",
    apply_url: "https://www.atlassian.com/company/careers",
    deadline: new Date(Date.now() + 40 * 86400000).toISOString()
  },
  {
    id: 'opp-9',
    title: "Specialist Programmer (SP) & Digital Specialist",
    company_name: "Infosys",
    opportunity_type: "job",
    description: "High-tier software engineering roles via HackWithInfy and National Qualifier. Work on cloud-native apps, generative AI integrations, blockchain, and enterprise digital transformation.",
    apply_url: "https://www.infosys.com/careers/",
    deadline: new Date(Date.now() + 38 * 86400000).toISOString()
  },
  {
    id: 'opp-10',
    title: "TCS Digital & Prime Engineering Cadre",
    company_name: "Tata Consultancy Services (TCS)",
    opportunity_type: "job",
    description: "Specialized R&D and digital engineering tracks for top coders. Premium compensation bands with opportunities in AI, IoT, automated cloud migration, and fintech architecture.",
    apply_url: "https://www.tcs.com/careers/entry-level",
    deadline: new Date(Date.now() + 20 * 86400000).toISOString()
  },

  // HACKATHONS
  {
    id: 'opp-11',
    title: "Major League Hacking (MLH) Global League 2026",
    company_name: "Major League Hacking (MLH)",
    opportunity_type: "hackathon",
    description: "The world's largest student hackathon league. Compete every weekend in virtual and in-person hackathons, earn swag, network with tech recruiters, and win prizes totaling over $250,000.",
    apply_url: "https://mlh.io/seasons/2026/events",
    deadline: new Date(Date.now() + 60 * 86400000).toISOString()
  },
  {
    id: 'opp-12',
    title: "Smart India Hackathon (SIH) 2026",
    company_name: "Ministry of Education, Govt. of India",
    opportunity_type: "hackathon",
    description: "Nationwide initiative providing students a platform to solve pressing real-world challenges faced by ministries, departments, and leading industries. Cash prizes of Rs. 1 Lakh per problem statement.",
    apply_url: "https://www.sih.gov.in/",
    deadline: new Date(Date.now() + 42 * 86400000).toISOString()
  },
  {
    id: 'opp-13',
    title: "Google Solution Challenge 2026",
    company_name: "Google Developer Student Clubs",
    opportunity_type: "hackathon",
    description: "Build innovative solutions for one or more of the United Nations 17 Sustainable Development Goals using Google products (Flutter, TensorFlow, Android, Firebase, Cloud). Top 100 teams win Google mentorship and cash awards.",
    apply_url: "https://developers.google.com/community/gdsc-solution-challenge",
    deadline: new Date(Date.now() + 55 * 86400000).toISOString()
  },
  {
    id: 'opp-14',
    title: "ETHGlobal AI & Web3 Global Hackathon",
    company_name: "ETHGlobal",
    opportunity_type: "hackathon",
    description: "Premier hackathon bringing together AI agents, zero-knowledge proofs, and decentralized applications. Free to join for students, featuring workshops, developer grants, and bounties over $300,000.",
    apply_url: "https://ethglobal.com/",
    deadline: new Date(Date.now() + 22 * 86400000).toISOString()
  },
  {
    id: 'opp-15',
    title: "Devfolio National Hackathon Circuit",
    company_name: "Devfolio",
    opportunity_type: "hackathon",
    description: "Direct application portal for prestigious university and national-level hackathons across India and international student ecosystems. Instant team registration and live judging rounds.",
    apply_url: "https://devfolio.co/hackathons",
    deadline: new Date(Date.now() + 32 * 86400000).toISOString()
  },

  // SCHOLARSHIPS
  {
    id: 'opp-16',
    title: "Generation Google Scholarship (APAC / Global)",
    company_name: "Google Build Your Future",
    opportunity_type: "scholarship",
    description: "Designed to help aspiring students pursuing computer science degrees excel in technology. Recipients receive a $2,500 USD award for the academic year along with Google community retreat participation.",
    apply_url: "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship-apac",
    deadline: new Date(Date.now() + 65 * 86400000).toISOString()
  },
  {
    id: 'opp-17',
    title: "Reliance Foundation Undergraduate Scholarship in Tech",
    company_name: "Reliance Foundation",
    opportunity_type: "scholarship",
    description: "Prestigious scholarship for meritorious undergraduate students in engineering & IT fields. Provides up to Rs. 2,00,000 grant over the degree duration, plus exclusive leadership development mentoring.",
    apply_url: "https://www.scholarships.reliancefoundation.org/",
    deadline: new Date(Date.now() + 48 * 86400000).toISOString()
  },
  {
    id: 'opp-18',
    title: "Adobe Women-in-Technology Scholarship",
    company_name: "Adobe Research",
    opportunity_type: "scholarship",
    description: "Recognizing outstanding female undergraduate and graduate students in Computer Science. Includes $10,000 USD award, Creative Cloud subscription, mentorship, and opportunity to interview for Adobe internship.",
    apply_url: "https://www.adobe.com/careers/university/women-in-technology.html",
    deadline: new Date(Date.now() + 58 * 86400000).toISOString()
  },
  {
    id: 'opp-19',
    title: "Narotam Sekhsaria Foundation Excellence Scholarship",
    company_name: "Narotam Sekhsaria Foundation",
    opportunity_type: "scholarship",
    description: "Merit-based financial assistance and interest-free loan scholarships for high-achieving Indian students pursuing postgraduate and professional engineering degrees at top institutions.",
    apply_url: "https://pg.nsfoundation.co.in/",
    deadline: new Date(Date.now() + 70 * 86400000).toISOString()
  },
  {
    id: 'opp-20',
    title: "GitHub Campus Grant & Student Developer Pack",
    company_name: "GitHub Education",
    opportunity_type: "scholarship",
    description: "Free access to the best developer tools from GitHub, Microsoft Azure ($100 credit), JetBrains, DigitalOcean, Stripe, Namecheap, and more, valued at over $200,000 for verified college students.",
    apply_url: "https://education.github.com/pack",
    deadline: new Date(Date.now() + 90 * 86400000).toISOString()
  },
  {
    id: 'opp-21',
    title: "Nutanix Advancing Women in Tech Scholarship",
    company_name: "Nutanix",
    opportunity_type: "scholarship",
    description: "Empowering women leaders in cloud architectures and computing. Up to $3,000 tuition grant awarded to passionate engineering candidates demonstrating academic excellence and community impact.",
    apply_url: "https://www.nutanix.com/scholarships",
    deadline: new Date(Date.now() + 52 * 86400000).toISOString()
  }
];

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'internship':
      return {
        label: 'Internship',
        icon: Briefcase,
        border: 'border-sky-500/30 hover:border-sky-500/60',
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        btn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/50',
        avatarBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      };
    case 'job':
      return {
        label: 'Full-Time Job',
        icon: Building2,
        border: 'border-indigo-500/30 hover:border-indigo-500/60',
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50',
        avatarBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      };
    case 'hackathon':
      return {
        label: 'Hackathon',
        icon: Code2,
        border: 'border-amber-500/30 hover:border-amber-500/60',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50',
        avatarBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    case 'scholarship':
      return {
        label: 'Scholarship',
        icon: GraduationCap,
        border: 'border-emerald-500/30 hover:border-emerald-500/60',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50',
        avatarBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    default:
      return {
        label: 'Opportunity',
        icon: Briefcase,
        border: 'border-purple-500/30 hover:border-purple-500/60',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        btn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50',
        avatarBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      };
  }
};

export const OpportunitiesPage: React.FC = () => {
  const { role } = useAuth();
  const { subscribe } = useRealtime();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'internship' | 'job' | 'hackathon' | 'scholarship'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [deletingOpp, setDeletingOpp] = useState<Opportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    opportunity_type: 'internship' as Opportunity['opportunity_type'],
    description: '',
    apply_url: '',
    deadline: ''
  });

  const canManage = role === 'admin' || role === 'committee';

  const fetchOpportunities = async () => {
    try {
      const typeParam = activeTab === 'all' ? '' : `?opportunity_type=${activeTab}`;
      const res = await api.get(`/opportunities${typeParam}`);
      const items = res.data.items || [];
      if (items.length > 0) {
        setOpportunities(items);
      } else {
        const filteredDefaults = activeTab === 'all' 
          ? DEFAULT_OPPORTUNITIES 
          : DEFAULT_OPPORTUNITIES.filter(o => o.opportunity_type === activeTab);
        setOpportunities(filteredDefaults);
      }
    } catch (err) {
      console.error('Failed to fetch opportunities, using fallback catalog', err);
      const filteredDefaults = activeTab === 'all' 
        ? DEFAULT_OPPORTUNITIES 
        : DEFAULT_OPPORTUNITIES.filter(o => o.opportunity_type === activeTab);
      setOpportunities(filteredDefaults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOpportunities();
    const unsubscribe = subscribe('opportunities', () => fetchOpportunities());
    return () => unsubscribe();
  }, [subscribe, activeTab]);

  // Dynamic tab counters
  const counts = useMemo(() => {
    return {
      all: opportunities.length,
      internship: opportunities.filter(o => o.opportunity_type === 'internship').length,
      job: opportunities.filter(o => o.opportunity_type === 'job').length,
      hackathon: opportunities.filter(o => o.opportunity_type === 'hackathon').length,
      scholarship: opportunities.filter(o => o.opportunity_type === 'scholarship').length,
    };
  }, [opportunities]);

  const tabs = [
    { id: 'all', label: 'All', icon: Briefcase },
    { id: 'internship', label: 'Internships', icon: Briefcase },
    { id: 'job', label: 'Jobs', icon: Building2 },
    { id: 'hackathon', label: 'Hackathons', icon: Code2 },
    { id: 'scholarship', label: 'Scholarships', icon: GraduationCap },
  ];

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        opp.title.toLowerCase().includes(q) || 
        opp.company_name.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [opportunities, searchQuery]);

  const openAddModal = () => {
    setEditingOpp(null);
    setFormData({
      title: '',
      company_name: '',
      opportunity_type: 'internship',
      description: '',
      apply_url: '',
      deadline: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setEditingOpp(opp);
    setFormData({
      title: opp.title,
      company_name: opp.company_name,
      opportunity_type: opp.opportunity_type,
      description: opp.description,
      apply_url: opp.apply_url,
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().slice(0, 16) : ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      if (editingOpp) {
        await api.put(`/opportunities/${editingOpp.id}`, payload);
      } else {
        await api.post('/opportunities', payload);
      }
      setIsModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      console.error('Failed to save opportunity', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOpp) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/opportunities/${deletingOpp.id}`);
      setIsDeleteModalOpen(false);
      setDeletingOpp(null);
      fetchOpportunities();
    } catch (err) {
      console.error('Failed to delete opportunity', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ManageableGrid
        title="Student Opportunities"
        description="Verified internships, new grad jobs, prestigious hackathons, and scholarship grants with direct apply portals."
        icon={Briefcase}
        iconColorClass="text-purple-400"
        iconBgClass="bg-purple-500/10"
        canManage={canManage}
        onAdd={openAddModal}
        addLabel="Add Opportunity"
        rightContent={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search roles, companies..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 gap-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const tabCount = counts[tab.id as keyof typeof counts] || 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="oppTab"
                        className="absolute inset-0 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/50"
                        transition={{ type: "spring", duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    <span className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tabCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col p-6 rounded-3xl bg-slate-900 border border-slate-800 h-64">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-36 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
                <div className="space-y-2 mb-6 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={searchQuery ? "No matching opportunities" : "No opportunities found"}
            description={searchQuery ? `No opportunities found matching "${searchQuery}". Try different keywords.` : `Check back later for new ${activeTab !== 'all' ? activeTab + 's' : 'opportunities'}.`}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOpportunities.map(opp => {
                const config = getTypeConfig(opp.opportunity_type);
                const hasDeadlinePassed = opp.deadline ? new Date(opp.deadline) < new Date() : false;
                const isClosingSoon = opp.deadline 
                  ? (!hasDeadlinePassed && (new Date(opp.deadline).getTime() - Date.now()) < 14 * 86400000)
                  : false;
                
                return (
                  <motion.div
                    key={opp.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col p-6 rounded-3xl bg-slate-900 border ${config.border} hover:shadow-xl hover:shadow-purple-950/20 transition-all duration-300 group relative`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex items-start gap-3.5 pr-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-black text-lg shrink-0 ${config.avatarBg}`}>
                          {opp.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors leading-snug">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                            <span>{opp.company_name}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 inline" /> Verified
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 mb-5 flex-1 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Footer / Apply action */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        {opp.deadline ? (
                          <span className={`flex items-center gap-1.5 ${
                            hasDeadlinePassed 
                              ? 'text-rose-500' 
                              : isClosingSoon 
                              ? 'text-amber-400 font-bold' 
                              : 'text-slate-400'
                          }`}>
                            {hasDeadlinePassed ? (
                              <>
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span>Deadline Passed</span>
                              </>
                            ) : (
                              <>
                                <Timer className="w-3.5 h-3.5 text-purple-400" />
                                <span>
                                  {isClosingSoon ? 'Closing Soon: ' : 'Apply by: '}
                                  {new Date(opp.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Rolling Admissions
                          </span>
                        )}
                      </div>
                      
                      <a
                        href={opp.apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                          hasDeadlinePassed 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none'
                            : `${config.btn} hover:scale-[1.02]`
                        }`}
                      >
                        <span>Apply Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <ManageableCardOverlay
                      canManage={canManage}
                      onEdit={() => openEditModal(opp)}
                      onDelete={() => {
                        setDeletingOpp(opp);
                        setIsDeleteModalOpen(true);
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </ManageableGrid>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingOpp ? 'Edit Opportunity' : 'Add Opportunity'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company / Org</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formData.opportunity_type}
                    onChange={e => setFormData({ ...formData, opportunity_type: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Job</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="scholarship">Scholarship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Direct Apply URL</label>
                <input
                  type="url"
                  required
                  value={formData.apply_url}
                  onChange={e => setFormData({ ...formData, apply_url: e.target.value })}
                  placeholder="https://careers.google.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deadline (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the opportunity, eligibility criteria, stipends or prizes..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingOpp ? 'Save Changes' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${deletingOpp?.title}" at ${deletingOpp?.company_name}? This action cannot be undone.`}
        isDeleting={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingOpp(null);
        }}
      />
    </>
  );
};
