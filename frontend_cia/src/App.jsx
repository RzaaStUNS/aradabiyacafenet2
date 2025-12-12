// src/App.jsx
import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import Login from "@/pages/login";
import Register from "@/pages/Register";

import AdminDashboard from "@/pages/dashboard/Admin";
import StaffDashboard from "@/pages/dashboard/Staff";
import CustomerDashboard from "@/pages/dashboard/Customer";

import Test from "@/pages/Test";
import NotFound from "@/pages/NotFound";

import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* ===== PUBLIC PAGES ===== */}
      <Route path="/" element={<Home />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register/:role" element={<Register />} />

      {/* ===== PROTECTED DASHBOARDS ===== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* halaman tambahan kalau kamu pakai */}
      <Route path="/test" element={<Test />} />

      {/* ===== FALLBACK 404 ===== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
