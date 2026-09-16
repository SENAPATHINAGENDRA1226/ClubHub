import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Calendar, MapPin, Clock, Users, ArrowRight, Bell, X, Maximize2, Download, ExternalLink } from 'lucide-react';
import { ManageableGrid, ManageableCardOverlay, DeleteConfirmModal } from '../../components/ManageableGrid';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getMediaUrl } from '../../utils/media';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  category: 'upcoming' | 'current' | 'past';
  max_participants: number | null;
  registration_deadline: string;
  banner_image_url: string | null;
  registration_link?: string | null;
}

const DEFAULT_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
];

const getEventBannerUrl = (event: Event, index: number) => {
  if (event.banner_image_url) {
    return getMediaUrl(event.banner_image_url);
  }
  return DEFAULT_EVENT_IMAGES[index % DEFAULT_EVENT_IMAGES.length];
};

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { subscribe } = useRealtime();
  const canManage = role === 'admin' || role === 'committee';

  const [activeTab, setActiveTab] = useState<'upcoming' | 'current' | 'past'>('current');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // For past events
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', event_date: '', venue: '', category: 'current', max_participants: '', registration_deadline: '', registration_link: ''
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [lightboxPoster, setLightboxPoster] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxPoster(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchEvents = useCallback(async (tab: string, year?: number | null) => {
    setLoading(true);
    try {
      let url = `/events?category=${tab}`;
      if (tab === 'past' && year) url += `&year=${year}`;
      const res = await api.get(url);
      setEvents(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchYears = useCallback(async () => {
    try {
      const res = await api.get('/events/years');
      setYears(res.data || []);
      if (res.data && res.data.length > 0 && !selectedYear) {
        setSelectedYear(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch years', err);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (activeTab === 'past') {
      fetchYears().then(() => {
        if (selectedYear) fetchEvents('past', selectedYear);
      });
    } else {
      fetchEvents(activeTab);
    }
  }, [activeTab, selectedYear, fetchEvents, fetchYears]);

  useEffect(() => {
    const unsubscribe = subscribe('events', () => {
      if (activeTab === 'past') {
        fetchYears().then(() => {
          if (selectedYear) fetchEvents('past', selectedYear);
        });
      } else {
        fetchEvents(activeTab);
      }
    });
    return () => unsubscribe();
  }, [subscribe, activeTab, selectedYear, fetchEvents, fetchYears]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'current', label: 'Current' },
    { id: 'past', label: 'Past' },
  ];

  const handleRegisterClick = (event: Event) => {
    if (event.registration_link) {
      const url = event.registration_link.startsWith('http://') || event.registration_link.startsWith('https://')
        ? event.registration_link
        : `https://${event.registration_link}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/profile/registrations?event_id=${event.id}`);
    }
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '', description: '', event_date: '', venue: '', category: activeTab === 'past' ? 'current' : activeTab,
      max_participants: '', registration_deadline: '', registration_link: ''
    });
    setBannerFile(null);
    setBannerPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ev: Event) => {
    setEditingEvent(ev);
    setFormData({
      title: ev.title, description: ev.description, venue: ev.venue, category: ev.category,
      event_date: ev.event_date ? new Date(ev.event_date).toISOString().slice(0, 16) : '',
      registration_deadline: ev.registration_deadline ? new Date(ev.registration_deadline).toISOString().slice(0, 16) : '',
      max_participants: ev.max_participants ? String(ev.max_participants) : '',
      registration_link: ev.registration_link || ''
    });
    setBannerFile(null);
    setBannerPreview(ev.banner_image_url ? getMediaUrl(ev.banner_image_url) : null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let banner_image_url = editingEvent?.banner_image_url || null;
      if (bannerFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', bannerFile);
        const fileRes = await api.post('/media/upload', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        banner_image_url = fileRes.data.file_url;
      }

      const payload = {
        ...formData,
        event_date: new Date(formData.event_date).toISOString(),
        registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : new Date(formData.event_date).toISOString(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        banner_image_url,
        registration_link: formData.registration_link ? formData.registration_link.trim() : null
      };

      if (editingEvent) await api.put(`/events/${editingEvent.id}`, payload);
      else await api.post('/events', payload);

      setIsModalOpen(false);
      fetchEvents(activeTab, selectedYear);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    const targetId = deletingEvent.id;
    setIsSubmitting(true);
    try {
      await api.delete(`/events/${targetId}`);
      toast.success('Event deleted');
      setEvents((prev) => prev.filter((e) => e.id !== targetId));
      setIsDeleteModalOpen(false);
      setDeletingEvent(null);
      fetchEvents(activeTab, selectedYear);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to delete event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ManageableGrid
        title="Events"
        description="Discover and register for campus events."
        icon={Calendar}
        iconColorClass="text-sky-400"
        iconBgClass="bg-sky-500/10"
        canManage={canManage}
        onAdd={openAddModal}
        addLabel="Add Event"
        rightContent={
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-colors ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-sky-600 rounded-xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        }
      >
        {/* Year Toggle (Only for Past) */}
        <AnimatePresence>
          {activeTab === 'past' && years.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar"
            >
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${selectedYear === year
                      ? 'bg-slate-800 text-white border-slate-700'
                      : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                    }`}
                >
                  {year}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[400px]">
                <Skeleton className="h-32 w-full rounded-none" />
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <div className="space-y-2.5 mt-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-800/80">
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events found"
            description={`There are no ${activeTab} events to display at the moment.`}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <AnimatePresence mode="popLayout">
              {events.map((event, index) => {
                const posterUrl = getEventBannerUrl(event, index);
                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300"
                  >
                    {/* Poster Showcase Container - Free Size (Zero Cropping) */}
                    <div
                      onClick={() => setLightboxPoster({ url: posterUrl, title: event.title })}
                      className="relative cursor-pointer overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[520px] border-b border-slate-800/80 group/poster"
                      title="Click to view full poster"
                    >
                      {/* Ambient blurred backdrop for seamless color fill */}
                      <img
                        src={posterUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
                      />

                      {/* The Full Uncropped Poster */}
                      <img
                        src={posterUrl}
                        alt={event.title}
                        className="relative z-10 w-full max-h-[520px] object-contain transition-transform duration-500 group-hover/poster:scale-[1.02]"
                        loading="lazy"
                      />

                      {/* Quick zoom overlay on hover (for students) */}
                    {!canManage && (
                      <div className="absolute inset-0 z-20 bg-slate-950/40 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <span className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white border border-slate-700/80 text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-black/40">
                          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                          View Full Poster
                        </span>
                      </div>
                    )}

                      {/* Category badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-sky-300 border border-sky-500/30 backdrop-blur-md shadow-md">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-black text-white leading-tight group-hover:text-sky-400 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-3 mt-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                            <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                            <span>{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                            <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                            <span>{new Date(event.event_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                            <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                          {event.max_participants && (
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                              <Users className="w-4 h-4 text-sky-500 shrink-0" />
                              <span>Capacity: {event.max_participants}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-800/80">
                        {event.registration_link ? (
                          <button
                            onClick={() => handleRegisterClick(event)}
                            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                          >
                            Register Now <ExternalLink className="w-4 h-4" />
                          </button>
                        ) : activeTab === 'current' ? (
                          <button
                            onClick={() => handleRegisterClick(event)}
                            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                          >
                            Register Now <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : activeTab === 'upcoming' ? (
                          <button className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                            <Bell className="w-4 h-4" /> Registration Not Open
                          </button>
                        ) : (
                          <button className="w-full py-3 rounded-xl bg-slate-950 text-slate-500 font-bold text-sm border border-slate-800 cursor-not-allowed">
                            Event Completed
                          </button>
                        )}
                      </div>
                    </div>

                    <ManageableCardOverlay
                      canManage={canManage}
                      onEdit={() => openEditModal(event)}
                      onDelete={() => { setDeletingEvent(event); setIsDeleteModalOpen(true); }}
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
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" />
                {editingEvent ? 'Edit Event' : 'Add Event'}
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.event_date}
                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="current">Current</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reg Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={e => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Banner / Poster (Free Size)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setBannerFile(file);
                      if (file) {
                        setBannerPreview(URL.createObjectURL(file));
                      } else {
                        setBannerPreview(editingEvent?.banner_image_url ? getMediaUrl(editingEvent.banner_image_url) : null);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20"
                  />
                  {bannerPreview && (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 self-start">
                        Poster Preview (Any Size / Aspect Ratio)
                      </span>
                      <div className="relative max-h-56 w-full flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden p-1">
                        <img
                          src={bannerPreview}
                          alt="Poster preview"
                          className="max-h-52 w-auto max-w-full object-contain rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Max Participants (Optional)</label>
                  <input
                    type="number"
                    value={formData.max_participants}
                    onChange={e => setFormData({ ...formData, max_participants: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registration Link (Redirect URL)</label>
                <input
                  type="url"
                  value={formData.registration_link}
                  onChange={e => setFormData({ ...formData, registration_link: e.target.value })}
                  placeholder="https://forms.gle/... or https://unstop.com/... (optional external registration link)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors text-sm font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">If provided, "Register Now" will redirect students to this URL. Leave blank for built-in registration.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500 transition-colors min-h-[100px]"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        description={`Are you sure you want to delete "${deletingEvent?.title}"?`}
        isDeleting={isSubmitting}
      />

      {/* Fullscreen Poster Lightbox */}
      <AnimatePresence>
        {lightboxPoster && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setLightboxPoster(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[92vh] w-full flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
                <div className="min-w-0 pr-4">
                  <h3 className="text-base font-bold text-white truncate">{lightboxPoster.title}</h3>
                  <p className="text-xs text-slate-400">Full Event Poster (Free Size)</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={lightboxPoster.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Open original / download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setLightboxPoster(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Poster Image Content */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
                <img
                  src={lightboxPoster.url}
                  alt={lightboxPoster.title}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
