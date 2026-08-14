import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        // Parse the token from the URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (token) {
            try {
                // Decode token to get user info (assuming standard JWT structure)
                const decodedToken = jwtDecode(token);
                
                // Save token and user details to sessionStorage (per-tab isolation) and localStorage
                const userObj = JSON.stringify({
                    username: decodedToken.sub || decodedToken.username || 'User',
                    email: decodedToken.email || '',
                    roles: decodedToken.roles || []
                });
                sessionStorage.setItem('tripnest_token', token);
                sessionStorage.setItem('tripnest_user', userObj);
                localStorage.setItem('tripnest_token', token);
                localStorage.setItem('tripnest_user', userObj);
                
                // Redirect to dashboard
                navigate('/dashboard', { replace: true });
            } catch (error) {
                console.error("Failed to decode token from OAuth2 redirect:", error);
                navigate('/login?error=InvalidToken', { replace: true });
            }
        } else {
            // No token found in URL, redirect back to login
            navigate('/login?error=MissingToken', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-black/5 dark:bg-white/5">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Authenticating with Google...</h2>
                <p className="text-gray-500 mt-2">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
