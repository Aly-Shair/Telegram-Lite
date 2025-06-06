import React from "react";
import { PastChattersContext } from "./pastChattersContext";

const PastChattersContextProvider = ({ children }) => {
  const [chatters, setChatters] = React.useState([]); // using useState without importing

  return (
    <PastChattersContext.Provider value={{ chatters, setChatters }}>
      {" "}
      {/* providing an object {user, setUser}*/}
      {children}
    </PastChattersContext.Provider>
  );
};

export default PastChattersContextProvider;
