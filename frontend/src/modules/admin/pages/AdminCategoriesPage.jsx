import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  X,
  Store,
  ExternalLink,
  Tag,
  Users
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

const PRESET_IMAGES = [
  { label: 'Hair Studio', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80' },
  { label: 'Facial & Skin', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80' },
  { label: 'Spa & Wellness', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' },
  { label: 'Waxing & RICA', url: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80' },
  { label: 'Body Polishing', url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80' },
  { label: 'Makeup & Styling', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
  { label: 'Mani-Pedi', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80' },
  { label: 'Mehandi Art', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Beard Grooming', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80' },
  { label: "Men's Styling", url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80' }
];

export const AdminCategoriesPage = () => {
  const {
    categories = [],
    services = [],
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    theme
  } = useAdmin();

  const isLight = theme === 'light';

  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('all'); // all | unisex | women | men | inactive

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    slug: '',
    gender: 'unisex',
    serviceCategoriesText: '',
    image: '',
    description: '',
    isActive: true
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState(null); // category object

  // Map service count by category
  const categoryStats = useMemo(() => {
    const stats = {};
    categories.forEach((cat) => {
      const matchTerms = [
        cat.name?.toLowerCase(),
        cat.shortName?.toLowerCase(),
        cat.slug?.toLowerCase(),
        ...(cat.serviceCategories || []).map((s) => s.toLowerCase())
      ].filter(Boolean);

      const count = services.filter((srv) => {
        const srvCat = srv.category?.toLowerCase() || '';
        return matchTerms.some((term) => srvCat === term || srvCat.includes(term));
      }).length;

      stats[cat.id] = count;
    });
    return stats;
  }, [categories, services]);

  // KPIs
  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive !== false).length;
  const totalServicesLinked = services.length;
  const womenCategories = categories.filter((c) => c.gender === 'women').length;
  const menCategories = categories.filter((c) => c.gender === 'men').length;
  const unisexCategories = categories.filter((c) => !c.gender || c.gender === 'unisex').length;

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        cat.name?.toLowerCase().includes(q) ||
        cat.shortName?.toLowerCase().includes(q) ||
        cat.slug?.toLowerCase().includes(q) ||
        (cat.serviceCategories || []).some((s) => s.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterGender === 'inactive') return cat.isActive === false;
      if (filterGender === 'all') return true;
      return (cat.gender || 'unisex') === filterGender;
    });
  }, [categories, search, filterGender]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      shortName: '',
      slug: '',
      gender: 'unisex',
      serviceCategoriesText: '',
      image: PRESET_IMAGES[0].url,
      description: '',
      isActive: true
    });
    setFormError('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      shortName: category.shortName || category.name || '',
      slug: category.slug || '',
      gender: category.gender || 'unisex',
      serviceCategoriesText: Array.isArray(category.serviceCategories)
        ? category.serviceCategories.join(', ')
        : category.serviceCategories || '',
      image: category.image || PRESET_IMAGES[0].url,
      description: category.description || '',
      isActive: category.isActive !== false
    });
    setFormError('');
    setModalOpen(true);
  };

  // Auto slug generation on name change if not manually changed
  const handleNameChange = (val) => {
    setFormData((prev) => {
      const shouldAutoSlug = !editingCategory || !prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const nextSlug = shouldAutoSlug
        ? val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        : prev.slug;

      const nextShort = !editingCategory && !prev.shortName ? val : prev.shortName;

      return {
        ...prev,
        name: val,
        slug: nextSlug,
        shortName: nextShort
      };
    });
  };

  // Submit Modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const rawServices = formData.serviceCategoriesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      shortName: formData.shortName.trim() || formData.name.trim(),
      slug:
        formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      gender: formData.gender,
      serviceCategories: rawServices.length ? rawServices : [formData.name.trim()],
      image: formData.image.trim() || PRESET_IMAGES[0].url,
      description: formData.description.trim(),
      isActive: formData.isActive
    };

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      // toast shown in context
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Category & Taxonomy Management"
        subtitle="Define global service categories that salon partners can list treatments under"
        action={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Define New Category</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Total Categories</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalCategories}</h3>
              <p className="text-[10px] text-stone-500 mt-0.5">{activeCount} currently active</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Salon Services Listed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalServicesLinked}</h3>
              <p className="text-[10px] text-emerald-400 mt-0.5">Across active partner salons</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>

          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Audience Targeting</p>
              <h3 className="text-sm font-bold text-white mt-1 flex items-center gap-2">
                <span className="text-purple-400">{unisexCategories} Unisex</span> •{' '}
                <span className="text-pink-400">{womenCategories} Women</span> •{' '}
                <span className="text-sky-400">{menCategories} Men</span>
              </h3>
              <p className="text-[10px] text-stone-500 mt-0.5">Structured client filtering</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Salon Portal Sync</p>
              <h3 className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Live Reactive
              </h3>
              <p className="text-[10px] text-stone-500 mt-0.5">Instant menu availability</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category name, slug or service tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Gender Filter Chips */}
          <div className="admin-filter-bar flex items-center gap-1.5 p-1 bg-[#14141e] border border-[#262638] rounded-xl text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'unisex', label: 'Unisex' },
              { id: 'women', label: 'Women' },
              { id: 'men', label: 'Men' },
              { id: 'inactive', label: 'Hidden / Inactive' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterGender(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterGender === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Table */}
        <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="admin-table-header border-b border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold">Category Details</th>
                  <th className="py-3.5 px-4 font-semibold">Slug Identifier</th>
                  <th className="py-3.5 px-4 font-semibold">Target Audience</th>
                  <th className="py-3.5 px-4 font-semibold">Salon Service Taxonomies</th>
                  <th className="py-3.5 px-4 font-semibold">Listed Services</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f2e]">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-stone-500">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                      <p className="text-sm font-medium text-stone-300">No categories found matching filters</p>
                      <p className="text-xs text-stone-500 mt-1">
                        Try adjusting your search keywords or create a new category.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const servicesLinked = categoryStats[cat.id] || 0;
                    const isActive = cat.isActive !== false;

                    return (
                      <tr key={cat.id} className="hover:bg-[#181824]/60 transition-colors group">
                        {/* Category Name & Thumbnail */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-950/40 border border-[#2d2d42] shrink-0">
                              <img
                                src={cat.image || PRESET_IMAGES[0].url}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = PRESET_IMAGES[0].url;
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                                <span>{cat.name}</span>
                                {cat.shortName && cat.shortName !== cat.name && (
                                  <span className="text-[10px] text-stone-400 font-normal">
                                    ({cat.shortName})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs mt-0.5">
                                {cat.description || 'Global service classification'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-purple-300">
                          <span className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                            {cat.slug}
                          </span>
                        </td>

                        {/* Target Audience */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              cat.gender === 'women'
                                ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                                : cat.gender === 'men'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {cat.gender || 'unisex'}
                          </span>
                        </td>

                        {/* Service Category Taxonomies */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {(cat.serviceCategories || [cat.name]).slice(0, 3).map((sub, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#1e1e2d] border border-[#2e2e42] text-stone-300"
                              >
                                {sub}
                              </span>
                            ))}
                            {(cat.serviceCategories || []).length > 3 && (
                              <span className="px-1.5 py-0.5 text-[10px] text-stone-400 font-semibold">
                                +{(cat.serviceCategories || []).length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Live Services Linked */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-stone-400" />
                            <span>{servicesLinked}</span>
                            <span className="text-[10px] text-stone-500 font-normal">salons</span>
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => toggleCategoryActive(cat.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-400' : 'bg-stone-500'
                              }`}
                            />
                            {isActive ? 'Active' : 'Hidden'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Category"
                              className="p-1.5 rounded-lg bg-[#1a1a26] border border-[#2b2b3d] text-stone-300 hover:text-white hover:border-purple-500/50 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(cat)}
                              title="Delete Category"
                              className="p-1.5 rounded-lg bg-[#1a1a26] border border-[#2b2b3d] text-stone-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-800/50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- CREATE / EDIT MODAL ---------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#14141e] border border-[#2d2d42] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#242436] flex items-center justify-between bg-[#111119]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {editingCategory ? 'Edit Service Category' : 'Define New Service Category'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Salon partners will see this category when publishing treatment packages
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-[#1e1e2d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Name & Short Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nails &amp; Extensions"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Short Display Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nails"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Slug & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Unique Slug Identifier <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. nails-extensions"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      })
                    }
                    className="w-full font-mono bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-purple-300 placeholder-stone-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Target Audience / Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="unisex">Unisex (Both Women &amp; Men)</option>
                    <option value="women">Women Only</option>
                    <option value="men">Men Only</option>
                  </select>
                </div>
              </div>

              {/* Service Taxonomies Mapping */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Service Tags / Sub-Categories (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acrylic Nails, Gel Polish, Nail Art, French Tips"
                  value={formData.serviceCategoriesText}
                  onChange={(e) => setFormData({ ...formData, serviceCategoriesText: e.target.value })}
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Salon partners can match these specific treatment tags under this umbrella category.
                </p>
              </div>

              {/* Image URL & Preset Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Category Banner / Thumbnail Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
                  />
                  {formData.image && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#3d3d52] shrink-0 bg-black">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Presets */}
                <div className="mt-2.5">
                  <span className="text-[10px] text-stone-400 block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                          formData.image === preset.url
                            ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                            : 'bg-[#181824] text-stone-400 border-[#2b2b3d] hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description shown in client app..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#101018] border border-[#262638]">
                <div>
                  <div className="font-semibold text-white text-xs">Publish to Salon &amp; Customer Apps</div>
                  <div className="text-[10px] text-stone-500">
                    When active, salon partners can immediately select and list treatments under this category.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#262638] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#242436] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#2d2d42] text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold transition-all shadow-md shadow-purple-950/40 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingCategory
                    ? 'Save Category Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#14141e] border border-red-800/60 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Delete Category "{deleteConfirm.name}"?
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Are you sure you want to remove this category from the admin catalog? Salons will no longer be able to select it.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2d2d42] text-stone-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-xs transition-all shadow-md shadow-red-950/40 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
