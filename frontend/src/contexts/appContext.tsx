import React, { createContext, useContext, useState } from 'react';
import { main } from '../../wailsjs/go/models'

export type AppContextType = {
  currentSession: main.Session | null;
  setCurrentSession: React.Dispatch<React.SetStateAction<main.Session | null>>;
  sessions: main.Session[];
  setSessions: React.Dispatch<React.SetStateAction<main.Session[]>>;
}

export const AppContext = createContext<AppContextType>({
  currentSession: null,
  sessions: [],
  setCurrentSession: () => {},
  setSessions: () => {},
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<main.Session | null>(null);
  const [sessions, setSessions] = useState<main.Session[]>([]);

  return (
    <AppContext.Provider value={
      {
        currentSession,
        setCurrentSession,
        sessions,
        setSessions,
      }
    }>
      {children}
    </AppContext.Provider>)
}


