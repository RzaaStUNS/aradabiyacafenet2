// src/components/Navbar.jsx
import { Button } from "@/components/ui/button";
import { Coffee, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleTest = () => {
    navigate("/test");
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Aradabiya</h1>
              <p className="text-xs text-muted-foreground">Admin/Customer/Cashier Portal</p>
            </div>
          </div>
          <Button
            onClick={handleTest}
            variant="outline"
            className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};