import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeSettings {
  courtColor: string;
  kitchenColor: string;
}

interface SettingsContextType {
  settings: ThemeSettings;
  setSettings: (settings: ThemeSettings) => void;
}

const defaultSettings: ThemeSettings = {
  courtColor: '#3B82F6', // blue-600
  kitchenColor: '#F472B6', // pink-400
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettingsState] = useState<ThemeSettings>(defaultSettings);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('pickleScoreSettings');
      if (storedSettings) {
        setSettingsState(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const setSettings = (newSettings: ThemeSettings) => {
    try {
      localStorage.setItem('pickleScoreSettings', JSON.stringify(newSettings));
      setSettingsState(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
