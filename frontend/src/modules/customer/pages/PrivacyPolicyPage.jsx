import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Lock,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Building,
  KeyRound,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomNav } from '../components/BottomNav';

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const policySections = [
    {
      id: 'collection',
      icon: <FileText className="w-4 h-4 text-brand-maroon" />,
      title: '1. Information We Collect',
      tag: 'Data Collection',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>
            When you use <strong>DrimStyle (Instaatrim)</strong> to discover and book salon services, we collect necessary personal details to ensure smooth appointment scheduling, secure payments, and personalized experiences:
          </p>
          <div className="space-y-2 pl-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Personal Identity:</strong> Your full name, mobile number, email address, profile picture, and optional gender or date of birth (used for birthday perks and tailored offers).
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Booking & Appointment Records:</strong> Selected salons, services, booked time slots, preferred hair stylists/specialists, special instructions, and appointment status history.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Location Details:</strong> With your permission, GPS or chosen locality (e.g., South Tukoganj, Indore) to showcase nearby verified salons and accurate estimated travel times.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Transaction & Payment Data:</strong> Transaction IDs, chosen payment method, invoice receipts, and refund statuses. <em>We never store your complete debit/credit card numbers or UPI PINs.</em>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-stone-900">Device & Usage Analytics:</strong> IP address, operating system, app session data, and crash reports to maintain app performance and prevent fraudulent activity.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      title: '2. How We Use Your Information',
      tag: 'Service Delivery',
      content: (
        <div className="space-y-2.5 text-stone-700 text-xs leading-relaxed">
          <p>We use your personal data strictly for legitimate operational purposes:</p>
          <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
            <li><strong>Instant Slot Confirmation:</strong> Communicating and securing your slot with verified salon partners in real-time.</li>
            <li><strong>Automated Alerts & Updates:</strong> Sending booking confirmations, live queue updates, reminders, and digital invoices via SMS, WhatsApp, and in-app notifications.</li>
            <li><strong>Customer Support & Dispute Resolution:</strong> Helping our dedicated support desk quickly resolve rescheduling queries, cancellations, or refund requests.</li>
            <li><strong>Loyalty & Rewards:</strong> Powering your DrimStyle Elite Club benefits, referral credits, and customized discount codes.</li>
            <li><strong>Platform Safety:</strong> Detecting, preventing, and handling unauthorized logins, identity impersonation, or suspicious payment activities.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'sharing',
      icon: <EyeOff className="w-4 h-4 text-amber-600" />,
      title: '3. Data Sharing & Third-Party Disclosure',
      tag: 'Zero Data Selling',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 text-amber-950 font-medium text-[11px]">
            🛡️ <strong>Our Core Promise:</strong> We NEVER sell, lease, or trade your personal information to third-party data brokers or marketing telemarketers.
          </div>
          <p>We only share data in the following restricted scenarios:</p>
          <div className="space-y-2 pl-2">
            <div>
              <strong className="text-stone-900">1. Partner Salons:</strong> Salons receive only the booking essentials (your customer name, selected services, and booking time). Contact information is provided exclusively for appointment fulfillment and communication.
            </div>
            <div>
              <strong className="text-stone-900">2. Trusted Payment Gateways:</strong> Transactions are routed through RBI-compliant, PCI-DSS certified payment processors (e.g., Razorpay) via bank-grade 256-bit encryption.
            </div>
            <div>
              <strong className="text-stone-900">3. Transactional Messaging Partners:</strong> Verified SMS/WhatsApp cloud gateways for delivering critical booking alerts and OTP verification codes.
            </div>
            <div>
              <strong className="text-stone-900">4. Legal Mandates:</strong> In the rare event of legal process, court orders, or law enforcement investigations where disclosure is required by law.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'hygiene',
      icon: <Shield className="w-4 h-4 text-emerald-600" />,
      title: '4. Partner Verification & Hygiene Standards',
      tag: 'Safety Standards',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>
            Customer safety is central to our platform. We hold all salons listed on DrimStyle to stringent operational standards:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-brand-maroon shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Pre-Listing Verification</p>
                <p className="text-[11px] text-stone-600 mt-0.5">Every partner salon must provide valid commercial registration, tax IDs, and complete an in-person audit before onboarding.</p>
              </div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Sanitization & Single-Use Kits</p>
                <p className="text-[11px] text-stone-600 mt-0.5">Mandatory sterilization of metal tools (shears, clippers) and single-use disposable items (capes, neck strips) across verified services.</p>
              </div>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900 text-xs">100% Verified Customer Reviews</p>
                <p className="text-[11px] text-stone-600 mt-0.5">Reviews and star ratings can only be submitted by verified customers who have completed appointments at that salon.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      icon: <Lock className="w-4 h-4 text-blue-600" />,
      title: '5. Data Security & Storage',
      tag: 'Data Protection',
      content: (
        <div className="space-y-2.5 text-stone-700 text-xs leading-relaxed">
          <p>We deploy robust digital and physical security protocols to keep your information safe:</p>
          <ul className="list-disc pl-4 space-y-1.5 text-stone-600">
            <li><strong>Transport Layer Security (TLS/SSL):</strong> All communication between your device and our servers is encrypted with TLS 1.3 encryption.</li>
            <li><strong>Encrypted Databases:</strong> Sensitive user tokens and credentials are securely hashed and stored in encrypted cloud repositories.</li>
            <li><strong>Strict Role-Based Access:</strong> Only authenticated personnel with operational necessity have audited access to customer support records.</li>
            <li><strong>Routine Penetration Audits:</strong> Continuous vulnerability scanning and firewall protections to guard against unauthorized access.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'rights',
      icon: <KeyRound className="w-4 h-4 text-rose-600" />,
      title: '6. Your Rights & Privacy Choices',
      tag: 'User Control',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>You maintain complete control over your personal account and privacy settings:</p>
          <div className="space-y-2 pl-2">
            <div>
              <strong className="text-stone-900">• Edit Your Profile:</strong> You can update your name, gender, birthday, and location directly through the <em>Edit Profile</em> tab at any time.
            </div>
            <div>
              <strong className="text-stone-900">• Manage Location Permissions:</strong> You can turn off device GPS access anytime in your device browser settings; you can still manually select any salon locality.
            </div>
            <div>
              <strong className="text-stone-900">• Promotional Communications:</strong> You can opt out of promotional marketing messages by tapping unsubscribe in emails or messaging "STOP" to our WhatsApp alerts, while preserving critical booking alerts.
            </div>
            <div>
              <strong className="text-stone-900">• Account Deletion & Right to be Forgotten:</strong> You can request full deletion of your account and personal history by contacting our privacy grievance desk.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      icon: <HelpCircle className="w-4 h-4 text-brand-maroon" />,
      title: '7. Grievance Officer & Contact Us',
      tag: 'Support Desk',
      content: (
        <div className="space-y-3 text-stone-700 text-xs leading-relaxed">
          <p>
            If you have questions, feedback, or grievances regarding our privacy policies or data protection practices, please contact our support desk:
          </p>
          <div className="space-y-2 bg-white/80 p-3 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
              <span>Email: <a href="mailto:support@instaatrim.com" className="font-bold text-brand-maroon underline">support@instaatrim.com</a></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
              <span>Toll-Free Helpline: <strong>1800-200-8899</strong> (9:00 AM – 9:00 PM, All Days)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Building className="w-3.5 h-3.5 text-brand-maroon shrink-0 mt-0.5" />
              <span><strong>DrimStyle / Instaatrim Support Desk</strong><br />Indore, Madhya Pradesh, India</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 italic">
            Last Updated: October 2026. This policy may be updated periodically to reflect changes in our service features or regulatory frameworks.
          </p>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-24 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 py-2.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/80 border border-purple-100 flex items-center justify-center text-stone-700 active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <span className="text-[9px] font-bold tracking-widest text-brand-maroon uppercase block leading-none">
              DrimStyle Legal
            </span>
            <h1 className="text-sm font-bold text-stone-900 leading-tight mt-0.5">
              Safety & Privacy Policy
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
          <Shield className="w-3 h-3 text-emerald-700" />
          <span>Verified & Safe</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-3.5 space-y-3.5 flex-1">
        {/* Hero Trust Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-stone-900 via-[#261528] to-stone-900 text-white p-4 shadow-md">
          <div className="absolute top-0 right-0 w-36 h-36 bg-brand-maroon/30 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-stone-200 text-[10px] font-medium backdrop-blur-sm mb-2 border border-white/10">
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Bank-Grade Encryption & Zero Data Sale</span>
            </div>
            <h2 className="text-base font-bold leading-snug">
              Your Privacy & Safety Are Our Highest Priority
            </h2>
            <p className="text-[11px] text-stone-300 mt-1.5 leading-relaxed">
              We are committed to full transparency regarding how your data is collected, protected, and used to provide salon booking services.
            </p>

            {/* Quick Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="block text-xs font-bold text-amber-300">100%</span>
                <span className="text-[9px] text-stone-300 leading-tight block mt-0.5">Encrypted Traffic</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="block text-xs font-bold text-emerald-400">Zero</span>
                <span className="text-[9px] text-stone-300 leading-tight block mt-0.5">Data Selling</span>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5 border border-white/5">
                <span className="block text-xs font-bold text-purple-300">Verified</span>
                <span className="text-[9px] text-stone-300 leading-tight block mt-0.5">Partner Salons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Box */}
        <div className="bg-white/90 rounded-xl p-3 border border-purple-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-brand-maroon flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-stone-900">Need immediate help with a booking?</p>
              <p className="text-[10px] text-stone-500">Contact our 24x7 support desk or raise a ticket.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/customer/account')}
            className="text-[11px] font-bold text-brand-maroon px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors shrink-0"
          >
            Help Desk
          </button>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-3">
          {policySections.map((sec) => (
            <div
              key={sec.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5 transition-all hover:border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                    {sec.icon}
                  </div>
                  <h3 className="font-bold text-xs text-stone-900">{sec.title}</h3>
                </div>
                <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                  {sec.tag}
                </span>
              </div>
              <div className="pt-1">
                {sec.content}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 rounded-2xl p-3.5 border border-purple-200/80 text-center space-y-1">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-maroon text-white mb-1 shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-stone-900">Your Trust, Our Responsibility</p>
          <p className="text-[10px] text-stone-600 max-w-xs mx-auto">
            DrimStyle ensures clean, verified, and secure salon services every single appointment.
          </p>
        </div>
      </main>

      {/* Navigation bar */}
      <BottomNav />
    </motion.div>
  );
};
export default PrivacyPolicyPage;
