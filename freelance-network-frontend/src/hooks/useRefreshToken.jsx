import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken } from "../api/api";
import { useAuth } from "../components/AuthContext";
import tokenHandler from "../components/TokenHandler.jsx";

const useRefreshToken = (shouldRefreshToken, setError) => {
    const navigate = useNavigate();
    const { setToken } = useAuth();

    useEffect(() => {
        const handleRefreshToken = async () => {
            try {
                if (shouldRefreshToken) {  // Выполняем только если флаг установлен в true
                    const result = await refreshToken();
                    if (result.success && result.data) {
                        setToken(result.data);
                        tokenHandler.saveAccessToken(result.data);
                        navigate("/main");
                    } else {
                        throw new Error(result.error || "Unknown refresh token error");
                    }
                }
            } catch (error) {
                console.warn("Refreshing token error:", error);
                setError("Refreshing token error:\n" + error.message);
            }
        };

        handleRefreshToken();
    }, [shouldRefreshToken, navigate, setToken, setError]);
};

export default useRefreshToken;
