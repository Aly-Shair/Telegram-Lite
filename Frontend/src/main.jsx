import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ChatBox from "./ChatBox.jsx";
import UserContextProvider from "./context/userContextProvider.jsx";
import SocketContextProvider from "./context/socketContextProvider.jsx";
import PastChattersContextProvider from "./context/pastChattersContextProvider.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // This will serve as the layout component
    children: [
      {
        path: "c/:id",
        element: <ChatBox />,
      },
      // {
      //   index: true,
      //   element: <div>Select a chat</div>
      // }
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  // {
  //   path: "/login",
  //   element: <Login />,
  // },
  // {
  //   path: "/register",
  //   element: <Register />,
  // },
  // {
  //   path: '/',
  //   element: <Navigate to="/chat" />
  // },
  {
    path: "*",
    element: <div>404 - Page Not Found</div>,
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserContextProvider>
      <SocketContextProvider>
        <PastChattersContextProvider>
          <RouterProvider router={router} />
        </PastChattersContextProvider>
      </SocketContextProvider>
    </UserContextProvider>
  </React.StrictMode>
);
