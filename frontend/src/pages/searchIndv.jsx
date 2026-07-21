import { useEffect, useState } from "react";
import { searchUsers } from "../api/allcalls";

export default function SearchPage() {

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {

            try {

                setLoading(true);

                const data = await searchUsers(query);

                setResults(data);
                console.log(results);
                
            }
            catch (err) {

                console.log(err);

            }
            finally {

                setLoading(false);

            }

        }, 300);

        return () => clearTimeout(timer);

    }, [query]);

    return (

        <div className="p-6">

            <input
                type="text"
                placeholder="Search users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded-md w-full p-3"
            />

            {loading && <p>Searching...</p>}

            {!loading && results.length === 0 && query !== "" && (
                <p>No users found.</p>
            )}

            <div className="mt-6 flex flex-col gap-4">

                {results.map((user) => (

                    <div
                        key={user._id}
                        className="border rounded-lg p-4 flex gap-4 items-center"
                    >

                        <img
                            src={user.avatar}
                            alt=""
                            className="w-14 h-14 rounded-full"
                        />

                        <div>

                            <h2>{user.username}</h2>

                            <p>{user.email}</p>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );
}