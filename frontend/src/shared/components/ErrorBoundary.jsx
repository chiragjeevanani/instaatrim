import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// Top-level safety net. Without this, any uncaught render error — like
// the HoldCountdown crash this caught during testing (a plain timestamp
// passed where a Date was expected) — unmounts the entire React tree and
// leaves a blank white page with no way back short of a manual refresh.
// Precisely the failure mode to avoid mid-demo.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = '/customer';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f4fb] px-6">
          <div className="max-w-[320px] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-sm font-bold text-stone-900">Something went wrong</h1>
            <p className="text-xs text-stone-500 leading-relaxed">
              This screen hit an unexpected error. Your cart and bookings are safe — tap below to return home.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-maroon text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
