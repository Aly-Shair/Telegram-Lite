import React, { useState, useEffect } from "react";
import { SocketContext } from "./socketContext.js";
import { useUserContext } from "./userContext.js";
import io from "socket.io-client"

const SocketContextProvider = ({children}) => {

    const [ socket , setSocket]= useState(null);
    const [onlineUsers,setOnlineUsers]=useState([]);
    const {userData} = useUserContext();

    useEffect(()=>{
        if(userData){
            const socketInstance = io("http://localhost:8000",{
                query:{
                    userId:userData?._id,
                }
            })
            socketInstance.on("getOnlineUsers",(users)=>{
                setOnlineUsers(users)
            });

            setSocket(socketInstance);
            // return()=>socketInstance.disconnect();
        }
        else{
            if(socket){
                socket.disconnect();
                setSocket(null); 
            }
            return
        }
    },[userData]);
    
    return (
        <SocketContext.Provider value={{socket , onlineUsers}}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketContextProvider

// import React, { useState, useEffect } from "react";
// import { SocketContext } from "./socketContext.js";
// import { useUserContext } from "./userContext.js";
// import io from "socket.io-client";

// const SocketContextProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const { userData } = useUserContext();

//   useEffect(() => {
//     if (userData) {
//       const socketInstance = io("http://localhost:8000", {
//         query: {
//           userId: userData._id,
//         },
//         withCredentials: true,
//       });

//       setSocket(socketInstance);

//       socketInstance.on("connect", () => {
//         console.log("Socket connected");
//         setSocketConnected(true);
//       });

//       socketInstance.on("disconnect", () => {
//         console.log("Socket disconnected");
//         setSocketConnected(false);
//       });

//       socketInstance.on("getOnlineUsers", (users) => {
//         setOnlineUsers(users);
//       });

//       return () => {
//         socketInstance.disconnect();
//         setSocket(null);
//         setSocketConnected(false);
//       };
//     } else {
//       if (socket) {
//         socket.disconnect();
//         setSocket(null);
//         setSocketConnected(false);
//       }
//     }
//   }, [userData]);

//   return (
//     <SocketContext.Provider value={{ socket, socketConnected, onlineUsers }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketContextProvider;
