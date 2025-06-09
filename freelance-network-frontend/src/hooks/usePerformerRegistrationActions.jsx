import { useNavigate } from "react-router-dom";
import { usePerformerRegistration } from "../components/PerformerRegistrationContext";
import { registerUser, createOrUpdateProfile } from "../api/api"; // Импортируем функции из API

const usePerformerRegistrationActions = (telegramUserData) => {
  const navigate = useNavigate();
  const { registrationData, setRegistrationData } = usePerformerRegistration();

  const completeRegistration = async (aboutYou) => {
    if (!aboutYou.trim()) {
      alert("Пожалуйста, расскажите о себе.");
      return;
    }

    const profileData = {
      bio: aboutYou,
      experience: registrationData.experience,
      directionId: registrationData.directionId,
      role: "Performer",
    };

    try {
      // Регистрация пользователя
      const registerResult = await registerUser(telegramUserData);

      if (!registerResult.success) {
        throw new Error(registerResult.error || "Ошибка регистрации");
      }

      // Создание или обновление профиля пользователя
      const profileResult = await createOrUpdateProfile(
        telegramUserData.id,
        profileData
      );

      if (!profileResult.success) {
        throw new Error(profileResult.error || "Ошибка создания профиля");
      }

      console.log("Профиль успешно создан/обновлен");
      navigate("/"); // Навигация только при успешной регистрации профиля
    } catch (error) {
      console.error("Произошла ошибка:", error.message);
      alert("Ошибка при регистрации. Пожалуйста, попробуйте еще раз.");
    }
  };

  return { completeRegistration, registrationData, setRegistrationData };
};

export default usePerformerRegistrationActions;
