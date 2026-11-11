import { Component } from "react";

/**
 * Error boundaries MUST be class components -- there is no hook equivalent,
 * because `componentDidCatch` / `getDerivedStateFromError` have no hook API.
 *
 * What it catches: errors thrown during RENDER, in lifecycle methods, and in
 * constructors of the tree below it.
 * What it does NOT catch: event handlers, async code (setTimeout, promises),
 * server-side rendering, and errors thrown in the boundary itself. Those
 * still need their own try/catch.
 *
 * Without one, any render-time throw unmounts the ENTIRE React tree and the
 * user sees a blank white page -- which is exactly what
 * "videos.map is not a function" did to the watch page.
 */
export default class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        // Runs during the render phase: return the new state, no side effects.
        return { error };
    }

    componentDidCatch(error, info) {
        // Runs during the commit phase: the place for logging / reporting.
        console.error("Render error:", error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ error: null });
    };

    render() {
        const { error } = this.state;
        const { darkMode, children } = this.props;

        if (!error) return children;

        return (
            <div
                className={`flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center
                    ${darkMode ? "bg-black text-white" : "bg-white text-neutral-900"}`}
            >
                <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
                <p className={`max-w-md text-sm ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                    This part of the page failed to render. The rest of the app is still fine.
                </p>

                <pre
                    className={`max-w-lg overflow-x-auto rounded-lg p-3 text-left text-[12px]
                        ${darkMode ? "bg-neutral-900 text-red-300" : "bg-neutral-100 text-red-600"}`}
                >
                    {error.message}
                </pre>

                <div className="mt-2 flex gap-3">
                    <button
                        onClick={this.handleReset}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => { window.location.href = "/"; }}
                        className={`rounded-lg border px-5 py-2 text-sm font-medium
                            ${darkMode ? "border-neutral-700 hover:bg-neutral-900" : "border-neutral-300 hover:bg-neutral-100"}`}
                    >
                        Back to feed
                    </button>
                </div>
            </div>
        );
    }
}
