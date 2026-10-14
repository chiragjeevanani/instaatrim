import { createElement } from 'react';
import {
  Zap,
  ShieldCheck,
  Tag,
  Calendar,
  Users,
  Wallet,
  TrendingUp,
  Star,
  CreditCard,
  RefreshCw,
  Gift,
  Scissors,
  BarChart3,
  Sparkles,
  Clock,
  MapPin,
  Heart,
  Crown
} from 'lucide-react';

// Icon keys admins can pick for landing page chips & feature cards.
export const LANDING_ICONS = {
  zap: Zap,
  shield: ShieldCheck,
  tag: Tag,
  calendar: Calendar,
  users: Users,
  wallet: Wallet,
  trending: TrendingUp,
  star: Star,
  card: CreditCard,
  refresh: RefreshCw,
  gift: Gift,
  scissors: Scissors,
  chart: BarChart3,
  sparkles: Sparkles,
  clock: Clock,
  pin: MapPin,
  heart: Heart,
  crown: Crown
};

// Renders the icon for an admin-chosen key (falls back to Sparkles).
export const LandingIcon = ({ name, ...props }) => createElement(LANDING_ICONS[name] || Sparkles, props);
