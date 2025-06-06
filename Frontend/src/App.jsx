import { useState, useEffect } from "react";
import "./App.css";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./context/userContext.js";
import { useSocketContext } from "./context/socketContext.js";
import { UserListComponent } from "./UserListComponent.jsx";
import { usePastChattersContext } from "./context/pastChattersContext.js";
import { Loader } from "./Loader.jsx";

function App() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { login, logout } = useUserContext();
  const { socket } = useSocketContext();
  const [leftOpen, setLeftOpen] = useState(true)
  const {chatters, setChatters} = usePastChattersContext()

  // current user
  useEffect(() => {
    const fetchuserData = async () => {
      const res = await fetch("http://localhost:8000/users/current", {
        credentials: "include",
      });
      if (!res.ok) {
        logout();
        navigate("/login");
        return;
      }

      const data = await res.json();
      login(data?.data);
      //  console.log(data);
    };

    fetchuserData()
    
  }, []);

  // const [chatters, setChatters] = useState([]);
  // past chatters
  useEffect(() => {
    async function fetchChatters() {
      try {
        const res = await fetch("http://localhost:8000/users/chatters", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch chatters");
        }

        const data = await res.json();
        // console.log(data);

        setChatters(data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchChatters();
  }, []);

   const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  // Fetch users by search
  useEffect(() => {
    if (!user?.trim()) {
      setUsers([]);
      return;
    }

    async function fetchChatters() {
      try {
        const res = await fetch(`http://localhost:8000/users/?search=${user}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch chatters");
        }

        const data = await res.json();
        // console.log(data);

        setUsers(data?.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchChatters();
  }, [user]);

  useEffect(() => {
    const handleNewChatter = async (newMessage) => {
    const senderId = newMessage?.sender;
    console.log("this is newMessage: ",newMessage);
    if (!senderId){
      console.log("this is senderId:", senderId);
      return
    } ; 
    console.log(senderId);
    

    // If user not in the list, fetch and add to top
    if (chatters.some((u) => u?._id === senderId)) {
      setChatters((prevChatters) => {
        const existingIndex = prevChatters.findIndex((u) => u._id === senderId);
        
        if (existingIndex !== -1) {
        // Move existing chatter to top
        const updatedChatters = [...prevChatters];
        const [movedUser] = updatedChatters.splice(existingIndex, 1);
        return [movedUser, ...updatedChatters];
      }

      return prevChatters; // return unchanged if not found, actual fetch will happen below
    });
    }else{
      
      console.log("i am fetching");
      
      try {
        const res = await fetch(`http://localhost:8000/users/${senderId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        
        const data = await res.json();
        const newUser = data?.data;
        
        if (newUser) {
          console.log("i am fetched");
          setChatters((prevChatters) => [newUser, ...prevChatters]);
        }
      } catch (err) {
        console.error("Error fetching new chatter:", err);
      }
    }
  };
    socket?.on("newMessage", handleNewChatter);

    return () => socket?.off("newMessage", handleNewChatter);
  }, [socket, chatters]);
  // }, [socket]);

 

  if (loading) {
    return <Loader/>;
  }

  return (
    <div className="chatapp">
      <div className="left">
        {leftOpen && <div className="searchSystem">
          <input
            type="search"
            placeholder="Search users..."
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>}
        <div className="userslist">
          {users?.map((user, index) => (
            <div key={index}>
              <UserListComponent {...user} />
            </div>
          ))}
          <h6 className="pastChattersTag">past chatters <span onClick={() => setLeftOpen(prev => !prev)} className="showLeftController">  {!leftOpen?<i className="fas fa-plus"></i>:<i className="fas fa-minus"></i>}</span></h6>
          {leftOpen && chatters?.map((user, index) => (
            <div key={index}>
              <UserListComponent {...user} />
            </div>
          ))}
        </div>
      </div>

      <div className="right">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
