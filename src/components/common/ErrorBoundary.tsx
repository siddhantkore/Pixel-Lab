import React from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Pixel-Lab crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] grid place-items-center px-6">
          <div className="max-w-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center mx-auto">
              <AlertTriangle size={26} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-600">
              {this.state.error.message}
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}