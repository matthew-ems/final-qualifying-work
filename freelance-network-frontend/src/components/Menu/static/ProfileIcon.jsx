import React from "react";

const ProfileIcon = ({ color = "currentColor", width = 30, height = 30 }) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11.25"
        cy="11.25"
        r="2.5"
        stroke="currentColor"
        stroke-width="1.875"
      />
      <path
        d="M16.25 18.75C16.25 20.1307 16.25 21.25 11.25 21.25C6.25 21.25 6.25 20.1307 6.25 18.75C6.25 17.3693 8.48858 16.25 11.25 16.25C14.0114 16.25 16.25 17.3693 16.25 18.75Z"
        stroke="currentColor"
        stroke-width="1.875"
      />
      <path
        d="M2.5 15C2.5 10.286 2.5 7.92893 3.96447 6.46447C5.42893 5 7.78595 5 12.5 5H17.5C22.214 5 24.5711 5 26.0355 6.46447C27.5 7.92893 27.5 10.286 27.5 15C27.5 19.714 27.5 22.0711 26.0355 23.5355C24.5711 25 22.214 25 17.5 25H12.5C7.78595 25 5.42893 25 3.96447 23.5355C2.5 22.0711 2.5 19.714 2.5 15Z"
        stroke="currentColor"
        stroke-width="1.875"
      />
      <path
        d="M23.75 15H18.75"
        stroke="currentColor"
        stroke-width="1.875"
        stroke-linecap="round"
      />
      <path
        d="M23.75 11.25H17.5"
        stroke="currentColor"
        stroke-width="1.875"
        stroke-linecap="round"
      />
      <path
        d="M23.75 18.75H20"
        stroke="currentColor"
        stroke-width="1.875"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default ProfileIcon;
