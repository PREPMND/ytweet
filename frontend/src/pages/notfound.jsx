import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound({ darkMode }) {
    const navigate = useNavigate();

    return (
        <div className={`flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center
            ${darkMode ? "bg-black text-white" : "bg-white text-neutral-900"}`}>
            <Compass size={44} className="text-blue-500" />
            <h1 className="text-3xl font-semibold tracking-tight">Nothing here</h1>
            <p className={`max-w-sm text-sm ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                That page doesn’t exist, or it moved somewhere else.
            </p>
            <button
                onClick={() => navigate("/")}
                className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
                Back to the feed
            </button>
        </div>
    );
}
