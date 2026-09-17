import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  X,
  Loader2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Maximize2,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ManageableGrid,
  DeleteConfirmModal
} from '../../components/ManageableGrid';
import { Upload } from 'lucide-react';
import { getMediaUrl, handleImageError } from '../../utils/media';

interface Event {
  id: string;
  title: string;
  description: string;
  category: 'upcoming' | 'current' | 'past';
  event_date: string;
  event_year: number;
  location: string;
  banner_image_url?: string | null;
  max_participants: number;
  registration_deadline?: string | null;
  is_active: boolean;
  certificate_url_pattern?: string | null;
  registration_link?: string | null;
}

export const ManageEventsPage: React.FC = () => {
  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'committee';

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'upcoming',
    event_date: '',
    event_year: new Date().getFullYear(),
    location: '',
    banner_image_url: '',
    max_participants: 100,
    registration_deadline: '',
    certificate_url_pattern: 'https://your-cert-site.com/verify/{registration_number}',
    is_active: true,
    registration_link: '',
  });

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, banner_image_url: res.data.file_url }));
      toast.success('Event banner photo uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload banner photo');
    } finally {
      setUploadingBanner(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/admin?limit=200&sort_by=event_date&sort_dir=desc');
      setEvents(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      category: 'upcoming',
      event_date: new Date().toISOString().slice(0, 16),
      event_year: new Date().getFullYear(),
      location: '',
      banner_image_url: '',
      max_participants: 100,
      registration_deadline: new Date().toISOString().slice(0, 16),
      certificate_url_pattern: 'https://your-cert-site.com/verify/{registration_number}',
      is_active: true,
      registration_link: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      event_year: event.event_year || new Date().getFullYear(),
      location: event.location,
      banner_image_url: event.banner_image_url || '',
      max_participants: event.max_participants || 100,
      registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
      certificate_url_pattern: event.certificate_url_pattern || '',
      is_active: event.is_active,
      registration_link: event.registration_link || '',
    });
    setIsModalOpen(true);
  };

  const [isPersistingBanner, setIsPersistingBanner] = useState(false);

  const handleMakeBannerPermanent = async () => {
    const raw = formData.banner_image_url?.trim();
    if (!raw || !raw.startsWith('http')) return;
    setIsPersistingBanner(true);
    try {
      const res = await api.post('/media/persist-url', { url: raw });
      if (res.data?.file_url) {
        setFormData(prev => ({ ...prev, banner_image_url: res.data.file_url }));
        toast.success('Image downloaded & saved permanently to server storage!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not auto-cache image, but link will still be saved');
    } finally {
      setIsPersistingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date || !formData.location) {
      toast.error('Please fill in required fields (Title, Date, Location)');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalBannerUrl = formData.banner_image_url?.trim() || null;
      if (finalBannerUrl && finalBannerUrl.startsWith('http')) {
        try {
          const persistRes = await api.post('/media/persist-url', { url: finalBannerUrl });
          if (persistRes.data?.file_url) {
            finalBannerUrl = persistRes.data.file_url;
          }
        } catch {
          // fallback; backend also attempts persistence
        }
      }

      const payload = {
        ...formData,
        event_date: new Date(formData.event_date).toISOString(),
        registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : null,
        banner_image_url: finalBannerUrl,
        certificate_url_pattern: formData.certificate_url_pattern || null,
        registration_link: formData.registration_link ? formData.registration_link.trim() : null,
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', payload);
        toast.success('Event created successfully');
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const targetId = deletingId;
    setIsDeleting(true);
    try {
      await api.delete(`/events/${targetId}`);
      toast.success('Event deleted');
      setEvents((prev) => prev.filter((e) => e.id !== targetId));
      setDeletingId(null);
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase()) || ev.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ev.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <ManageableGrid
      title="Manage Events"
      description="Create, edit, and configure campus events, participant limits, and certificate patterns."
      icon={Calendar}
      canManage={canManage}
      onAdd={openAddModal}
      addLabel="Create Event"
      rightContent={
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['all', 'upcoming', 'current', 'past'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  selectedCategory === cat ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 w-48 sm:w-64"
            />
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 rounded-3xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Events Found"
          description={search ? "No events match your search parameters." : "No events have been created yet."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Top Action Overlay (Always on top with z-30) */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(event);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 shadow-xl transition-all"
                  title="Edit Event"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(event.id);
                  }}
                  className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-600 text-rose-400 hover:text-white border border-slate-700 shadow-xl transition-all"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Event Image Poster / Banner - Free Size (Zero Cropping) */}
              <div
                className={`relative bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-800 ${
                  event.banner_image_url ? 'min-h-[200px] max-h-[460px]' : 'h-40'
                }`}
              >
                {event.banner_image_url ? (
                  <>
                    {/* Ambient blurred backdrop for seamless edge fill */}
                    <img
                      src={getMediaUrl(event.banner_image_url)}
                      alt=""
                      aria-hidden="true"
                      onError={handleImageError}
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
                    />

                    {/* Full Uncropped Poster */}
                    <img
                      src={getMediaUrl(event.banner_image_url)}
                      alt={event.title}
                      onError={handleImageError}
                      className="relative z-10 w-full max-h-[460px] object-contain transition-transform duration-500"
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-sky-500/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 z-20 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    event.category === 'upcoming' ? 'bg-sky-500/80 text-white' :
                    event.category === 'current' ? 'bg-emerald-500/80 text-white animate-pulse' :
                    'bg-slate-700/80 text-slate-300'
                  }`}>
                    {event.category}
                  </span>
                  {!event.is_active && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/80 text-white uppercase tracking-wider">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Event Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800/80 pt-4 text-xs font-medium text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{new Date(event.event_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Capacity: {event.max_participants} Participants</span>
                  </div>
                  {event.certificate_url_pattern && (
                    <div className="flex items-center gap-2 text-emerald-400 truncate">
                      <LinkIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{event.certificate_url_pattern}</span>
                    </div>
                  )}
                  {event.registration_link && (
                    <div className="flex items-center gap-2 text-sky-400 truncate">
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="truncate hover:underline"
                        title={event.registration_link}
                      >
                        {event.registration_link}
                      </a>
                    </div>
                  )}
                </div>

                {/* Explicit Admin Action Buttons */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(event)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(event.id)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-400 border border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {event.banner_image_url && (
                    <button
                      type="button"
                      onClick={() => setLightboxPoster({ url: getMediaUrl(event.banner_image_url), title: event.title })}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center"
                      title="Preview Full Poster"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-2xl w-full shadow-2xl my-8 relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Hackathon 2026"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide event details..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 custom-scrollbar"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="current">Current</option>
                      <option value="past">Past</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Location / Venue *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Main Auditorium"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Event Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={formData.registration_deadline}
                      onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Max Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.max_participants}
                      onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Banner / Poster Image (Free Size)</label>
                      {formData.banner_image_url && (
                        formData.banner_image_url.startsWith('/media/') ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Permanent Storage
                          </span>
                        ) : formData.banner_image_url.startsWith('http') ? (
                          <button
                            type="button"
                            onClick={handleMakeBannerPermanent}
                            disabled={isPersistingBanner}
                            className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                            title="Download and store permanently on server so it never expires"
                          >
                            {isPersistingBanner ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                            Make Permanent
                          </button>
                        ) : null
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={formData.banner_image_url}
                        onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                        placeholder="https://... or upload poster below"
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                      <label className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                        {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{uploadingBanner ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                          disabled={uploadingBanner}
                        />
                      </label>
                    </div>

                    {formData.banner_image_url && (
                      <div className="relative mt-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                        <div className="flex items-center justify-between w-full px-2 py-1 mb-1.5 text-[11px] text-slate-400 font-semibold border-b border-slate-800/60">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Poster Preview (Free Size)
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, banner_image_url: '' })}
                            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        <div className="relative max-h-60 w-full flex items-center justify-center bg-slate-900/50 rounded-lg overflow-hidden p-1">
                          <img
                            src={getMediaUrl(formData.banner_image_url)}
                            alt="Poster preview"
                            onError={handleImageError}
                            className="max-h-56 w-auto max-w-full object-contain rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Registration Link (Redirect URL)</label>
                  <input
                    type="url"
                    value={formData.registration_link}
                    onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                    placeholder="https://forms.gle/... or https://unstop.com/... (optional external registration link)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">If provided, the "Register Now" button will redirect students directly to this URL. Leave empty to use the built-in registration ticket system.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Certificate Pattern Template</label>
                  <input
                    type="text"
                    value={formData.certificate_url_pattern}
                    onChange={(e) => setFormData({ ...formData, certificate_url_pattern: e.target.value })}
                    placeholder="https://your-cert-site.com/verify/{registration_number}"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Placeholder <code className="text-sky-400 font-mono">{'{registration_number}'}</code> will be auto-replaced for each student.</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-slate-300">Publish Immediately (Is Active)</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/30 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        isDeleting={isDeleting}
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
                  onError={handleImageError}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ManageableGrid>
  );
};
