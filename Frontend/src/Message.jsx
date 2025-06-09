import React from "react";
import { useUserContext } from "./context/userContext.js";

export default function Message(msg) {

  const {userData} = useUserContext()

  return (
    <React.Fragment key={msg._id}>
      {showNewMessageBar && (
        <div className="newMessageBar" ref={newMessageRef}>
          New Messages
        </div>
      )}
      <div
        className={`message ${
          msg.sender === userData?._id ? "sent" : "received"
        }`}
      >
        {msg.message}
      </div>
    </React.Fragment>
  );
}
