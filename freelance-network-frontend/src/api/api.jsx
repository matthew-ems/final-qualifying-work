import TelegramInitData from "../components/TelegramInitData";
import TokenHandler from "../components/TokenHandler";

const samePart = "https://api.24fn.ru/api/v2/"; // Базовый URL для всех запросов API
const telegramPrefix = "fn-d "; // Префикс для Telegram заголовков
const acceptAll = "*/*"; // Заголовок Accept, принимающий все форматы
const post = "POST"; // Метод POST для запросов
const get = "GET"; // Метод GET для запросов

// https://api.24fn.ru/swagger/index.html

/**
 * Авторизация пользователя
 * @param {string} userId - Идентификатор пользователя
 * @returns {Promise<{status: number|null, data: object|null}>} - Статус ответа и данные
 */
export const authUser = async (userId) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    console.log(decodedInitData);

    const response = await fetch(`${samePart}auth/${userId}`, {
      method: post,
      headers: {
        Accept: acceptAll,
        Telegram: `${telegramPrefix}${decodedInitData}`,
      },
    });

    if (!response.ok) {
      return { status: response.status, data: null };
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("Ошибка в authUser:", error);
    return { status: null, data: null };
  }
};

/**
 * Обновление токена пользователя
 * @returns {Promise<{status: number|null, data: object|null}>} - Статус ответа и данные
 */
export const refreshUserToken = async () => {
  try {
    const { refreshToken } = TokenHandler.getRefreshToken();

    if (!refreshToken) {
      console.error("❌ Отсутствует refresh token");
      return { status: 400, data: null };
    }

    const response = await fetch(`${samePart}auth/refresh-token`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refreshToken), // просто строка токена, не объект!
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Ошибка при обновлении токена:", response.status, text);
      return { status: response.status, data: null };
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("❌ Ошибка в refreshUserToken:", error);
    return { status: 500, data: null };
  }
};



/**
 * Получение всех направлений
 * @returns {Promise<{success: boolean, data: object|null}>} - Успешность и данные
 */
export const getAllDirection = async () => {
  try {
    const response = await fetch(`${samePart}directions/get-all`, {
      method: get,
      headers: {
        Accept: acceptAll,
      },
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Ошибка при получении направлений:", error);
    return { success: false, data: null };
  }
};

/**
 * Получение всех опытов
 * @returns {Promise<{success: boolean, data: object|null}>} - Успешность и данные
 */
export const getAllExperience = async () => {
  try {
    const response = await fetch(`${samePart}experience/get-all`, {
      method: get,
      headers: {
        Accept: acceptAll,
      },
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Ошибка при получении опыта:", error);
    return { success: false, data: null };
  }
};

/**
 * Регистрация пользователя
 * @param {object} userData - Данные пользователя для регистрации
 * @returns {Promise<{success: boolean, data: object|null, error: object|null}>} - Успешность, данные и ошибки
 */
export const registerUser = async (userData) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram

    const response = await fetch(`${samePart}user/register`, {
      method: post,
      headers: {
        Accept: "application/json",
        Telegram: `${telegramPrefix}${decodedInitData}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData), // Отправка данных пользователя
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status} ${response.statusText}`); // Генерация ошибки
    }

    const data = await response.json();
    return { success: true, data }; // Успешный ответ с данными
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error); // Лог ошибки
    return { success: false, error }; // Возврат данных при ошибке
  }
};

/**
 * Получение информации о пользователе
 * @param {string} userId - Идентификатор пользователя
 * @returns {Promise<object>} - Данные пользователя
 */
export const getUserInfo = async (userId) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    const response = await fetch(`${samePart}user/get-user-info/${userId}`, {
      method: get,
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
        Telegram: `${telegramPrefix}${decodedInitData}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`); // Генерация ошибки
    }

    const data = await response.json();
    return data; // Возврат данных пользователя
  } catch (error) {
    console.error("Ошибка при получении информации о пользователе:", error); // Лог ошибки
    throw error; // Проброс ошибки
  }
};

/**
 *
 * @param userId
 * @returns {Promise<void>}
 */

