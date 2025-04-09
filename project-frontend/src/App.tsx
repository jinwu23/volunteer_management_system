import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";

import MainLayout from "./MainLayout";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import CreateAccount from "./pages/auth/CreateAccount";
import PastEvents from "./pages/PastEvents";
import { ProtectedRoute } from "./ProtectedRoute";

import { UserData } from "./types/types";

function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute
              authToken={authToken}
              userData={userData}
              requireAdmin={false}
            >
              <Events
                authToken={authToken}
                userData={userData}
                setUserData={setUserData}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute
              authToken={authToken}
              userData={userData}
              requireAdmin={false}
            >
              <Events
                authToken={authToken}
                userData={userData}
                setUserData={setUserData}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              authToken={authToken}
              userData={userData}
              requireAdmin={false}
            >
              <Profile
                userData={userData}
                setUserData={setUserData}
                authToken={authToken}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/past-events"
          element={
            <ProtectedRoute
              authToken={authToken}
              userData={userData}
              requireAdmin={false}
            >
              <PastEvents
                userData={userData}
                setUserData={setUserData}
                authToken={authToken}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <Login setAuthToken={setAuthToken} setUserData={setUserData} />
          }
        />
        <Route path="/create-account" element={<CreateAccount />} />
      </Route>
    </Routes>
  );
}

export default App;
