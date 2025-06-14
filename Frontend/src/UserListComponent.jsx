import React, { useEffect, useState, useRef } from "react";
import { useUserContext } from "./context/userContext.js";
import { useSocketContext } from "./context/socketContext.js";
import { useNavigate, useParams } from "react-router-dom";

export const UserListComponent = ({ _id, username, password }) => {
  const {id} = useParams()
  
  const { userData } = useUserContext();
  const { onlineUsers, socket } = useSocketContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadRef = useRef(unreadCount);
  const navigate = useNavigate();

  // console.log("these are online users",onlineUsers);

  // Keep ref in sync with state
  useEffect(() => {
    unreadRef.current = unreadCount;
  }, [unreadCount]);

  // Fetch initial unread count on mount
  useEffect(() => {

    console.log(socket, "this is socket");

    const unreadMessages = async () => {
      const res = await fetch(
        `/api/v1/messages/unreadcount/${_id}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      setUnreadCount(data?.data?.unreadCount || 0);
    };

    if (_id) unreadMessages();
  }, [_id]);

  // Listen to new messages via socket
  const handleNewMessage = (newMessage) => {
      console.log("comparing ids: ", newMessage.sender, _id);

      if (newMessage.sender === _id && id != _id) {
        setUnreadCount(unreadRef.current + 1); // use ref to avoid stale closure
      }
    };
  useEffect(() => {
    

    socket?.on("newMessage", handleNewMessage);
    return () => {
      socket?.off("newMessage", handleNewMessage);
    };
  }, [socket, _id, id]);

  return (
    <div
      onClick={() => {
        setUnreadCount(0);
        navigate(`/c/${_id}`);
        const left = document.getElementById("left")
        left.classList.add("leftClosed")
      }}
      className={`user ${_id === userData?._id ? "active" : ""}`}
    >
      <div>
        <span
          className={`status-dot ${
            onlineUsers.includes(_id) ? "online" : "offline"
          }`}
        ></span>
        {username}
      </div>
      {unreadCount!== 0 && <div className="unreadCountDisplay">+{unreadCount}</div>}
    </div>
  );
};