import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/auth/Profile";
import { useAuth } from "./service/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import "./App.css";
import TransactionsList from "./components/transactions/TransactionList";
// import CategoriesList from "./components/categories/CategoryList";
import NavBar from "./components/Navbar";

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/transaction" element={<TransactionsList />} />
          {/* <Route path="/category" element={<CategoriesList />} /> */}
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/profile" : "/login"} replace />;
}
