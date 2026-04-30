import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch role from Firestore
        try {
          // 1. Check if user is an Admin
          const adminDoc = await getDoc(doc(db, "admin_users", user.uid));
          if (adminDoc.exists() && adminDoc.data().role === "admin") {
            setUserRole("admin");
          } else {
            // 2. Check if user is a Company User
            const companyDoc = await getDoc(doc(db, "company_users", user.uid));
            if (companyDoc.exists()) {
              setUserRole("user");
            } else {
              // Default for new signups before redirect
              setUserRole("user");
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("user");
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    logout,
    isAdmin: userRole === "admin",
    isUser: userRole === "user",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
