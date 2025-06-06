import { useContext } from "react";
import { createContext } from "react";

export const PastChattersContext = createContext()

export const usePastChattersContext = () => {
    return useContext(PastChattersContext)
}