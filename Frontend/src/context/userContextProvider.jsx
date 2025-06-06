import React from "react";
import UserContext from "./userContext";

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = React.useState(null); // using useState without importing
  const login = (userData) => {
    setUserData(userData); // Example function to set user data
  };

  const logout = () => {
    setUserData(null);
  };
  return (
    <UserContext.Provider value={{ userData, login, logout }}>
      {" "}
      {/* providing an object {user, setUser}*/}
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
