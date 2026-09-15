import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { BookOpen, ExternalLink, Library, X, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManageableGrid, ManageableCardOverlay, DeleteConfirmModal } from '../../components/ManageableGrid';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export interface Resource {
  id: string;
  title: string;
  description: string;
  resource_url: string;
  category: string;
  image_url?: string | null;
}

export const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: "NeetCode DSA Roadmap & Algorithms Guide",
    description: "Structured coding roadmap featuring visual algorithm walkthroughs, 150+ categorized LeetCode patterns, time complexity analyses, and interactive practice sets.",
    category: "DSA",
    resource_url: "https://neetcode.io/roadmap",
    image_url: "https://images.unsplash.com/photo-1516116211227-bbc13c73335c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-2',
    title: "Striver's SDE Sheet & A2Z DSA Course",
    description: "The golden standard interview preparation sheet covering array manipulation, trees, dynamic programming, graphs, and system design questions asked at MAANG.",
    category: "DSA",
    resource_url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-3',
    title: "Full Stack Open by University of Helsinki",
    description: "World-class university curriculum teaching modern JavaScript, React, Redux, Node.js, REST APIs, GraphQL, TypeScript, and CI/CD pipelines through hands-on project building.",
    category: "Web Dev",
    resource_url: "https://fullstackopen.com/en/",
    image_url: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-4',
    title: "The Odin Project - Full Stack Curriculum",
    description: "Completely free open-source curriculum guiding aspiring developers from web fundamentals (HTML/CSS) to full-stack mastery with Node.js and React.",
    category: "Web Dev",
    resource_url: "https://www.theodinproject.com/",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-5',
    title: "DeepLearning.AI Machine Learning Specialization",
    description: "Taught by AI pioneer Andrew Ng, covering foundational ML algorithms, neural networks, supervised learning, and practical production AI deployments.",
    category: "AI/ML",
    resource_url: "https://www.deeplearning.ai/courses/machine-learning-specialization/",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-6',
    title: "Fast.ai: Practical Deep Learning for Coders",
    description: "Top-down, hands-on deep learning curriculum designed for programmers to build computer vision, NLP, and generative AI models with PyTorch.",
    category: "AI/ML",
    resource_url: "https://course.fast.ai/",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-7',
    title: "ByteByteGo - System Design Primer & Architecture",
    description: "Master large-scale distributed architectures, caching strategies, rate limiters, message queues, and high-availability database designs with detailed architectural blueprints.",
    category: "System Design",
    resource_url: "https://bytebytego.com/",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-8',
    title: "System Design Primer by Donne Martin",
    description: "Comprehensive open-source GitHub repository detailing microservices, CAP theorem, load balancers, CDN integration, and real-world case studies of Netflix and Twitter.",
    category: "System Design",
    resource_url: "https://github.com/donnemartin/system-design-primer",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-9',
    title: "Roadmap.sh - DevOps & Cloud Engineering",
    description: "Interactive, step-by-step career path for mastering Docker, Kubernetes, Linux CLI, Terraform, CI/CD with GitHub Actions, and AWS infrastructure.",
    category: "Cloud & DevOps",
    resource_url: "https://roadmap.sh/devops",
    image_url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-10',
    title: "AWS Skill Builder & Cloud Practitioner Labs",
    description: "Official Amazon Web Services learning center offering free digital courses, hands-on interactive labs, and certification preparation for Cloud Architect roles.",
    category: "Cloud & DevOps",
    resource_url: "https://explore.skillbuilder.aws/",
    image_url: "https://images.unsplash.com/photo-1484417894907-623942c8ec29?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-11',
    title: "CS50x: Introduction to Computer Science - Harvard",
    description: "Legendary introductory course on algorithmic thinking and computational problem solving using C, Python, SQL, and web technologies by Prof. David J. Malan.",
    category: "Core CS",
    resource_url: "https://cs50.harvard.edu/x/",
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 'res-12',
    title: "Pro Git & GitHub Skills Interactive Labs",
    description: "Master version control, branching strategies, rebase workflows, merge conflicts, pull request reviews, and contributing to high-impact open source projects.",
    category: "Open Source",
    resource_url: "https://skills.github.com/",
    image_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80"
  }
];

