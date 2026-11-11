import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MessageCircle } from "lucide-react";
import { searchUsers } from "../api/allcalls";

export default function SearchPage({ darkMode }) {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setError(null);
            return;
        }

        // Debounce: one request 300ms after typing stops, not one per key.
        const timer = setTimeout(async () => {
            // `cancelled` guards against a slow earlier response landing after
            // a newer one and overwriting it (the classic race in search UIs).
            let cancelled = false;

            try {
                setLoading(true);
                setError(null);
                const data = await searchUsers(query);
                if (!cancelled) setResults(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Search failed");
                    setResults([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }

            return () => {
                cancelled = true;
            };
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const card = darkMode
        ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
        : "bg-white border-neutral-200 hover:border-neutral-300";

    return (
        <div className={`min-h-screen px-4 pb-24 pt-6 ${darkMode ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"}`}>
            <div className="mx-auto w-full max-w-2xl">
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">Find people</h1>

                <div className="relative">
                    <Search
                        size={18}
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-neutral-500" : "text-neutral-400"}`}
                    />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search by username or name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={`w-full rounded-xl border py-3 pl-11 pr-4 text-[15px] outline-none transition-colors
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                            ${darkMode
                                ? "border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
                                : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400"}`}
                    />
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    {loading &&
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className={`flex animate-pulse items-center gap-4 rounded-xl border p-4 ${card}`}
                            >
                                <div className={`h-12 w-12 shrink-0 rounded-full ${darkMode ? "bg-neutral-800" : "bg-neutral-200"}`} />
                                <div className="flex-1 space-y-2">
                                    <div className={`h-3 w-32 rounded ${darkMode ? "bg-neutral-800" : "bg-neutral-200"}`} />
                                    <div className={`h-3 w-20 rounded ${darkMode ? "bg-neutral-800" : "bg-neutral-200"}`} />
                                </div>
                            </div>
                        ))}

                    {error && !loading && (
                        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {!loading && !error && query.trim() && results.length === 0 && (
                        <p className={`py-10 text-center text-sm ${darkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                            No users match “{query}”.
                        </p>
                    )}

                    {!loading &&
                        results.map((user) => (
                            <div
                                key={user._id}
                                className={`group flex items-center gap-4 rounded-xl border p-4 transition-colors ${card}`}
                            >
                                <button
                                    onClick={() => navigate(`/${user.username}`)}
                                    className="relative shrink-0"
                                    aria-label={`Open ${user.username}'s channel`}
                                >
                                    <img
                                        src={user.avatar || "https://i.sstatic.net/lsh78.jpg"}
                                        alt=""
                                        className="h-12 w-12 rounded-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    {user.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-emerald-500" />
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate(`/${user.username}`)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <h2 className="truncate text-[15px] font-medium">
                                        {user.fullName || user.username}
                                    </h2>
                                    <p className={`truncate text-[13px] ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                                        @{user.username}
                                    </p>
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(`/message/${user._id}`, { state: { receiver: user } })
                                    }
                                    title="Send a message"
                                    className={`shrink-0 rounded-lg p-2 transition-colors ${darkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
                                >
                                    <MessageCircle size={18} />
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
