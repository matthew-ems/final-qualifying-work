import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDirection, getAllExperience, registerUser } from "../api/api";
import TelegramUserInfo from "../components/TelegramUserInfo";
import TokenHandler from "../components/TokenHandler";

const specializationTranslations = {
    "Other": "Прочее",
    "Design": "Дизайн",
    "Development": "Разработка",
    "Testing": "Тестирование",
    "Content": "Контент",
    "Administration": "Администрирование",
    "Marketing": "Маркетинг"
};

const experienceTranslations = {
    "more than 8 years": "Более 8 лет",
    "up to 2 years": "До 2 лет",
    "from 2 to 5 years": "От 2 до 5 лет",
    "from 5 to 8 years": "От 5 до 8 лет",
    "No experience": "Без опыта"
};

const RegistrationPerformer = () => {
    const { id, first_name, last_name, username, photo_url, language_code } =
        TelegramUserInfo();

    const [userData, setUserData] = useState({
        bio: "",
        experienceId: null,
        directionId: null,
        role: "Performer",
        id: null,
        first_name: null,
        last_name: null,
        username: null,
        photo_url: null,
        language_code: null,
        tags: ""
    });

    const navigate = useNavigate();
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [experience, setExperience] = useState([]);

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

        const fetchAllDirections = async () => {
            const { success, data, error } = await getAllDirection();

            if (success) {
                setSpecializations(data);
            } else {
                console.error("Ошибка получения данных:", error);
            }
        };

        const fetchAllExperience = async () => {
            const { success, data, error } = await getAllExperience();

            if (success) {
                setExperience(data);
            } else {
                console.error("Ошибка получения данных:", error);
            }
        };

        fetchAllExperience();
        fetchAllDirections();

        return () => {
            window.Telegram.WebApp.BackButton.offClick();
        };
    }, [first_name, id, language_code, last_name, navigate, photo_url, username]);

    const handleSpecializationClick = (item) => {
        setSelectedSpecialization(item.title);
        setUserData((prevData) => ({ ...prevData, directionId: item.id }));
    };

    const handleExperienceClick = (item) => {
        setSelectedExperience(item.title);
        setUserData((prevData) => ({ ...prevData, experienceId: item.id }));
    };

    const handleBioChange = (e) => {
        const bio = e.target.value;
        setUserData((prevData) => ({ ...prevData, bio }));
    };

    const handleTagsChange = (e) => {
        const tags = e.target.value;
        setUserData((prevData) => ({ ...prevData, tags }));
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
        };
        console.log("New data: ", updatedData);

        try {
            // Передаем данные в registerUser
            const result = await registerUser(updatedData);
            console.log("Результат вызова registerUser:", result);

            if (result.success) {
                console.log("Пользователь успешно зарегистрирован:", result.data);

                const { token: accessToken, refreshToken } = result.data;
                console.log("accessToken: ", accessToken, "refreshToken: ", refreshToken)
                TokenHandler.saveNewTokens(accessToken, refreshToken);

                console.log("Токены обновлены!")

                // Переход на главную страницу
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
                    <div className="specialization">
                        <h2>Специализация</h2>
                        <div className="button-container">
                            {specializations.map((item) => (
                                <button
                                    key={item.id}
                                    className={`specialization-button ${
                                        selectedSpecialization === item.title ? "active" : ""
                                    }`}
                                    onClick={() => handleSpecializationClick(item)}
                                >
                                    {specializationTranslations[item.title] || item.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="experience">
                        <h2>Опыт</h2>
                        <div className="button-container">
                            {experience.map((item) => (
                                <button
                                    key={item.id}
                                    className={`experience-button ${
                                        selectedExperience === item.title ? "active" : ""
                                    }`}
                                    onClick={() => handleExperienceClick(item)}
                                >
                                    {experienceTranslations[item.title] || item.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="title">
                        <h2>Дополнительная информация</h2>
                        <textarea
                            className="info-textarea"
                            placeholder="Расскажите о себе..."
                            value={userData.bio}
                            onChange={handleBioChange}
                        ></textarea>
                    </div>
                    <div className="title">
                        <h2>Теги (через запятую)</h2>
                        <textarea
                            className="info-textarea"
                            placeholder="Введите теги..."
                            value={userData.tags}
                            onChange={handleTagsChange}
                        ></textarea>
                    </div>
                </div>
                <div className="alone-btn-container">
                    <button className="btn" onClick={handleSubmit}>
                        Зарегистрироваться
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPerformer;
