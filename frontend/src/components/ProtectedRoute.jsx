// src/components/ProtectedRoute.jsx
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      if (roles) {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(user.role)) {
          if (user.role === "admin") navigate("/admin", { replace: true });
          else if (user.role === "cashier") navigate("/cashier", { replace: true });
          else if (user.role === "customer") navigate("/customer", { replace: true });
          else navigate("/login", { replace: true });
        }
      }
    }
  }, [user, loading, navigate, roles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && (!roles || (Array.isArray(roles) ? roles : [roles]).includes(user.role))) {
    return <>{children}</>;
  }

  return null;
}