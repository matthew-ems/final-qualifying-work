class TokenHandler {
    static getAccessToken() {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            return {
                success: false,
                expired: true,
                accessToken: "",
            };
        }

        try {
            const tokenData = JSON.parse(atob(accessToken.split(".")[1]));
            const expirationTime = tokenData.exp * 1000;
            const BUFFER_TIME = 5 * 60 * 1000;
            const timeUntilExpiration = expirationTime - Date.now();

            return {
                success: timeUntilExpiration > BUFFER_TIME,
                expired: timeUntilExpiration <= BUFFER_TIME,
                accessToken,
            };
        } catch (error) {
            this.logError(`Error decoding access token: ${error.message}`);
            return {
                success: false,
                expired: true,
                accessToken: "",
            };
        }
    }

    static getRefreshToken() {
        const refreshToken = localStorage.getItem("refreshToken");
        return {
            successRefreshToken: Boolean(refreshToken),
            refreshToken: refreshToken || "",
        };
    }

    static saveNewTokens(accessToken, refreshToken, telegramId) {
        if (!accessToken || !refreshToken) {
            this.logError("Cannot save tokens. Missing access or refresh token.");
            return;
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        if (telegramId) {
            localStorage.setItem("authTelegramId", telegramId);
        }
    }

    static saveAccessToken(accessToken) {
        if (typeof accessToken !== "string") {
            this.logError("Invalid access token provided");
            return;
        }

        localStorage.setItem("accessToken", accessToken);
    }

    static clearToken() {
        localStorage.removeItem("accessToken");
    }

    static clearTokens() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authTelegramId");
    }

    static checkTokens() {
        return {
            hasAccessToken: Boolean(localStorage.getItem("accessToken")),
            hasRefreshToken: Boolean(localStorage.getItem("refreshToken")),
        };
    }

    static logError(message) {
        console.error(`[TokenHandler] ${message}`);
    }
}

export default TokenHandler;
