import { useEffect, useState } from "react";

const TelegramUserInfo = () => {
  const [userData, setUserData] = useState({
    id: null,
    username: null,
    photo_url: null,
    first_name: null,
    last_name: null,
    language_code: null,
  });

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;

      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        setUserData({
          id: String(user.id),
          username: user.username,
          photo_url: user.photo_url,
          first_name: user.first_name,
          last_name: user.last_name,
          language_code: user.language_code,
        });
      } else {
        console.error("Telegram data could not be retrieved");
      }
    } else {
      console.error("Telegram WebApp not found");
    }
  }, []);

  return userData;
};

export default TelegramUserInfo;
