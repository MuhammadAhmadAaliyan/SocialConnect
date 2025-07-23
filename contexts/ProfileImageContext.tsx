import React, { createContext, useState, useContext } from 'react';

const ProfileImageContext = createContext<any>(null);

export const ProfileImageProvider = ({ children }: any) => {
  const [profileImage, setProfileImage] = useState<any>();

  return (
    <ProfileImageContext.Provider value={{ profileImage, setProfileImage }}>
      {children}
    </ProfileImageContext.Provider>
  );
};

export const useProfileImage = () => useContext(ProfileImageContext);
