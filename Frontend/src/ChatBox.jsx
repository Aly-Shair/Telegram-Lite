import React, { useEffect, useRef, useState } from "react";
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
  const newMessageRef = useRef(null);
  const bottomRef = useRef(null);
  const didFetchConversation = useRef(false);
  const [loading, setLoading] = useState(true);
  const { chatters, setChatters } = usePastChattersContext();
  const [isReplying, setIsReplying] = useState(null);

  useEffect(() => {
    didFetchConversation.current = false
    setMessages([]);
    setLoading(true);
  },[id])

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

  const scrollToNewMessageBar = async () => {

    console.log("scrolling");
    console.log("newMessageRef.current", newMessageRef.current);
    console.log("bottomRef.current", bottomRef.current);
    
    if (newMessageRef.current) {
      newMessageRef.current.scrollIntoView();
    } else if (bottomRef.current) {
      bottomRef.current.scrollIntoView();
    }
  }

  // Fetch chat history
  useEffect(() => {
    if (!id || didFetchConversation.current) return;

    didFetchConversation.current = true;

    async function fetchMessages() {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/${id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setMessages(data.data);
      console.log("this is conversation: ", data?.data);
    }

    if (id) fetchMessages().then(() => setLoading(false))
      // .then(() => setTimeout(scrollToNewMessageBar, 0));
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

  

  useEffect(() => {
    const handleFunction = async (newMessage) => {
      // console.log("this is compare",newMessage?.sender, id);

      if (newMessage?.sender == id) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        // setMessages((prevMessages) => [...prevMessages, {...newMessage, status: 'read'}]);
        const res = await fetch(
          `http://localhost:8000/messages/m/r/${newMessage?._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!res.ok) {
          console.log("failed to mark as read");
        }
      }
    };

    socket?.on("newMessage", handleFunction);

    return () => socket?.off("newMessage", handleFunction);
  }, [socket, id, messages]);

  const appendReceiverUserInChatters = () => {
    if (chatters.some((u) => u?._id === receiverUser?._id)) {
      setChatters((prevChatters) => {
        const existingIndex = prevChatters.findIndex(
          (u) => u._id === receiverUser?._id
        );

        if (existingIndex !== -1) {
          // Move existing chatter to top
          const updatedChatters = [...prevChatters];
          const [movedUser] = updatedChatters.splice(existingIndex, 1);
          return [movedUser, ...updatedChatters];
        }

        return prevChatters; // return unchanged if not found, actual fetch will happen below
      });

      return;
    }

    setChatters((prev) => [...prev, receiverUser]);
  };

  const markMessagesAsRead = async (messageIds) => {
    if (messageIds.length === 0) return;

    try {
      const res = await fetch("http://localhost:8000/messages/mark-as-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // optional: if you use cookies/session
        body: JSON.stringify({ messageIds }),
      });

      if (!res.ok) {
        console.error("Failed to mark messages as read:");
        return;
      }
      const data = await res.json();

      console.log("Messages marked as read:");
      return data?.data;
    } catch (error) {
      console.error("Error:", error);
    }
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
          body: JSON.stringify({
            message: newMessage,
            repliedTo: isReplying?._id,
          }),
        }
      );

      if (!res.ok) {
        // console.log('failed to send message');
        return;
      }

      const data = await res.json();

      console.log("this message is sent: ", data?.data);

      // setMessages((prev) => [...prev, data?.data]);
      // setMessages((prev) => {
      //   const prevConversation = [...prev];
      //   const updatedConversation = prevConversation.map((prev) =>
      //     prev.sender == id ? { ...prev, status: "read" } : { ...prev }
      //   );
      //   return [...updatedConversation, data?.data];
      // });

      let unreadMessageIds;
      setMessages((prev) => {
        const prevConversation = [...prev];

        // Step 1: Get unread message IDs where receiver is the current user
        unreadMessageIds = prevConversation
          .filter(
            (msg) => msg.status !== "read" && msg.receiver === userData?._id
          )
          .map((msg) => msg._id);

        // console.log("Unread Message IDs:", unreadMessageIds); // You can now use this list

        // Step 2: Update all messages from this sender as read
        const updatedConversation = prevConversation.map((msg) =>
          msg.sender === id ? { ...msg, status: "read" } : msg
        );

        // Step 3: Append the new incoming message
        return [...updatedConversation, data?.data];
      })
      
      markMessagesAsRead(unreadMessageIds)
      setNewMessage("")
      setIsReplying(null);
      appendReceiverUserInChatters()
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
        {messages?.map((msg, index) => {
          const isUnread = msg?.status !== "read";
          const isFromOtherUser = msg?.sender !== userData?._id;

          // Show the "New Messages" bar only once before the first unread message from the other user
          const showNewMessageBar =
            isUnread &&
            isFromOtherUser &&
            (index === 0 ||
              messages[index - 1]?.sender === userData?._id ||
              messages[index - 1]?.status === "read");

          return (
            <React.Fragment key={msg?._id}>
              {showNewMessageBar && (
                <div className="newMessageBar" ref={newMessageRef}>
                  New Messages
                </div>
              )}
              <div
                id={`${msg._id}`}
                className={`message ${
                  msg?.sender === userData?._id ? "sent" : "received"
                }`}
              >
                <div className="c-messageController">
                  <i className="c-messageControllerIcon fa-solid fa-angle-down"></i>
                  <div className="c-messageControllerOptions">
                    <div
                      className="c-messageControllerName"
                      onClick={() => setIsReplying({ ...msg })}
                    >
                      Reply
                    </div>
                    <div className="c-messageControllerName">Delete</div>
                  </div>
                </div>
                {msg?.repliedTo?.message && (
                  <div
                    className="c-repliedToTextContent"
                    onClick={() => {
                      const element = document.getElementById(msg.repliedTo._id);
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                        element.classList.add("highlight");
                        setTimeout(() => element.classList.remove("highlight"), 2000)
                      }
                    }}
                  >
                    {msg?.repliedTo?.message?.substring(0, 80)}
                    ...
                  </div>
                )}
                <div className="c-messageTextContent">{msg?.message}</div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      <div className="chatInputContainer">
        {isReplying && (
          <div className="c-repliedToTextContent c-repliedToTextContentWithMessageInput">
            {isReplying?.message?.substring(0, 80)}
            ...
            <span onClick={() => setIsReplying(null)}>
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
        )}
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
    </div>
  );
};

export default ChatBox;
