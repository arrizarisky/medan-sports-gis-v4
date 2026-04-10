import React, { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus } from "lucide-react";

// @ts-ignore
import googleIcon from "../assets/icon/google.png";

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Fungsi Login dengan Google
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // window.location.origin otomatis menyesuaikan localhost atau production (Vercel)
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signup successful! Please check your email for verification.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Logged in successfully!");
      }
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Log in to add new places and leave reviews"
            : "Sign up to contribute to Medan Sports Area and share your favorite sports spots!"}
        </p>
      </div>

      {/* Social Login Section */}
      <div className="space-y-3">
        <Button
          variant="outline"
          type="button"
          className="w-full h-11 border-primary/20 hover:bg-secondary/50 transition-all"
          onClick={handleGoogleLogin}
        >
          <img src={googleIcon} alt="Google" className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground font-medium">
              Or continue with email
            </span>
          </div>
        </div>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
        </div>

        <Button type="submit" className="w-full h-11 font-bold shadow-lg" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : mode === "login" ? (
            <LogIn className="w-4 h-4 mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {mode === "login" ? "Log In" : "Sign Up"}
        </Button>
      </form>

      <div className="text-center pt-2">
        <Button
          variant="link"
          size="sm"
          className="text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </Button>
      </div>
    </div>
  );
}