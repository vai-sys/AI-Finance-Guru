// import React, { createContext, useContext, useEffect, useState } from "react";
// import authService from "../service/ApiService"

// const AuthContext = createContext(null);

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); 
//   useEffect(() => {
//     let mounted = true;
//     const checkProfile = async () => {
//       try {
//         setLoading(true);
//         const data = await authService.getProfile();
//         if (!mounted) return;
//         if (data?.user) {
//           setUser(data.user);
//         } else {
//           setUser(null);
//         }
//       } catch (err) {
//         if (!mounted) return;
//         setUser(null);
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     };

//     checkProfile();

//     return () => {
//       mounted = false;
//     };
//   }, []);


//   const login = async (credentials) => {
//     const data = await authService.login(credentials);
//     if (data?.user) {
//       setUser(data.user); 
//       return { ok: true, user: data.user };
//     }
//     return { ok: false, message: data?.message || "Login failed" };
//   };

//   const register = async (userData) => {
//     const data = await authService.register(userData);
//     return data;
//   };


//   const logout = async () => {
//     try {
//       await authService.logout();
//     } catch (e) {
//       console.warn("Logout call failed", e);
//     } finally {
//       setUser(null);
//     }
//   };


//   const updateProfile = async (updates) => {
//     const data = await authService.updateProfile(updates);
//     if (data?.user) {
//       setUser(data.user);
//     }
//     return data;
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
//       {children}
//     </AuthContext.Provider>
//   );

// };



import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../service/ApiService";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      try {
        setLoading(true);
        const data = await authService.getProfile();

        if (!mounted) return;

        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, []);

 
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);

      if (data?.user) {
        setUser(data.user);
        return { ok: true, user: data.user };
      }

      return { ok: false, message: data?.message || "Login failed" };
    } catch (err) {
      return { ok: false, message: "Network error" };
    }
  };


  const register = async (userData) => {
    return await authService.register(userData);
  };


  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    const data = await authService.updateProfile(updates);

    if (data?.user) {
      setUser(data.user);
    }

    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
