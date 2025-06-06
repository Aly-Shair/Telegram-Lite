import React, { useContext } from 'react';

const UserContext = React.createContext(); // createContext() is a hook

export const useUserContext = () => {
    return useContext(UserContext)
}

export default UserContext;