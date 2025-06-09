import React from "react";
import Menu from "../components/Menu/Menu";

function PageWithMenu({ children }) {
  return (
    <>
      <Menu />
      <div>{children}</div>
    </>
  );
}

export default PageWithMenu;
