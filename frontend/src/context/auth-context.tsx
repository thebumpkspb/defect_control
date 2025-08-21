"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
// import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { LayoutStore, UserStore } from "@/store";
import { User } from "@/types";
import { useRouter } from "@/navigation";

// type User = {
//   id: string;
//   name: string;
//   //   email: string;
//   // Add other user properties as needed
// };

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  //   logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [users, setUsers] = useState();
  const router = useRouter();
  const { backTarget } = LayoutStore();
  const { user } = UserStore();
  const { setUser } = UserStore.getState();
  //   console.log("AuthProvider");
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = () => {
      // console.log("checkUserLoggedIn");

      const storedUser = localStorage.getItem("userToken");
      // console.log("ss1");
      // console.log("storedUser:", storedUser);
      setIsLoading(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setUsers(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
      // console.log("ss2");
    };

    checkUserLoggedIn();
  }, []);

  //   Login function
  const login = async (username: string, password: string) => {
    // console.log("login");
    // setIsLoading(true);
    setIsLoading(true);
    try {
      const res = await loginUser({
        username: username,
        password: password,
      });

      setUser(res);
      setIsLoading(false);

      if (res) {
        router.replace(
          backTarget && backTarget !== "/login" ? backTarget : "/home"
        );
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
