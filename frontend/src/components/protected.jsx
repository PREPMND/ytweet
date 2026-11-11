import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogIn } from "lucide-react";

import getCurrentUser from "../api/currentuser";
import { BlockLoader } from "./loader";
import { toast } from "./toast";

/**
 * Auth gate for routes that need a signed-in user.
 *
 * Previously these pages rendered regardless, then every request inside them
 * 401'd -- so the user got a blank screen, a console full of errors, or a
 * hard `window.location` redirect that threw away their place in the app.
 *
 * Three states:
 *   loading  -> spinner (NOT the signed-out panel; otherwise it flashes on
 *               every refresh before the session check comes back)
 *   signed out -> one toast + an inline prompt, URL preserved so the login
 *                 page can send them back here
 *   signed in  -> the page
 */
export default function Protected({ children, darkMode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const toasted = useRef(false);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: 1000 * 60,
        retry: false,
    });

    const user = data?.user;
    const checking = isLoading || (isFetching && !data);

    useEffect(() => {
        // `useRef` guard: without it, React's re-renders fire the toast
        // several times for a single navigation.
        if (!checking && !user && !toasted.current) {
            toasted.current = true;
            toast("Log in to open that page", { type: "info" });
        }
    }, [checking, user]);

    if (checking) {
        return <BlockLoader darkMode={darkMode} text="Checking your session" />;
    }

    if (!user) {
        return (
            <div
                className={`flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center
                    ${darkMode ? "bg-black text-white" : "bg-white text-neutral-900"}`}
            >
                <LogIn size={38} className="text-blue-500" />
                <h2 className="text-xl font-semibold tracking-tight">You need to be logged in</h2>
                <p className={`max-w-sm text-sm ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                    This page is only available to signed-in accounts.
                </p>

                <div className="mt-2 flex gap-3">
                    <button
                        // `state.from` lets the login screen return the user to
                        // where they were trying to go.
                        onClick={() => navigate("/login", { state: { from: location.pathname } })}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className={`rounded-lg border px-5 py-2 text-sm font-medium transition-colors
                            ${darkMode
                                ? "border-neutral-700 hover:bg-neutral-900"
                                : "border-neutral-300 hover:bg-neutral-100"}`}
                    >
                        Back to feed
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
