import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  IndianRupee,
  Layers,
  Store,
  CheckCircle2,
  Search
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminEditorialPage = () => {
  const {
    skincareItems = [],
    trendsItems = [],
    salons = [],
    addSkincareItem,
    updateSkincareItem,
    deleteSkincareItem,
    addTrendItem,
    updateTrendItem,
    deleteTrendItem,
    theme
  } = useAdmin();

  const isLight = theme === 'light';

  // Active Tab: 'skincare' | 'trends'
  const [activeTab, setActiveTab] = useState('skincare');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    tag: 'Trending Now',
    category: 'Facial',
    price: 899,
    originalPrice: 1299,
    startingPrice: 899,
    salonId: salons[0]?.id || 'sal-1',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    isActive: true
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      tag: 'Hot in Indore',
      category: activeTab === 'skincare' ? 'Cleanser' : 'Facial',
      price: 899,
      originalPrice: 1299,
      startingPrice: 899,
      salonId: salons[0]?.id || 'sal-1',
      image:
        activeTab === 'skincare'
          ? 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
      tag: item.tag || 'Trending Now',
      category: item.category || 'Facial',
      price: item.price || item.startingPrice || 899,
      originalPrice: item.originalPrice || 1299,
      startingPrice: item.startingPrice || item.price || 899,
      salonId: item.salonId || salons[0]?.id || 'sal-1',
      image: item.image || '',
      isActive: item.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'skincare') {
      if (editingItem) {
        await updateSkincareItem(editingItem.id, {
          title: formData.title,
          subtitle: formData.subtitle,
          category: formData.category,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
          salonId: formData.salonId,
          image: formData.image,
          isActive: formData.isActive
        });
      } else {
        await addSkincareItem({
          title: formData.title,
          subtitle: formData.subtitle,
          category: formData.category,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
          salonId: formData.salonId,
          image: formData.image,
          rating: 4.9,
          isActive: formData.isActive
        });
      }
    } else {
      if (editingItem) {
        await updateTrendItem(editingItem.id, {
          title: formData.title,
          tag: formData.tag,
          description: formData.description,
          startingPrice: Number(formData.startingPrice || formData.price),
          category: formData.category,
          salonId: formData.salonId,
          image: formData.image,
          isActive: formData.isActive
        });
      } else {
        await addTrendItem({
          title: formData.title,
          tag: formData.tag,
          description: formData.description,
          startingPrice: Number(formData.startingPrice || formData.price),
          category: formData.category,
          salonId: formData.salonId,
          image: formData.image,
          isActive: formData.isActive
        });
      }
    }
    setIsModalOpen(false);
  };

  const currentList = activeTab === 'skincare' ? skincareItems : trendsItems;
  const filteredList = currentList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || item.title?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
  });

  return (
    <div className={`flex-1 flex flex-col min-h-screen ${isLight ? 'bg-[#f7f5f9]' : 'bg-[#0d0d12]'}`}>
      <AdminTopBar
        title="Skincare Studio & Beauty Trends CMS"
        subtitle="Manage dynamic editorial rituals, seasonal beauty trends, and partner service features"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#161622] border border-[#262638] text-xs">
            <button
              onClick={() => setActiveTab('skincare')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'skincare'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skincare Studio ({skincareItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Beauty Trends ({trendsItems.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none ${
                  isLight
                    ? 'bg-white border-stone-300 text-stone-900'
                    : 'bg-[#14141e] border-[#28283c] text-white'
                }`}
              />
            </div>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'skincare' ? 'Add Ritual' : 'Add Trend'}</span>
            </button>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const partnerSalon = salons.find((s) => s.id === item.salonId);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                  isLight ? 'bg-white border-purple-100' : 'bg-[#14141e] border-[#262638]'
                }`}
              >
                <div>
                  {/* Image cover */}
                  <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-600/90 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                      {item.tag && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/90 text-stone-950 backdrop-blur-xs">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm leading-snug line-clamp-1">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2 text-xs">
                    {item.description && (
                      <p className="text-stone-400 line-clamp-2 text-[11px] leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/40">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase font-semibold">Pricing</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-400 text-sm">
                            ₹{item.price || item.startingPrice}
                          </span>
                          {item.originalPrice && (
                            <span className="text-[11px] text-stone-500 line-through font-normal">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block uppercase font-semibold">Partner</span>
                        <span className="font-semibold text-stone-300 truncate max-w-[130px] block">
                          {partnerSalon?.name || item.salonId || 'All Salons'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-stone-800/30 flex items-center justify-between bg-black/15">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{item.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        activeTab === 'skincare'
                          ? deleteSkincareItem(item.id)
                          : deleteTrendItem(item.id)
                      }
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/40 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative ${
              isLight ? 'bg-white border-purple-200 text-stone-900' : 'bg-[#161622] border-[#2e2e42] text-white'
            }`}
          >
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>
                {editingItem ? 'Edit' : 'Create'}{' '}
                {activeTab === 'skincare' ? 'Skincare Ritual' : 'Beauty Trend Feature'}
              </span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Glass Skin Botanical Facial Ritual"
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                  }`}
                />
              </div>

              {activeTab === 'skincare' ? (
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Subtitle / Formulation Note</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Deep dermal hydration with botanical peptides"
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                    }`}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Trending Now, Celebrity Pick"
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Facial, Hair Studio, Nails"
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                      }`}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the trend..."
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                    }`}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Price / Starting (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value, startingPrice: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold text-emerald-400 ${
                      isLight ? 'bg-stone-50 border-stone-300' : 'bg-[#101018] border-[#323248]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Assigned Partner Salon</label>
                  <select
                    value={formData.salonId}
                    onChange={(e) => setFormData({ ...formData, salonId: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                    }`}
                  >
                    {salons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.area})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
