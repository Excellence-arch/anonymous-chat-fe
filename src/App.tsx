// "use client"

// import { useEffect } from "react"
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
// import { useThemeStore } from "./store/themeStore"
// import { useAuthStore } from "./store/authStore"
// import Layout from "./components/Layout/Layout"
// import LoginForm from "./components/Auth/LoginForm"
// import RegisterForm from "./components/Auth/RegisterForm"
// import ChatPage from "./components/Chat/ChatPage"
// import ProtectedRoute from "./components/ProtectedRoute"
// import LandingPage from "./components/LandingPage"

// function App() {
//   const { isDark } = useThemeStore()
//   const { isAuthenticated } = useAuthStore()

//   useEffect(() => {
//     // Apply theme to document
//     if (isDark) {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//   }, [isDark])

//   return (
//     <Router>
//       <div className={`min-h-screen transition-colors duration-200 ${isDark ? "dark" : ""}`}>
//         <Routes>
//           <Route path="/home" element={<LandingPage />} />
//           <Route path="/login" element={isAuthenticated ? <Navigate to="/chat" replace /> : <LoginForm />} />
//           <Route path="/register" element={isAuthenticated ? <Navigate to="/chat" replace /> : <RegisterForm />} />
//           <Route path="/" element={<Layout />}>
//             <Route index element={isAuthenticated ? <Navigate to="/chat" replace /> : <LandingPage />} />
//             <Route
//               path="chat"
//               element={
//                 <ProtectedRoute>
//                   <ChatPage />
//                 </ProtectedRoute>
//               }
//             />
//           </Route>
//           <Route path="*" element={<Navigate to="/chat" replace />} />
//         </Routes>
//       </div>
//     </Router>
//   )
// }

// export default App



'use client';

import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { socketService } from './services/socket';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ChatPage from './components/Chat/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';

function App() {
  const { isDark } = useThemeStore();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Initialize socket connection when authenticated
    if (isAuthenticated && token) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <Router>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          isDark ? 'dark' : ''
        }`}
      >
        <Routes>
          <Route
            path="/home"
            element={<LandingPage />}
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to="/chat"
                  replace
                />
              ) : (
                <LoginForm />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate
                  to="/chat"
                  replace
                />
              ) : (
                <RegisterForm />
              )
            }
          />
          <Route
            path="/"
            element={<Layout />}
          >
            <Route
              index
              element={
                isAuthenticated ? (
                  <Navigate
                    to="/chat"
                    replace
                  />
                ) : (
                  <LandingPage />
                )
              }
            />
            <Route
              path="chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <Navigate
                to="/chat"
                replace
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
