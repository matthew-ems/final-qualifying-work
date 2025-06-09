import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TelegramUserInfo from "../../../components/TelegramUserInfo";
import "./profile.css";
import defaultVideo from "../../../videos/defaultAvatar.gif";
import starIcon from "./static/stars.svg";
import { useAuth } from "../../../components/AuthContext";
import { fetchProfileInfo } from "../../../api/api"; 

const optionsExperience = [
  { label: "Intern", value: 1 },
  { label: "Junior (up to 2 years)", value: 2 },
  { label: "Middle (2-5 years)", value: 3 },
  { label: "Senior (5-8 years)", value: 4 },
  { label: "Lead (8+ years)", value: 5 },
];

// Функция для получения метки опыта
const getExperienceLabel = (experience) => {
  const option = optionsExperience.find((opt) => opt.value === experience);
  return option ? option.label : "Нет данных";
};

// Основной компонент профиля
const ProfileExecutor = () => {
  const navigate = useNavigate(); 
  const { id, avatarUrl, first_name, last_name } = TelegramUserInfo();
  const { token } = useAuth(); 

  const [profileInfo, setProfileInfo] = useState({
    photoUrl: "",
    bio: "",
    experience: 0,
    direction: "",
    role: "",
  });

  // Функция для загрузки информации о профиле
  const loadProfileInfo = async () => {
    if (id && token) {
      try {
        const data = await fetchProfileInfo(id, token);
        setProfileInfo(data);
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      }
    }
  };

  // Хук для загрузки профиля
  useEffect(() => {
    loadProfileInfo();
  }, [id, token]);

  // Функция для рендеринга контента в зависимости от роли
  const renderContentByRole = () => {
    if (profileInfo.role === "Performer") {
      return (
        <>
          <p className="profile-job-title">
            {profileInfo.direction || "Загрузка..."}
          </p>
          <p className="profile-experience">
            {getExperienceLabel(profileInfo.experience) || "Загрузка..."}
          </p>
          <p className="profile-about-title">О себе</p>
          <p className="profile-about-text">
            {profileInfo.bio || "Нет данных"}
          </p>
        </>
      );
    } else if (profileInfo.role === "Customer") {
      return (
        <>
          <p className="profile-about-title">О себе</p>
          <p className="profile-about-text">
            {profileInfo.bio || "Нет данных"}
          </p>
        </>
      );
    } else {
      return <p>Загрузка...</p>;
    }
  };

  return (
    <div className="profile-executor">
      <div className="gradient-circle"></div>
      <div className="top-right-circle"></div>
      <img
        src={avatarUrl || defaultVideo}
        alt="User Avatar"
        className="profile-avatar"
      />
      <div className="profile-info">
        <span className="profile-nickname">
          {first_name} {last_name}
        </span>
        <div className="profile-rating">
          <span className="rating-score">5</span>
          <img src={starIcon} alt="Rating Stars" />
        </div>
      </div>
      {renderContentByRole()}
    </div>
  );
};

export default ProfileExecutor;
