import React, { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogIn, UserPlus } from "lucide-react";

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

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
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="text-sm text-muted-foreground">
          {mode === "login" 
            ? "Log in to add new places and leave reviews" 
            : "Sign up to contribute to Medan Sports GIS"}
        </p>
      </div>

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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
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

      <div className="text-center">
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </Button>
      </div>
    </div>
  );
}
