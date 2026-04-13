import { useQuery } from '@tanstack/react-query';
import getCurrentUser from '../api/currentuser.jsx';
const Home = () => {
    
    const { data} = useQuery({
            queryKey: ["currentUser"],
            queryFn: getCurrentUser
        });
    return (
        <div>
            {data ? (
                <div>
                    <h2>{data.message}</h2>
                    <p><strong>ID:</strong> {data.user._id}</p>
                    <p><strong>Email:</strong> {data.user.email}</p>
                    <p><strong>Full Name:</strong> {data.user.fullName}</p>
                    {/* Add more fields as needed */}
                </div>
            ) : (
                "Loading..."
            )}
        </div>
    );
};

export default Home;