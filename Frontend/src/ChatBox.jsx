import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUserContext } from "./context/userContext.js";
import { useSocketContext } from "./context/socketContext.js";
import { useNavigate } from "react-router-dom";
import { usePastChattersContext } from "./context/pastChattersContext.js";
import { Loader } from "./Loader.jsx";

const ChatBox = () => {
  const { id } = useParams(); // receiver ID
  // console.log(id);

  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [receiverUser, setReceiverUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const { userData } = useUserContext();
  const { socket } = useSocketContext();
  const newMessageRef = React.useRef(null);
  const bottomRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const { chatters, setChatters } = usePastChattersContext();

  useEffect(() => {
    const handleFunction = (newMessage) => {
      // console.log("this is compare",newMessage?.sender, id);

      if (newMessage?.sender == id)
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket?.on("newMessage", handleFunction);

    return () => socket?.off("newMessage", handleFunction);
  }, [socket, id, messages]);

  // Fetch receiver user
  useEffect(() => {
    async function fetchReceiver() {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setReceiverUser(data?.data);
    }
    if (id) fetchReceiver();
  }, [id]);

  // Fetch chat history
  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setMessages(data.data);
    }

    if (id) fetchMessages().then(setLoading(false));
  }, [id]);

  useEffect(() => {
    if (newMessageRef.current) {
      newMessageRef.current.scrollIntoView();
    } else if (bottomRef.current) {
      bottomRef.current.scrollIntoView();
    }
    // if (newMessageRef.current) {
    //   newMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    // } else if (bottomRef.current) {
    //   bottomRef.current.scrollIntoView({ behavior: "smooth"});
    // }
  }, [messages]);

  const appendReceiverUserInChatters = () => {
    if (chatters.some((u) => u?._id === receiverUser?._id)) {
      setChatters((prevChatters) => {
        const existingIndex = prevChatters.findIndex((u) => u._id === receiverUser?._id);
        
        if (existingIndex !== -1) {
        // Move existing chatter to top
        const updatedChatters = [...prevChatters];
        const [movedUser] = updatedChatters.splice(existingIndex, 1);
        return [movedUser, ...updatedChatters];
      }

      return prevChatters; // return unchanged if not found, actual fetch will happen below
    });

    return
    }

    setChatters((prev) => [...prev, receiverUser]);
  };

  const handleSendMessage = async () => {
    if (!newMessage?.trim()) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: newMessage }),
        }
      );

      if (!res.ok) {
        // console.log('failed to send message');
        return;
      }

      const data = await res.json();

      setMessages((prev) => [...prev, data.data]);
      setNewMessage("");

      appendReceiverUserInChatters();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="chatBox">
      <div className="chatHeader">
        <i
          className="backArrow fas fa-arrow-left"
          onClick={() => navigate("/")}
        ></i>
        <h3>
          Chat with {receiverUser ? receiverUser?.username : `User ${id}`}
        </h3>
      </div>

      {/* <div className="chatContainer">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${
              msg.sender === userData?._id ? 'sent' : 'received'
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div> */}

      <div className="chatContainer">
        {messages.map((msg, index) => {
          const isUnread = msg.status !== "read";
          const isFromOtherUser = msg.sender !== userData?._id;

          // Show the "New Messages" bar only once before the first unread message from the other user
          const showNewMessageBar =
            isUnread &&
            isFromOtherUser &&
            (index === 0 ||
              messages[index - 1].status === "read" ||
              messages[index - 1].sender === userData?._id);

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
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="chatInput">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
