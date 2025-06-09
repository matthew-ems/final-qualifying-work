// src/pages/StartScreen.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./startScreen.css";
import StartScreenIcon from "../../icons/LogoIcon";
import TelegramUserInfo from "../../components/TelegramUserInfo";
import useAuthorization from "../../hooks/useAuthorization";
import useRefreshToken from "../../hooks/useRefreshToken.jsx";
import tokenHandler from "../../components/TokenHandler.jsx";
import {useAuth} from "../../components/AuthContext.jsx";

const StartScreen = () => {
    const { id } = TelegramUserInfo();
    const [error, setError] = useState(null); // Состояние для ошибки
    const { setToken } = useAuth();
    const navigate = useNavigate();

    // telegram init data
    // tokenHandler refreshToken

    const { success, expired , accessToken} = tokenHandler.getAccessToken();
    const shouldRefreshToken = !success || expired;
    
    if (!shouldRefreshToken) {
        setToken(accessToken);
        navigate("/main");
    } else {
      tokenHandler.getRefreshToken();
    }

    useRefreshToken(shouldRefreshToken, setError);
    useAuthorization(id, setError);

    if (error){
        alert(error);
    }

    return (
        <div className="start-screen">
            <div className="svg-container">
                <StartScreenIcon color="currentColor" />
            </div>
            <div className="text-container">
                <h1>Freelance Network</h1>
                <p>Биржа фриланс-услуг</p>
            </div>
            <div className="buttons">
                <button
                    className="continue-button-customer"
                    onClick={() => navigate("/customer-step1")}
                >
                    Войти как заказчик
                </button>
                <button
                    className="continue-button-performer"
                    onClick={() => navigate("/performer-step1")}
                >
                    Войти как исполнитель
                </button>
            </div>
        </div>
    );
};

export default StartScreen;
