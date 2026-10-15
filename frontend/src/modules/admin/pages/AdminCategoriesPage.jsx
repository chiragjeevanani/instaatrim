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

  React.useEffect(() => {
    import('../../../shared/services/api').then(({ api }) => {
      api.categories.list();
      api.services.listAll();
    });
  }, []);

  // Modal State (Persisted to sessionStorage so it survives refresh)
  const [modalOpen, setModalOpen] = useState(() => {
    try {
      const saved = sessionStorage.getItem('adminCategoryModalState');
      return saved ? JSON.parse(saved).modalOpen : false;
    } catch {
      return false;
    }
  });

  const [editingCategory, setEditingCategory] = useState(() => {
    try {
      const saved = sessionStorage.getItem('adminCategoryModalState');
      return saved ? JSON.parse(saved).editingCategory : null;
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('adminCategoryModalState');
      if (saved) {
        const parsed = JSON.parse(saved).formData;
        if (parsed) return parsed;
      }
    } catch {}
    return {
      name: '',
      shortName: '',
      slug: '',
      gender: 'unisex',
      serviceCategoriesText: '',
      image: '',
      description: '',
      price: 0,
      discount: 0,
      originalPrice: 0,
      isActive: true
    };
  });

  React.useEffect(() => {
    try {
      // Exclude imageFile since File objects cannot be JSON stringified
      const { imageFile, ...restFormData } = formData;
      sessionStorage.setItem('adminCategoryModalState', JSON.stringify({
        modalOpen,
        editingCategory,
        formData: restFormData
      }));
    } catch (e) {
      console.error('Failed to save modal state', e);
    }
  }, [modalOpen, editingCategory, formData]);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      image: '',
      description: '',
      price: 0,
      discount: 0,
      originalPrice: 0,
      isActive: true
    });
    setFormError('');
    setShowSuggestions(false);
    setModalOpen(true);
  };

  // Standard catalog dictionary for smart autocomplete recommendations
  const CATALOG_SUGGESTIONS = useMemo(() => [
    {
      name: 'Hair Styling',
      shortName: 'Hair Style',
      slug: 'hair-styling',
      gender: 'unisex',
      tags: ['Haircut', 'Blow Dry', 'Ironing', 'Hair Setting', 'Beard Trim'],
      description: 'Professional haircuts, blow dries, and styling treatments.'
    },
    {
      name: 'Hair Coloring',
      shortName: 'Hair Color',
      slug: 'hair-coloring',
      gender: 'unisex',
      tags: ['Global Color', 'Root Touchup', 'Balayage', 'Highlights', 'Streaks'],
      description: 'Rich vibrant hair coloring, highlights, and grey coverage.'
    },
    {
      name: 'Hair Spa & Care',
      shortName: 'Hair Spa',
      slug: 'hair-spa',
      gender: 'unisex',
      tags: ['Deep Conditioning', 'Anti-Dandruff Spa', 'Keratin Spa', 'Scalp Detox'],
      description: 'Nourishing botanical hair spa and intensive scalp therapy.'
    },
    {
      name: 'Hair Studio',
      shortName: 'Hair Studio',
      slug: 'hair-studio',
      gender: 'unisex',
      tags: ['Haircut', 'Hair Wash', 'Blowdry', 'Beard Grooming'],
      description: 'Complete studio grooming and styling for modern looks.'
    },
    {
      name: 'Hair Treatments',
      shortName: 'Hair Treatment',
      slug: 'hair-treatments',
      gender: 'unisex',
      tags: ['Keratin Treatment', 'Botox', 'Smoothening', 'Rebonding'],
      description: 'Advanced hair smoothing, keratin, and texture management.'
    },
    {
      name: 'Facials & Skin Care',
      shortName: 'Facials',
      slug: 'facials-skincare',
      gender: 'unisex',
      tags: ['Gold Facial', 'Hydra Facial', 'O3+ Clean Up', 'Anti-Tan Facial'],
      description: 'Deep cleansing facials, peels, and glow treatments.'
    },
    {
      name: 'Nails, Art & Extensions',
      shortName: 'Nail Studio',
      slug: 'nails-extensions',
      gender: 'women',
      tags: ['Acrylic Nails', 'Gel Polish', 'Nail Art', 'French Tips', 'Refills'],
      description: 'Full set acrylic nail extensions and long-lasting gel art.'
    },
    {
      name: 'Waxing & RICA',
      shortName: 'Waxing',
      slug: 'waxing-rica',
      gender: 'women',
      tags: ['RICA Wax', 'Full Arms', 'Full Legs', 'Bikini Wax', 'Underarms'],
      description: 'Gentle colophony-free Italian waxing and skin smoothing.'
    },
    {
      name: 'Spa & Body Massage',
      shortName: 'Spa',
      slug: 'spa-body-massage',
      gender: 'unisex',
      tags: ['Swedish Massage', 'Deep Tissue', 'Aromatherapy', 'Foot Reflexology'],
      description: 'Rejuvenating body massages and wellness therapies.'
    },
    {
      name: 'Bridal & Groom Makeup',
      shortName: 'Bridal & Makeup',
      slug: 'bridal-makeup',
      gender: 'unisex',
      tags: ['HD Bridal Makeup', 'Airbrush', 'Engagement Look', 'Pre-Bridal Package'],
      description: 'Exquisite bridal makeovers and pre-wedding beauty rituals.'
    },
    {
      name: 'Pedicure & Manicure',
      shortName: 'Mani-Pedi',
      slug: 'pedicure-manicure',
      gender: 'unisex',
      tags: ['Classic Mani', 'Paraffin Pedi', 'Crystal Spa Pedi', 'Cuticle Care'],
      description: 'Hand and foot spa grooming for clean and soft skin.'
    },
    {
      name: 'Beard & Shave Lounge',
      shortName: 'Beard Care',
      slug: 'beard-shave',
      gender: 'men',
      tags: ['Beard Shape & Trim', 'Royal Shave', 'Beard Spa', 'Mustache Styling'],
      description: 'Precision beard shaping, hot towel shaves, and grooming.'
    }
  ], []);

  // Compute active autocomplete suggestions matching typed input
  const autocompleteSuggestions = useMemo(() => {
    const query = (formData.name || '').trim().toLowerCase();
    if (!query || query.length < 1) return [];

    // Collect from standard dictionary + existing database categories
    const combined = [...CATALOG_SUGGESTIONS];
    categories.forEach((cat) => {
      if (cat.name && !combined.some((c) => c.name.toLowerCase() === cat.name.toLowerCase())) {
        combined.push({
          name: cat.name,
          shortName: cat.shortName || cat.name,
          slug: cat.slug,
          gender: cat.gender || 'unisex',
          tags: Array.isArray(cat.serviceCategories) ? cat.serviceCategories : [],
          description: cat.description || ''
        });
      }
    });

    return combined
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [formData.name, CATALOG_SUGGESTIONS, categories]);

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
      image: category.image || '',
      description: category.description || '',
      price: category.price || 0,
      discount: category.discount || 0,
      originalPrice: category.originalPrice || category.price || 0,
      isActive: category.isActive !== false
    });
    setFormError('');
    setShowSuggestions(false);
    setModalOpen(true);
  };

  // Name change handler
  const handleNameChange = (val) => {
    setShowSuggestions(true);
    setFormData((prev) => {
      // Auto-generate slug if not editing or user hasn't explicitly customized slug
      const generatedSlug = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        ...prev,
        name: val,
        ...((!editingCategory && (!prev.slug || prev.slug === prev.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')))
          ? { slug: generatedSlug, shortName: prev.shortName || val }
          : {})
      };
    });
  };

  // Helper to ensure unique slug across categories
  const getUniqueSlug = (baseSlug, currentId) => {
    let clean = baseSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!clean) clean = 'category';
    let candidate = clean;
    let counter = 1;

    const existingSlugs = new Set(
      categories
        .filter((c) => (c.id || c._id) !== currentId)
        .map((c) => (c.slug || '').toLowerCase())
    );

    while (existingSlugs.has(candidate)) {
      counter += 1;
      candidate = `${clean}-${counter}`;
    }
    return candidate;
  };

  // Select Autocomplete Suggestion
  const handleSelectSuggestion = (suggestion) => {
    const uniqueSlug = getUniqueSlug(suggestion.slug, editingCategory?.id);
    setShowSuggestions(false);
    setFormData((prev) => ({
      ...prev,
      name: suggestion.name,
      shortName: suggestion.shortName || suggestion.name,
      slug: uniqueSlug,
      gender: suggestion.gender || prev.gender,
      serviceCategoriesText: suggestion.tags?.length
        ? suggestion.tags.join(', ')
        : prev.serviceCategoriesText,
      description: suggestion.description || prev.description
    }));
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

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('shortName', formData.shortName.trim() || formData.name.trim());
    
    const slug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Prevent duplicate slugs
    const isDuplicateSlug = categories.some((c) => {
      const otherId = c.id || c._id;
      const currentId = editingCategory?.id || editingCategory?._id;
      return otherId !== currentId && (c.slug || '').toLowerCase() === slug.toLowerCase();
    });

    if (isDuplicateSlug) {
      setFormError(`Slug "${slug}" already exists. Please choose a unique slug or use a suggested variation.`);
      return;
    }

    payload.append('slug', slug);
    payload.append('gender', formData.gender);
    
    const serviceCategories = rawServices.length ? rawServices : [formData.name.trim()];
    payload.append('serviceCategories', JSON.stringify(serviceCategories));
    
    payload.append('description', formData.description.trim());
    payload.append('price', formData.price || 0);
    payload.append('discount', formData.discount || 0);
    payload.append('originalPrice', formData.originalPrice || formData.price || 0);
    payload.append('isActive', formData.isActive);

    if (formData.imageFile) {
        payload.append('image', formData.imageFile);
    } else if (formData.image) {
        payload.append('image', formData.image.trim());
    }

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
                  <th className="py-3.5 px-4 font-semibold">Base Price</th>
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
                                src={cat.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80';
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

                        {/* Base Price & Discount */}
                        <td className="py-3.5 px-4 font-semibold text-emerald-400">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span>₹{cat.discount > 0 && cat.originalPrice ? cat.originalPrice : (cat.price || 0)}</span>
                              {cat.discount > 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                  {cat.discount}% OFF
                                </span>
                              )}
                            </div>
                            {cat.discount > 0 && (
                              <span className="text-[10px] text-stone-500 line-through">
                                ₹{cat.price}
                              </span>
                            )}
                          </div>
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
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                      Category Name <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Smart Autocomplete
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hair, Nails, Facial, Spa..."
                    value={formData.name}
                    onFocus={() => {
                      if (formData.name.trim().length >= 1) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      // Slight delay so onMouseDown on suggestion can register before blur hides it
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500"
                  />

                  {/* Autocomplete Suggestions Dropdown Menu */}
                  {showSuggestions && autocompleteSuggestions.length > 0 && formData.name.trim().length >= 1 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#161622] border border-[#2f2f45] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#232336] max-h-56 overflow-y-auto">
                      <div className="px-3 py-1.5 bg-[#12121b] text-[10px] uppercase tracking-wider font-bold text-purple-400 flex items-center justify-between">
                        <span>Related Suggestions</span>
                        <span className="text-stone-500 font-normal">Click to auto-fill</span>
                      </div>
                      {autocompleteSuggestions.map((sug, i) => (
                        <div
                          key={i}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(sug);
                          }}
                          className="w-full text-left p-2.5 hover:bg-purple-900/30 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-white group-hover:text-purple-300 text-[12px] flex items-center gap-1.5">
                              <span>{sug.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#252538] text-stone-400 font-mono">
                                /{sug.slug}
                              </span>
                            </div>
                            {sug.tags?.length > 0 && (
                              <p className="text-[10.5px] text-stone-400 mt-0.5 line-clamp-1">
                                {sug.tags.slice(0, 4).join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 font-medium px-2 py-0.5 rounded bg-purple-500/20 transition-all shrink-0 ml-2">
                            Apply
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
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

              {/* Image File & Preset Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Category Banner / Thumbnail Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, imageFile: e.target.files[0], image: '' });
                      }
                    }}
                    className="flex-1 bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                  {(formData.imageFile || formData.image) && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#3d3d52] shrink-0 bg-black">
                      <img 
                        src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Price, Discount & Calculated Original Price (2-way dynamic calculation) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 rounded-xl bg-[#12121c] border border-[#232336]">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Base Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000"
                    value={formData.price}
                    onChange={(e) => {
                      const base = parseFloat(e.target.value) || 0;
                      const disc = parseFloat(formData.discount) || 0;
                      const calculatedOriginal = disc > 0 ? Math.round(base - (base * disc / 100)) : base;
                      setFormData({ 
                        ...formData, 
                        price: e.target.value,
                        originalPrice: calculatedOriginal
                      });
                    }}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 text-sm font-semibold"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Starting catalog / MRP rate</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Discount (%)</span>
                    {Number(formData.discount) > 0 && (
                      <span className="text-[10px] text-emerald-400 font-semibold">{formData.discount}% OFF</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    placeholder="e.g. 20"
                    value={formData.discount}
                    onChange={(e) => {
                      const disc = parseFloat(e.target.value) || 0;
                      const base = parseFloat(formData.price) || 0;
                      const orig = parseFloat(formData.originalPrice) || 0;

                      if (base > 0) {
                        const calculatedOriginal = disc > 0 ? Math.round(base - (base * disc / 100)) : base;
                        setFormData({ 
                          ...formData, 
                          discount: e.target.value,
                          originalPrice: calculatedOriginal
                        });
                      } else if (orig > 0 && disc < 100) {
                        const calculatedBase = disc > 0 ? Math.round(orig / (1 - disc / 100)) : orig;
                        setFormData({
                          ...formData,
                          discount: e.target.value,
                          price: calculatedBase
                        });
                      } else {
                        setFormData({ 
                          ...formData, 
                          discount: e.target.value 
                        });
                      }
                    }}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 text-sm font-semibold"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Platform discount offer</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between text-emerald-400">
                    <span>Original Price (₹)</span>
                    <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      2-Way Auto
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={formData.originalPrice}
                    onChange={(e) => {
                      const orig = parseFloat(e.target.value) || 0;
                      const disc = parseFloat(formData.discount) || 0;
                      // Reverse calculate Base Price: Base = Original / (1 - disc/100)
                      const calculatedBase = (disc > 0 && disc < 100)
                        ? Math.round(orig / (1 - disc / 100))
                        : orig;
                      setFormData({
                        ...formData,
                        originalPrice: e.target.value,
                        price: calculatedBase
                      });
                    }}
                    className="w-full bg-[#101018] border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-emerald-400 placeholder-stone-600 focus:outline-none focus:border-emerald-400 text-sm font-semibold font-mono"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    {Number(formData.discount) > 0 ? (
                      <span>
                        Effective selling rate ({formData.discount}% off ₹{formData.price || 0})
                      </span>
                    ) : (
                      'Type here or in Base Price'
                    )}
                  </p>
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
