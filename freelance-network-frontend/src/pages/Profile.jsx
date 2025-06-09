import React, { useEffect, useState } from "react";
import TokenHandler from "../components/TokenHandler";
import defaultIcon from "../icons/default-avatar.svg";
import starsIcon from "../icons/stars.svg";
import { getUserInfo, getProfileInfo, getReviewsByUser } from "../api/api.jsx";
import TelegramUserInfo from "../components/TelegramUserInfo";
import "./style.css";

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

const Profile = () => {
    const { id } = TelegramUserInfo();
    const [profileData, setProfileData] = useState({
        photoUrl: "",
        firstName: "Имя",
        lastName: "",
        rating: "5",
        direction: "Специализация",
        experience: "Опыт",
        bio: "Описание о себе.",
        role: "",
    });

    const [reviews, setReviews] = useState([]); // Для хранения отзывов
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [usersInfo, setUsersInfo] = useState({});
    const [averageRating, setAverageRating] = useState(null);

    useEffect(() => {
        const tokens = TokenHandler.checkTokens();
        console.log("Tokens status:", tokens);

        if (!id) return;

        (async () => {
            try {
                const [UserInfo, ProfileInfo] = await Promise.all([
                    getUserInfo(id),
                    getProfileInfo(),
                ]);

                if (UserInfo && ProfileInfo) {
                    setProfileData({
                        firstName: UserInfo.dto?.firstName || "Имя",
                        lastName: UserInfo.dto?.lastName || "",
                        rating: "5",
                        direction: ProfileInfo.direction || "Специализация",
                        experience: ProfileInfo.experience || "Опыт",
                        bio: ProfileInfo.bio || "Описание о себе.",
                        role: ProfileInfo.role || "",
                        photoUrl: UserInfo.dto?.photoUrl || defaultIcon,
                    });
                }

                const { success, data } = await getReviewsByUser();
                if (success) {
                    setReviews(data);
                    const usersData = {};
                    await Promise.all(
                        data.map(async (review) => {
                            if (!usersData[review.authorId]) {
                                const userData = await getUserInfo(review.authorId);
                                usersData[review.authorId] = {
                                    firstName: userData.dto?.firstName || "Пользователь",
                                    photoUrl: userData.dto?.photoUrl || defaultIcon,
                                };
                            }
                        })
                    );
                    setUsersInfo(usersData);

                    // Рассчитываем средний рейтинг
                    const totalRating = data.reduce((acc, review) => acc + review.rating, 0);
                    const avgRating = totalRating / data.length;
                    setAverageRating(avgRating > 0 ? avgRating.toFixed(1) : "Нет отзывов"); // Если нет оценок, показываем "Нет"
                }
            } catch (error) {
                console.error("Ошибка при загрузке профиля:", error);
            } finally {
                setLoadingReviews(false);
            }
        })();
    }, [id]);

    return (
        <div className="container">
            <div className="profile-performer-screen">
                <div className="profile-header">
                    <img
                        src={profileData.photoUrl || defaultIcon}
                        alt="User Avatar"
                        className="avatar-icon"
                    />
                </div>

                <div className="profile-info">
                    <div className="nickname">
                        <h1>{profileData.firstName}</h1>
                        {profileData.role === "Performer" && (
                            <div className="rating">
                                <img src={starsIcon} alt="Star icon" className="star-icon" />
                                <span>{averageRating || "Нет"}</span>
                            </div>
                        )}
                    </div>
                    {profileData.role === "Performer" && (
                        <>
                            <h2 className="specialization">
                                {specializationTranslations[profileData.direction] || profileData.direction}
                            </h2>
                            <h2 className="experience">
                                Опыт: {experienceTranslations[profileData.experience] || profileData.experience}
                            </h2>
                        </>
                    )}
                </div>

                <div className="about-section">
                    <h1>О себе</h1>
                    <p>{profileData.bio}</p>
                </div>

                <div className="reviews-section">
                    {loadingReviews ? (
                        <div className="spinner"></div>
                    ) : (
                        reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="review-item">
                                    <div className="review-header">
                                        <div className="review-header-left">
                                            <img
                                                src={usersInfo[review.authorId]?.photoUrl || defaultIcon}
                                                alt="User Avatar"
                                                className="review-avatar"
                                            />
                                            <strong>{usersInfo[review.authorId]?.firstName || "Пользователь"}</strong>
                                        </div>
                                        <div className="review-header-right">
                                            <div className="rating">
                                                <img src={starsIcon} alt="Star" className="star-icon" />
                                                <span>{review.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-body">
                                        <p>{review.comment}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Отзывов нет.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
