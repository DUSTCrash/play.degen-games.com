import React from "react";
import Chat from "./Chat";

import "../css/LeftSide.css";
import Socials from "./Socials";

function LeftSide() {
  const currentURL = window.location.pathname
  return (
    <div className="LeftSide">
    
      <Chat />
      <Socials />
    </div>
  );
}

export default LeftSide;
