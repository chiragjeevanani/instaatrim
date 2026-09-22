import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { api } from '../../../shared/services/api';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  FileCheck,
  Edit2,
  Check,
  ChevronRight,
  MessageSquare,
  Send
} from 'lucide-react';

// The salon's public-facing listing — what a customer sees on the
// customer app's SalonProfilePage. Reachable from the owner's Account
// hub rather than being the "Profile" tab itself; an owner's own profile
// and a business's public listing are different things (see
// SalonProfilePage.jsx, the actual owner account hub).
export const SalonBusinessProfilePage = () => {
  const navigate = useNavigate();
  const { salonProfile, salonId, setSalonProfile, showToast } = useSalon();
  const { state } = useAppData();

  const [isEditingHours, setIsEditingHours] = useState(false);
  const [openHoursInput, setOpenHoursInput] = useState(salonProfile.openHours);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Defect fix: this used to render a local hardcoded mockReviews array —
  // always the same two reviews regardless of what customers actually
  // wrote, and disconnected from the customer app entirely. Now reads the
  // same shared review collection the customer side writes to.
  const reviews = state.reviews.filter((r) => r.salonId === salonId);

  const handleSaveHours = () => {
    setSalonProfile((prev) => ({ ...prev, openHours: openHoursInput }));
    setIsEditingHours(false);
    showToast('Operating hours updated successfully');
  };

  const submitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    await api.reviews.reply(reviewId, replyText.trim());
    showToast('Reply posted');
    setReplyingToId(null);
    setReplyText('');
  };

  return (
    <div className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border">
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/salon/profile')} className="p-1 -ml-1 text-stone-700 active:scale-95">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <h1 className="text-[14px] font-bold text-stone-900 tracking-tight">Business Listing</h1>
            <p className="text-[10.5px] text-stone-400 font-normal">What customers see on InstaaTrim</p>
          </div>
        </div>

        {/* Salon Cover & Header */}
        <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs">
          <div className="relative h-32 w-full bg-stone-900">
            <img
              src={salonProfile.coverImage}
              alt={salonProfile.name}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-2.5 right-2.5">
              <span
                className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border ${
                  salonProfile.verificationStatus === 'Live'
                    ? 'bg-emerald-600 text-white border-emerald-400/40'
                    : salonProfile.verificationStatus === 'Rejected'
                    ? 'bg-red-600 text-white border-red-400/40'
                    : 'bg-amber-500 text-stone-950 border-amber-300 font-extrabold'
                }`}
              >
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                {salonProfile.verificationStatus || 'Pending'}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-stone-900 tracking-tight">
                  {salonProfile.name}
                </h2>
                <p className="text-[10.5px] text-stone-400 mt-0.5 font-normal">
                  Owner: {salonProfile.ownerName} • {salonProfile.category} Salon
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{salonProfile.rating}</span>
                  <span className="text-[10px] font-medium text-stone-400">({salonProfile.reviewsCount})</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/salon/profile/edit')}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 active:scale-95 px-2.5 py-1 rounded-lg border border-rose-200 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 stroke-[2]" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>

            {/* Address & Location */}
            <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex items-start gap-2.5 text-stone-600 text-[11px] font-normal">
                <MapPin className="w-3.5 h-3.5 text-rose-900 shrink-0 mt-0.5 stroke-[2]" />
                <span>{salonProfile.address}</span>
              </div>

              <div className="flex items-center gap-2.5 text-stone-600 text-[11px] font-normal">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0 stroke-[2]" />
                {isEditingHours ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={openHoursInput}
                      onChange={(e) => setOpenHoursInput(e.target.value)}
                      className="text-xs px-2 py-1 bg-white text-stone-900 rounded-lg border border-stone-200 font-medium"
                    />
                    <button
                      onClick={handleSaveHours}
                      className="px-2.5 py-1 bg-rose-900 text-white text-[10px] font-bold rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium text-stone-800">{salonProfile.openHours}</span>
                    <button
                      onClick={() => setIsEditingHours(true)}
                      className="text-[10.5px] font-bold text-rose-900 hover:underline"
                    >
                      Edit Hours
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-stone-600 text-[11px] font-normal">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0 stroke-[1.8]" />
                <span>{salonProfile.mobile}</span>
              </div>

              <div className="flex items-center gap-2 text-stone-600 text-[11px] font-normal">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0 stroke-[1.8]" />
                <span>{salonProfile.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & KYC Status Link */}
        <div
          onClick={() => navigate('/salon/onboarding')}
          className="bg-white rounded-2xl p-3 border border-purple-100 shadow-2xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-medium text-xs">
              <FileCheck className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-stone-800">
                Partner Documents &amp; Bank KYC
              </h3>
              <p className="text-[10px] text-stone-500 font-normal">
                GSTIN, Shop Act License &amp; Bank Verified
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 stroke-[1.8]" />
        </div>

        {/* Amenities Checklist */}
        <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-2xs space-y-2">
          <h3 className="text-xs font-semibold text-stone-800">
            Salon Amenities &amp; Hygiene Standards
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {salonProfile.amenities.map((amenity, i) => (
              <span
                key={i}
                className="text-[9.5px] bg-purple-50 text-purple-950 font-normal px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1"
              >
                <Check className="w-2.5 h-2.5 text-brand-maroon stroke-[2]" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Customer Reviews & Reply Section — now the real, shared review data */}
        <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-stone-800">
              Customer Reviews ({reviews.length})
            </h3>
            <span className="text-[10px] text-stone-400 font-normal">Verified Bookings</span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-[11px] text-stone-500">No reviews yet.</p>
          ) : (
            <div className="space-y-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-2.5 bg-stone-50/80 rounded-xl border border-stone-200/70 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-stone-800">{rev.customerName}</span>
                      <span className="text-[9.5px] text-stone-400 font-normal">• {rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400 stroke-[1.8]" />
                      ))}
                    </div>
                  </div>

                  <p className="text-[10.5px] text-stone-600 leading-snug font-normal">
                    "{rev.comment}"
                  </p>

                  {rev.reply ? (
                    <div className="p-2 bg-purple-50/70 rounded-lg border border-purple-200/50 text-[9.5px] text-purple-950 space-y-0.5">
                      <span className="font-semibold text-brand-maroon">Salon Owner Response:</span>
                      <p className="font-normal">{rev.reply}</p>
                    </div>
                  ) : replyingToId === rev.id ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitReply(rev.id)}
                        placeholder="Write a reply..."
                        className="flex-1 text-[10.5px] px-2 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                      />
                      <button
                        onClick={() => submitReply(rev.id)}
                        className="p-1.5 bg-brand-maroon text-white rounded-lg active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingToId(rev.id);
                        setReplyText('');
                      }}
                      className="text-[10px] font-medium text-brand-maroon hover:underline flex items-center gap-1 mt-1"
                    >
                      <MessageSquare className="w-3 h-3 stroke-[1.8]" />
                      <span>Reply to Customer</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