export const ResourcesPage: React.FC = () => {
  const { role } = useAuth();
  const { subscribe } = useRealtime();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_url: '',
    category: '',
    image_url: ''
  });

  const canManage = role === 'admin' || role === 'committee';

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources');
      const items = res.data.items || [];
      if (items.length > 0) {
        setResources(items);
      } else {
        setResources(DEFAULT_RESOURCES);
      }
    } catch (err) {
      console.error('Failed to fetch resources, using curated catalog', err);
      setResources(DEFAULT_RESOURCES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const unsubscribe = subscribe('resources', () => fetchResources());
    return () => unsubscribe();
  }, [subscribe]);

  const categories = useMemo(() => {
    const cats = new Set(resources.map(r => r.category).filter(Boolean));
    return ['All', ...Array.from(cats)].sort();
  }, [resources]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: resources.length };
    resources.forEach(r => {
      if (r.category) {
        counts[r.category] = (counts[r.category] || 0) + 1;
      }
    });
    return counts;
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        r.title.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [resources, activeCategory, searchQuery]);

  const openAddModal = () => {
    setEditingResource(null);
    setFormData({ title: '', description: '', resource_url: '', category: 'DSA', image_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      resource_url: resource.resource_url,
      category: resource.category,
      image_url: resource.image_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, formData);
      } else {
        await api.post('/resources', formData);
      }
      setIsModalOpen(false);
      fetchResources();
    } catch (err) {
      console.error('Failed to save resource', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingResource) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/resources/${deletingResource.id}`);
      setIsDeleteModalOpen(false);
      setDeletingResource(null);
      fetchResources();
    } catch (err) {
      console.error('Failed to delete resource', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ManageableGrid
        title="Study Resources"
        description="Curated high-impact learning roadmaps, courses, and interview guides with direct access."
        icon={Library}
        iconColorClass="text-emerald-400"
        iconBgClass="bg-emerald-500/10"
        canManage={canManage}
        onAdd={openAddModal}
        addLabel="Add Resource"
        rightContent={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search roadmaps, topics..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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

            {/* Category Pills */}
            {!loading && categories.length > 1 && (
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden h-[340px]">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-9 w-28 mt-4 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={searchQuery ? "No matching study resources" : "No resources available"}
            description={searchQuery ? `No resources found matching "${searchQuery}". Try a different keyword or reset filters.` : "Check back later for new study materials."}
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredResources.map(resource => (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-300 overflow-hidden h-full"
                >
                  {/* Card Cover Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                    <img
                      src={resource.image_url || 'https://images.unsplash.com/photo-1516116211227-bbc13c73335c?auto=format&fit=crop&w=800&q=80'}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516116211227-bbc13c73335c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    
                    {/* Category Badge Floating on Image */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-lg">
                        {resource.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 line-clamp-1 leading-snug">
                        {resource.title}
                      </h3>
                      
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        Verified Guide
                      </span>
                      
                      <a
                        href={resource.resource_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all group-hover:gap-2"
                      >
                        <span>Access Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  
                  <ManageableCardOverlay
                    canManage={canManage}
                    onEdit={() => openEditModal(resource)}
                    onDelete={() => {
                      setDeletingResource(resource);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                </motion.div>
              ))}
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
                {editingResource ? 'Edit Resource' : 'Add Resource'}
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
                  placeholder="e.g. NeetCode 150 Algorithms Roadmap"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. DSA, Web Dev, AI/ML, System Design"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resource URL</label>
                <input
                  type="url"
                  required
                  value={formData.resource_url}
                  onChange={e => setFormData({ ...formData, resource_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cover Image URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {formData.image_url && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a helpful summary of topics covered..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingResource ? 'Save Changes' : 'Create Resource'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Resource"
        message={`Are you sure you want to delete "${deletingResource?.title}"? This action cannot be undone.`}
        isDeleting={isSubmitting}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingResource(null);
        }}
      />
    </>
  );
};
