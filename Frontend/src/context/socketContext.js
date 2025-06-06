import { useContext } from "react";
import { createContext } from "react";

export const SocketContext = createContext()

export const useSocketContext = () => {
    return useContext(SocketContext)
}