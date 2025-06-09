import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, createResponse, getUserResponses, getReviewsByOrderId, getUserInfo } from "../api/api";
import TelegramUserInfo from "../components/TelegramUserInfo";
import "./style.css";

import ResponseIcon from "../icons/ResponseIcon";
import ViewsIcon from "../icons/ViewsIcon";
import TimeIcon from "../icons/TimeIcon";
import ContactIcon from "../icons/ContactIcon";
import defaultAvatar from "../icons/default-avatar.svg";
import starsIcon from "../icons/stars.svg";

const OrderDetails = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { id: performerId } = TelegramUserInfo();
    const [order, setOrder] = useState(null);
    const [responses, setResponses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [responseText, setResponseText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [userHasResponded, setUserHasResponded] = useState(false);
    const [userResponseText, setUserResponseText] = useState("");
    const [usersInfo, setUsersInfo] = useState({});

    useEffect(() => {
        const fetchOrderAndResponses = async () => {
            const [{ success: orderOk, data: orderData }, { success: responsesOk, data: responses }, { success: reviewsOk, data: reviews }] =
                await Promise.all([
                    getOrderById(orderId),
                    getUserResponses(String(performerId)),
                    getReviewsByOrderId(orderId)
                ]);

            if (orderOk) {
                setOrder(orderData);
            }

            if (responsesOk) {
                const matched = responses.find(r => String(r.orderId) === String(orderId));
                if (matched) {
                    setUserHasResponded(true);
                    setUserResponseText(matched.message || "Вы уже откликнулись на этот заказ.");
                }
            }

            if (reviewsOk) {
                setReviews(reviews);
                const usersData = {};
                await Promise.all(
                    reviews.map(async (review) => {
                        if (!usersData[review.authorId]) {
                            const userData = await getUserInfo(review.authorId);
                            usersData[review.authorId] = {
                                firstName: userData.dto?.firstName || "Пользователь",
                                photoUrl: userData.dto?.photoUrl || defaultAvatar,
                            };
                        }
                    })
                );
                setUsersInfo(usersData);
            }

            setLoading(false);
        };

        fetchOrderAndResponses();

        window.Telegram.WebApp.BackButton.show();
        window.Telegram.WebApp.BackButton.onClick(() => {
            navigate("/orders");
        });

        return () => window.Telegram.WebApp.BackButton.hide();
    }, [orderId, performerId]);

    const handleSubmit = async () => {
        if (!responseText.trim()) {
            alert("Пожалуйста, введите текст отклика.");
            return;
        }

        setSubmitting(true);
        try {
            const { success, error } = await createResponse(order.id, responseText.trim(), String(performerId));
            if (success) {
                alert("Отклик успешно отправлен!");
                setUserHasResponded(true);
                setUserResponseText(responseText.trim());
                setResponseText("");
            } else {
                alert("Ошибка при отклике: " + (error || "Неизвестная ошибка"));
            }
        } catch (e) {
            console.error("Ошибка при отправке отклика:", e);
            alert("Произошла ошибка при отправке отклика.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="spinner" />;
    if (!order) return <div style={{ textAlign: "center" }}>Заказ не найден</div>;

    return (
        <div className="container">
            <div className="profile-performer-screen">
                <div className="profile-info">
                    <h1 className="specialization">{order.title}</h1>
                    <h2 className="experience">{order.description}</h2>
                </div>

                {order.tags && (
                    <div className="tegs">
                        {order.tags.split(",").map((tag, index) => (
                            <p className="teg" key={index}>{tag.trim()}</p>
                        ))}
                    </div>
                )}

                <div className="card-price" style={{ marginBottom: "8px" }}>
                    <p className="price">
                        {String(order.totalAmount) === "0"
                            ? "По договоренности"
                            : `${order.totalAmount} ₽`}
                    </p>
                    <p className="per">
                        {order.paymentMethod === 2 || order.paymentMethod === 4 ? "/ проект" : "/ час"}
                    </p>
                </div>

                <div className="time-stamps">
                    <div className="response">
                        <ResponseIcon />
                        <span className="time-stamp">{order.responses?.length || 0}</span>
                    </div>
                    <div className="views">
                        <ViewsIcon />
                        <span className="time-stamp">{order.views?.length || 0}</span>
                    </div>
                    <div className="time">
                        <TimeIcon />
                        <span className="time-stamp">
                            {new Date(order.createdAt).toLocaleString("ru-RU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>
                </div>
                {order.status === 2 && (
                    <div className="alone-btn-container" style={{ width: "100%" }}>
                        {userHasResponded ? (
                            <div className="info-textarea" style={{ whiteSpace: "pre-wrap" }}>
                                {userResponseText}
                            </div>
                        ) : (
                            <>
                                <textarea
                                    className="info-textarea"
                                    placeholder="Напишите, почему вы подходите на этот заказ..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    disabled={submitting}
                                />
                                <button
                                    className="btn"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? "Отправка..." : "Откликнуться"}
                                </button>
                            </>
                        )}
                    </div>
                )}
                {order.status === 4 && reviews.length > 0 && (
                    <div className="review-section">
                        <h2>Отзывы</h2>
                        {reviews.map((review, i) => {
                            const user = usersInfo[review.authorId] || {};
                            return (
                                <div key={i} className="review-item">
                                    <div className="review-header">
                                        <div className="review-header-left">
                                            <img
                                                src={user.photoUrl || defaultAvatar}
                                                alt={user.firstName || "Пользователь"}
                                                className="review-avatar"
                                            />
                                            <strong>{user.firstName || "Пользователь"}</strong>
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
