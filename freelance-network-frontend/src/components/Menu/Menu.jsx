import React from "react";
import { NavLink } from "react-router-dom";
import "./Menu.css"; // Импортируем стили
import HomeIcon from "./static/HomeIcon"; // Импортируем компонент иконки
import OrdersIcon from "./static/OrdersIcon";
import FavoritesIcon from "./static/FavoritesIcon";
import ProfileIcon from "./static/ProfileIcon";

const Menu = () => {
  return (
    <div className="menu">
      <NavLink to="/main" exact className="menu-item" activeClassName="active">
        <HomeIcon color="currentColor" />
        Главная
      </NavLink>
      <NavLink to="/orders" className="menu-item" activeClassName="active">
        <OrdersIcon color="currentColor" />
        Мои заказы
      </NavLink>

      <NavLink to="/profile" className="menu-item" activeClassName="active">
        <ProfileIcon color="currentColor" />
        Профиль
      </NavLink>
    </div>
  );
};

export default Menu;
