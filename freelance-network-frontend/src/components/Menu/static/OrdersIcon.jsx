import React from "react";

const OrdersIcon = ({ color = "currentColor", width = 30, height = 30 }) => {
  return (
    <svg
      className="menu-item-icon"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 5C22.7188 5.01513 24.1912 5.1357 25.1517 6.09618C26.25 7.19453 26.25 8.96229 26.25 12.4978V19.9978C26.25 23.5334 26.25 25.3011 25.1517 26.3995C24.0533 27.4978 22.2855 27.4978 18.75 27.4978H11.25C7.71447 27.4978 5.9467 27.4978 4.84835 26.3995C3.75 25.3011 3.75 23.5334 3.75 19.9978V12.4978C3.75 8.96229 3.75 7.19453 4.84835 6.09618C5.80883 5.1357 7.28122 5.01513 10 5"
        stroke="currentColor"
        stroke-width="1.875"
      />
      <path
        d="M11.25 16.75L13.3929 18.75L18.75 13.75"
        stroke="currentColor"
        stroke-width="1.875"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10 4.375C10 3.33947 10.8395 2.5 11.875 2.5H18.125C19.1605 2.5 20 3.33947 20 4.375V5.625C20 6.66053 19.1605 7.5 18.125 7.5H11.875C10.8395 7.5 10 6.66053 10 5.625V4.375Z"
        stroke="currentColor"
        stroke-width="1.875"
      />
    </svg>
  );
};

export default OrdersIcon;
