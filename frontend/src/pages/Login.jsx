import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const result = login(username, password);
    if (result.success) {
      switch (result.role) {
        case "admin":
          navigate("/admin");
          break;
        case "cashier":
          navigate("/cashier");
          break;
        case "customer":
          navigate("/customer");
          break;
        default:
          navigate("/login");
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-background to-accent/20" />

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/95 border-2 border-primary/20 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/50">
            ☕
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Aradabiya
          </CardTitle>
          <CardDescription className="text-foreground/70">
            Cafenet Management System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted border-border focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border focus:border-primary transition-colors"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
            >
              Sign In
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm text-center">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
