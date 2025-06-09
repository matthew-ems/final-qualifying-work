import { getProfileInfo } from "../api/api.jsx";
import TelegramUserInfo from "../components/TelegramUserInfo";

const getUserRole = async () => {
    const { id } = TelegramUserInfo();
    if (!id) return "";

    try {
        const profileInfo = await getProfileInfo(id);
        return profileInfo?.role || "";
    } catch (error) {
        console.error("Ошибка при получении роли пользователя:", error);
        return "";
    }
};

export default getUserRole;
