class TelegramInitData {
    static getDecodedInitData() {
        const initDataValue = window.Telegram?.WebApp?.initData || "";

        const decodedInitData = initDataValue ? decodeURIComponent(initDataValue) : "";

        return {
            successInitData: Boolean(initDataValue),
            decodedInitData: decodedInitData,
        };
    }
}

export default TelegramInitData;
