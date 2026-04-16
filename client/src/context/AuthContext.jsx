import { createContext, useEffect, useState } from "react";

import axiosInstance from "../lib/axios";

export const AuthContext = createContext(null);

const normalizeStudentUser = (user) => ({
  ...user,
  year: user?.year ?? user?.hostelStudent?.year ?? null,
  gender: user?.gender ?? user?.hostelStudent?.gender ?? null,
  room_allocated: user?.room_allocated ?? user?.hostelStudent?.room_allocated ?? false,
  hostel_id: user?.hostel_id ?? user?.hostelStudent?.hostel_id ?? null,
  room_number: user?.room_number ?? user?.hostelStudent?.room_number ?? null,
});

const normalizeAdminUser = (user) => ({
  ...user,
  role: user?.role ?? user?.admin?.role ?? null,
});

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  if (user.login_type === "student") {
    return normalizeStudentUser(user);
  }

  if (user.login_type === "admin") {
    return normalizeAdminUser(user);
  }

  return user;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthActionPending, setIsAuthActionPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");

        if (isMounted) {
          setUser(normalizeUser(response.data?.data?.user));
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUser = async () => {
    const response = await axiosInstance.get("/auth/me");
    const normalizedUser = normalizeUser(response.data?.data?.user);

    setUser(normalizedUser);

    return normalizedUser;
  };

  const login = async ({ email, password, loginType }) => {
    setIsAuthActionPending(true);

    try {
      const endpoint =
        loginType === "admin" ? "/auth/admin/login" : "/auth/student/login";
      const response = await axiosInstance.post(endpoint, {
        email,
        password,
      });
      const normalizedUser = normalizeUser(response.data?.data?.user);

      setUser(normalizedUser);

      return normalizedUser;
    } finally {
      setIsAuthActionPending(false);
    }
  };

  const logout = async () => {
    setIsAuthActionPending(true);

    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Even if the request fails, clear local session state.
    } finally {
      setUser(null);
      setIsAuthActionPending(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthActionPending,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
