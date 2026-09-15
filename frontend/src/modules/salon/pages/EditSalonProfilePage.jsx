import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  User,
  Check,
  Camera,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';

export const EditSalonProfilePage = () => {
  const navigate = useNavigate();
  const { salonProfile, setSalonProfile, showToast } = useSalon();

  const [name, setName] = useState(salonProfile.name || '');
  const [ownerName, setOwnerName] = useState(salonProfile.ownerName || '');
  const [category, setCategory] = useState(salonProfile.category || 'Premium');
  const [address, setAddress] = useState(salonProfile.address || '');
  const [city, setCity] = useState(salonProfile.city || 'Indore');
  const [openHours, setOpenHours] = useState(salonProfile.openHours || '09:00 AM - 09:00 PM');
  const [mobile, setMobile] = useState(salonProfile.mobile || '');
  const [email, setEmail] = useState(salonProfile.email || '');
  const [coverImage, setCoverImage] = useState(salonProfile.coverImage || '');
  const [amenities, setAmenities] = useState(
    salonProfile.amenities || ['AC', 'Free WiFi', 'Complimentary Beverages', 'Sanitized Kits']
  );
  const [newAmenity, setNewAmenity] = useState('');

  const sampleCoverImages = [
    { label: 'Modern Luxury', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' },
    { label: 'Minimalist Studio', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Boutique Spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return;
    if (!amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
    }
    setNewAmenity('');
  };

  const handleRemoveAmenity = (item) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSalonProfile((prev) => ({
      ...prev,
      name: name.trim(),
      ownerName: ownerName.trim(),
      category,
      address: address.trim(),
      city: city.trim(),
      openHours: openHours.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      coverImage: coverImage.trim() || prev.coverImage,
      amenities
    }));

    showToast('Salon profile updated successfully!');
    navigate('/salon/profile');
  };

  return (
    <div className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen flex flex-col justify-between mx-auto box-border">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-4 py-2.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 active:scale-95 text-stone-700 border border-purple-200/60 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[14px] font-bold text-stone-900 tracking-tight leading-none">
              Edit Salon Profile
            </h1>
            <p className="text-[10px] text-stone-500 font-normal mt-0.5">
              Update branding, timings, and contact details
            </p>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="p-3.5 pb-28 flex-1 space-y-3">
        <form id="profile-form" onSubmit={handleSave} className="space-y-3">
          {/* Cover & Brand Image */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5">
            <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
              Storefront Media
            </span>
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={coverImage}
                alt="Salon Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] font-bold text-white bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Cover Preview
                </span>
              </div>
            </div>

            <div className="flex gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              {sampleCoverImages.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setCoverImage(img.url)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${
                    coverImage === img.url
                      ? 'bg-rose-900 text-white border-rose-900'
                      : 'bg-[#faf7fc] text-stone-600 border-purple-100 hover:bg-stone-100'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Salon Details */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-3">
            <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
              Business Profile
            </span>

            <div>
              <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                Salon Name <span className="text-rose-600">*</span>
              </label>
              <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-3 py-2 focus-within:bg-white focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900/30 transition-all">
                <Store className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-xs text-stone-900 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Owner / Representative
                </label>
                <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-3 py-2 focus-within:bg-white focus-within:border-rose-900 transition-all">
                  <User className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Tier Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#faf7fc] text-xs text-stone-900 rounded-xl border border-purple-100 px-2.5 py-2 outline-none font-medium cursor-pointer"
                >
                  <option value="Premium">Premium</option>
                  <option value="Luxury">Luxury Boutique</option>
                  <option value="Express">Express Beauty Bar</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                Operating Timings
              </label>
              <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-3 py-2 focus-within:bg-white focus-within:border-rose-900 transition-all">
                <Clock className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="e.g. 09:00 AM - 09:00 PM"
                  className="w-full bg-transparent text-xs text-stone-900 outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-3">
            <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
              Address &amp; Direct Contact
            </span>

            <div>
              <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                Street Address
              </label>
              <div className="flex items-start bg-[#faf7fc] rounded-xl border border-purple-100 p-2.5 focus-within:bg-white focus-within:border-rose-900 transition-all">
                <MapPin className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0 mt-0.5" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-transparent text-xs text-stone-900 outline-none resize-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Helpline / Phone
                </label>
                <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-2.5 py-2 focus-within:bg-white focus-within:border-rose-900 transition-all">
                  <Phone className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Support Email
                </label>
                <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-2.5 py-2 focus-within:bg-white focus-within:border-rose-900 transition-all">
                  <Mail className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Management */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5">
            <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
              Amenities &amp; Hygiene Badges
            </span>

            <div className="flex flex-wrap gap-1.5">
              {amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-950 text-[11px] font-medium px-2.5 py-1 rounded-full border border-purple-200"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(item)}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2]" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                placeholder="Add custom amenity (e.g. Valet Parking)..."
                className="flex-1 bg-[#faf7fc] text-xs text-stone-900 placeholder:text-stone-400 rounded-xl border border-purple-100 px-3 py-2 outline-none focus:bg-white focus:border-rose-900 transition-all font-medium"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Floating Bottom Sticky Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-purple-100/80 shadow-lg">
        <div className="max-w-[480px] mx-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="profile-form"
            className="flex-1 py-2.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Profile</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