export const getProfileInfo = async () => {
  try {
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    const response = await fetch(`${samePart}profile/get-profile-info`, {
      method: 'GET',
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Ошибка при получении информации о пользователе:", error);
    throw error;
  }
}

export const getRoleProfile = async () => {
  try {
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    const response = await fetch(`${samePart}profile/get-profile-info`, {
      method: get,
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`); // Генерация ошибки
    }

    const data = await response.json();
    return data.role;

  } catch (error) {
    console.error("Ошибка при получении информации о пользователе:", error); // Лог ошибки
    throw error; // Проброс ошибки
  }
}

export const createOrder = async (userId, orderData) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken(); // вернёт { accessToken: "Bearer ..." }

    const response = await fetch(`https://api.24fn.ru/api/v2/orders/create/${userId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Authorization: accessToken, // "Bearer <token>"
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    console.log("✅ Заказ создан успешно!");
  } catch (error) {
    console.error("❌ Ошибка при создании заказа:", error);
    throw error;
  }
};

export const getMyOrders = async (userId) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken();

    const response = await fetch(`${samePart}orders/get-my-orders/${userId}`, {
      method: get,
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Ошибка при получении заказов заказчика:", error);
    return { success: false, data: null };
  }
};

export const getAllOrders = async (userId, pageSize = 10, cursor = null, searchTags = []) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken();
    const params = new URLSearchParams();

    params.append("pageSize", pageSize);
    if (cursor !== null) params.append("cursor", cursor);
    if (searchTags.length > 0) {
      searchTags.forEach(tag => params.append("searchTags", tag));
    }

    const response = await fetch(`${samePart}orders/get-all/${userId}?${params.toString()}`, {
      method: get,
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("❌ Ошибка при получении заказов исполнителя:", error);
    return { success: false, data: null };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken(); // получаем токен

    const response = await fetch(`${samePart}orders/get/${orderId}`, {
      method: get,
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Ошибка при получении заказа с ID ${orderId}:`, error);
    return { success: false, data: null };
  }
};

export const createResponse = async (orderId, message, userId) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken();
    const { decodedInitData } = TelegramInitData.getDecodedInitData();

    const response = await fetch(`https://api.24fn.ru/api/v2/responses/create/${orderId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Authorization: accessToken,
        Telegram: `fn-d ${decodedInitData}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId: String(userId),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status} — ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Ошибка при отклике:", error);
    return { success: false, error: error.message };
  }
};

export const getResponsesForOrder = async (orderId) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken();

    const response = await fetch(`${samePart}responses/get-for-order/${orderId}`, {
      method: 'GET',
      headers: {
        Accept: acceptAll,
        Authorization: accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Ошибка при получении откликов на заказ:", error);
    return { success: false, data: [] };
  }
};

export const getUserResponses = async (userId) => {
  try {
    const { accessToken } = TokenHandler.getAccessToken();
    const { decodedInitData } = TelegramInitData.getDecodedInitData();

    const response = await fetch(`https://api.24fn.ru/api/v2/responses/get-for-user/${userId}`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: accessToken,
        Telegram: `fn-d ${decodedInitData}`
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status} — ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error("❌ Ошибка при получении откликов пользователя:", error);
    return { success: false, error: error.message };
  }
};

export const addToFavorite = async (userId, orderId) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    console.log(decodedInitData);

    const response = await fetch(`${samePart}favorite/add-to-favorite?userId=${userId}&orderId=${orderId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Telegram: `${telegramPrefix}${decodedInitData}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { status: response.status, data: null };
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("Ошибка при добавлении в избранное:", error);
    return { status: null, data: null };
  }
};

export const removeFromFavorite = async (userId, orderId) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    console.log(decodedInitData);

    const response = await fetch(`${samePart}favorite/remove-from-favorite?userId=${userId}&orderId=${orderId}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Telegram: `${telegramPrefix}${decodedInitData}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { status: response.status, data: null };
    }

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error("Ошибка при удалении из избранного:", error);
    return { status: null, data: null };
  }
};

export const updateOrder = async (updatedData) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    const response = await fetch(`${samePart}orders/update`, {
      method: "PUT", // Используем метод PUT для обновления
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${accessToken}`, // Токен авторизации
        Telegram: `${telegramPrefix}${decodedInitData}`,
        "Content-Type": "application/json", // Указываем тип данных
      },
      body: JSON.stringify(updatedData), // Отправка данных обновления заказа
    });

    // Проверяем успешность ответа
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.text(); // Получаем ответ как текст
    console.log("Ответ от сервера:", data); // Выводим ответ в консоль

    return { success: true, data }; // Возвращаем данные после успешного обновления заказа
  } catch (error) {
    console.error("Ошибка при обновлении заказа:", error);
    return { success: false, error: error.message }; // Возвращаем ошибку в случае неудачи
  }
};

export const getOrdersExecution = async () => {
  try {
    const { accessToken } = TokenHandler.getAccessToken(); // Получаем токен доступа
    const response = await fetch(`${samePart}orders/orders-execution`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${accessToken}`, // Токен авторизации
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("❌ Ошибка при получении заказов для исполнителя:", error);
    return { success: false, data: null };
  }
};

export const createReview = async ({ targetUserId, orderId, rating, comment }) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    // Проверяем, что все необходимые данные получены
    if (!accessToken || !decodedInitData) {
      throw new Error("Токен доступа или данные Telegram отсутствуют.");
    }

    // Создаем объект для отправки в теле запроса
    const requestBody = {
      targetUserId,  // ID пользователя, на которого оставляется отзыв
      orderId,       // ID заказа
      rating,        // Рейтинг от 1 до 5
      comment        // Комментарий к заказу
    };

    // Логируем перед отправкой
    console.log("Отправка отзыва с данными: ", requestBody);

    const response = await fetch(`${samePart}review/create`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        Authorization: accessToken, // Токен авторизации
        Telegram: `${telegramPrefix}${decodedInitData}`,
        "Content-Type": "application/json", // Указываем тип данных
      },
      body: JSON.stringify(requestBody), // Отправка данных обновления заказа
    });

    // Проверяем успешность ответа
    if (!response.ok) {
      const errorText = await response.text();  // Получаем текст ошибки
      throw new Error(`Ошибка: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    console.log("Ответ от сервера:", data);

    return { success: true, data }; // Возвращаем данные после успешного обновления
  } catch (error) {
    console.error("Ошибка при создании отзыва:", error);
    return { success: false, error: error.message }; // Возвращаем ошибку в случае неудачи
  }
};

export const getReviews = async () => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    const response = await fetch(`${samePart}review`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: accessToken, // Токен авторизации
        Telegram: `${telegramPrefix}${decodedInitData}`,
      },
    });

    // Проверяем успешность ответа
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}, ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Ошибка при получении отзывов:", error);
    return { success: false, error: error.message };
  }
};

export const getReviewsByOrderId = async (orderId) => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получаем данные Telegram
    const { accessToken } = TokenHandler.getAccessToken(); // Получаем токен доступа

    // Выполняем запрос к API
    const response = await fetch(`${samePart}review/get-by-order/${orderId}`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: accessToken, // Токен авторизации
        Telegram: `${telegramPrefix}${decodedInitData}`,
      },
    });

    // Проверяем успешность ответа
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data }; // Возвращаем данные отзыва
  } catch (error) {
    console.error("Ошибка при получении отзывов:", error);
    return { success: false, error: error.message }; // Возвращаем ошибку в случае неудачи
  }
};

export const getReviewsByUser = async () => {
  try {
    const { decodedInitData } = TelegramInitData.getDecodedInitData(); // Получение данных Telegram
    const { accessToken } = TokenHandler.getAccessToken(); // Получение токена доступа

    const response = await fetch(`${samePart}review/get-by-user`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: accessToken, // Токен авторизации
        Telegram: `${telegramPrefix}${decodedInitData}`,
      },
    });

    // Проверяем успешность ответа
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return { success: true, data }; // Возвращаем данные отзыва
  } catch (error) {
    console.error("Ошибка при получении отзывов:", error);
    return { success: false, error: error.message }; // Возвращаем ошибку в случае неудачи
  }
};









