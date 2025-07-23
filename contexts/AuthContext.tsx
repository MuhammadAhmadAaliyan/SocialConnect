import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: any | null;
  login: (user: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => setUser(userData);
  const logout = () => {
    AsyncStorage.clear();
    setUser(null);
  };

  //Rehydrate user on app start
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const userId = await AsyncStorage.getItem("@userId");
        const name = await AsyncStorage.getItem("@userName");
        const bio = await AsyncStorage.getItem("@bio");
        const avatar = await AsyncStorage.getItem("@profileImage");
        const followers = await AsyncStorage.getItem("@userFollowers");
        const followings = await AsyncStorage.getItem("@userFollowings");

        if (userId) {
          setUser({
            user: {
              id: userId,
              name,
              bio,
              avatar,
              followers: followers ? JSON.parse(followers) : [],
              followings: followings ? JSON.parse(followings) : [],
            }
          });
        }
      } catch (error) {
        console.log("Error loading user from AsyncStorage", error);
      }
    };

    loadUserFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);