import TelegramInitData from "../components/TelegramInitData.jsx";
import tokenHandler from "../components/TokenHandler.jsx";

const mainLink = "https://quicktime.site/api/v2/" 
const acceptAll = "*/*"

const post = "POST"
const telegramPrefix = "fn-d "

//Refresh token by telegram init data
export const refreshToken = async () => {
  try {
    const {successInitData, decodedInitData} = TelegramInitData.getDecodedInitData();

    const {success, refreshToken} = tokenHandler.getRefreshToken()

    if (!success) {
      throw new Error("Failed to get Refresh Token from local storage");
    }

    if (!successInitData) {
      throw new Error("Failed to get init data from Telegram WebApp");
    }

    const response = await fetch(`${mainLink}auth/refresh-token`, {
      method: post,
      headers: {
        Accept: acceptAll,
        Telegram: telegramPrefix + decodedInitData
      },
      body: refreshToken,
    });

    if (!response.ok) {
      const errorMessage = response.status === 406 ? "Invalid telegram data" : "Refresh token is Expired";
      return {success: false, error: errorMessage, status: response.status};
    }

    const data = await response.json();
    return {success: true, data: data.token};
  } catch (ex) {
    console.error("Error during token refresh:", ex);
  }
}

// Функция для авторизации пользователя
export const authorizeUser = async (userId) => {
  try {
    const response = await fetch(`${mainLink}auth/${userId}`, {
      method: "POST",
      headers: { accept: acceptAll },
      body: "",
    });

    if (!response.ok) {
      const errorMessage = response.status === 404 ? "User not registered" : "Don't have a telegram data";
      return { success: false, error: errorMessage, status: response.status };
    }

    const data = await response.json();
    return { success: true, data: data.token }; // data.token содержит сам токен
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return { success: false, error: "Network error or server not reachable" };
  }
};

// Функция для регистрации пользователя (изменена для универсальности)
export const registerUser = async (telegramUserData) => {
  try {
    const response = await fetch(`${mainLink}user/register`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(telegramUserData),
    });

    if (response.status === 409) {
      return { success: false, message: "User already exists" };
    }

    if (!response.ok) {
      return { success: false, message: `Registration error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Ошибка регистрации пользователя:", error);
    return { success: false, error: error.message };
  }
};

// Функция для создания или обновления профиля пользователя
export const createOrUpdateProfile = async (userId, profileData) => {
  try {
    const response = await fetch(
      `${mainLink}profile/create/${userId}`,
      {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      return { success: false, error: "Profile creation error" };
    }

    return { success: true };
  } catch (error) {
    console.error("Ошибка создания профиля:", error);
    return { success: false, error: error.message };
  }
};

// Функция для получения информации о профиле
export const fetchProfileInfo = async (userId, token) => {
  try {
    const response = await fetch(
      `${mainLink}profile/get-profile-info/${userId}`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: token,
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Ошибка: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Ошибка сети:", error);
    throw error;
  }
};

// Функция для получения всех направлений
export const fetchAllDirections = async () => {
  try {
    const response = await fetch(`${mainLink}direction/get-all`, {
      headers: {
        Accept: "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data }; // Возвращаем данные
  } catch (error) {
    console.error("Error fetching directions:", error);
    return { success: false, error: error.message };
  }
};

// Функция для создания заказа
export const createOrder = async (orderData, token, userId) => {
  try {
    const response = await fetch(`${mainLink}orders/create/${userId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(orderData),
    });

    if (response.status === 400) {
      return { success: false, error: "Title or description is missing or invalid" };
    }
    if (response.status === 401) {
      return { success: false, error: "User is not authorized" };
    }
    if (response.status === 500) {
      return { success: false, error: "Internal server error" };
    }

    if (!response.ok) {
      return { success: false, error: `Unexpected error: ${response.status}` };
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
};

// Функция для получения всех заказов
// TODO: change
export const fetchAllOrders = async (userId, token) => {
  try {
    const response = await fetch(`${mainLink}orders/get-all/${userId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
    });

    if (response.status === 500) {
      return { success: false, error: "Internal server error" };
    }
    
    if (!response.ok) {
      return { success: false, error: `Unexpected error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: error.message };
  }
};

// Функция для получения заказов заказчика
// TODO: change
export const fetchCustomerOrders = async (token, userId) => {
  try {
    const response = await fetch(`${mainLink}orders/get-my-orders/${userId}`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: token, // Добавлено "Bearer " перед токеном
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Возвращаем данные заказа
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    return null; // Возвращаем null или можно вернуть пустой массив
  }
};

// Функция для получения информации о заказе
export const fetchOrderById = async (orderId, token) => {
  try {
    const response = await fetch(`https://quicktime.site/api/orders/get/${orderId}`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: token, // "Bearer" added before token
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the order details
  } catch (error) {
    console.error("Ошибка при получении заказа:", error);
    return null; // Return null or handle the error as needed
  }
};
