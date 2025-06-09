import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/api";
import TelegramUserInfo from "../components/TelegramUserInfo";
import TokenHandler from "../components/TokenHandler";

const RegistrationCustormer = () => {
    const { id, first_name, last_name, username, photo_url, language_code } =
        TelegramUserInfo();

    const [userData, setUserData] = useState({
        bio: "",
        role: "Customer",
        id: null,
        first_name: null,
        last_name: null,
        username: null,
        photo_url: null,
        language_code: null,
        tags: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        setUserData((prevData) => ({
            ...prevData,
            id,
            first_name,
            last_name,
            username,
            photo_url,
            language_code,
        }));

        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            navigate("/registration-page");
        });

        return () => {
            window.Telegram.WebApp.BackButton.offClick();
        };
    }, [navigate]);

    const handleBioChange = (e) => {
        const bio = e.target.value;
        setUserData((prevData) => ({ ...prevData, bio }));
    };

    const handleSubmit = async () => {
        const updatedData = {
            ...userData,
            id: id.toString(),
            first_name,
            last_name,
            username,
            photo_url,
            language_code,
            tags: userData.tags || "",
        };
        console.log("New data: ", updatedData);

        try {
            const result = await registerUser(updatedData);
            console.log("Результат вызова registerUser:", result);

            if (result.success) {
                console.log("Пользователь успешно зарегистрирован:", result.data);

                const { token: accessToken, refreshToken } = result.data;
                console.log("accessToken: ", accessToken, "refreshToken: ", refreshToken);
                TokenHandler.saveNewTokens(accessToken, refreshToken);

                console.log("Токены обновлены!");

                navigate("/");
            } else {
                console.error("Ошибка регистрации пользователя.");
            }

            setUserData((prevData) => ({
                ...prevData,
                ...updatedData,
            }));
        } catch (error) {
            console.error("Ошибка при вызове registerUser:", error);
        }
    };

    return (
        <div className="container">
            <div className="registration-screen">
                <div className="scroll">
                    <div className="title">
                        <h2>Информация</h2>
                        <textarea
                            className="info-textarea"
                            placeholder="Расскажите о себе..."
                            value={userData.bio}
                            onChange={handleBioChange}
                        ></textarea>
                    </div>
                </div>
                <div className="alone-btn-container">
                    <button className="continue-button" onClick={handleSubmit}>
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationCustormer;
