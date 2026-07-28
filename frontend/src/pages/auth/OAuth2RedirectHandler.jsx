import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        // Parse the token from the URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (token) {
            try {
                // Decode token to get user info (assuming standard JWT structure)
                const decodedToken = jwtDecode(token);
                
                // Format the user object expected by AuthContext
                const userData = {
                    token: token,
                    username: decodedToken.sub || decodedToken.username,
                    // If your backend includes other fields in the JWT, extract them here
                };
                
                // Use the login function from AuthContext to store the token and user
                login(userData);
                
                // Redirect to dashboard or originally requested page
                navigate('/dashboard', { replace: true });
            } catch (error) {
                console.error("Failed to decode token from OAuth2 redirect:", error);
                navigate('/login?error=InvalidToken', { replace: true });
            }
        } else {
            // No token found in URL, redirect back to login
            navigate('/login?error=MissingToken', { replace: true });
        }
    }, [location, navigate, login]);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Authenticating with Google...</h2>
                <p className="text-gray-500 mt-2">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
