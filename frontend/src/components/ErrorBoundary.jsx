import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Audit Workspace ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-rose-900/60 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Unable to Display Accessibility Report View
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-lg mx-auto">
              An unexpected render issue occurred while generating the audit dashboard view. You can reload the report data or return to the overview.
            </p>
          </div>

          {this.state.error && (
            <div className="text-left bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Dashboard Home</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
