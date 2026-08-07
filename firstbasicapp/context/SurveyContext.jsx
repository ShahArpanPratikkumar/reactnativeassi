import React, { createContext, useContext, useState } from 'react';

const SurveyContext = createContext();

const INITIAL_SURVEYS = [
  {
    id: '1',
    siteName: 'Downtown Office Complex',
    clientName: 'ABC Corp',
    description: 'Structural inspection of the main building lobby and parking area.',
    priority: 'High',
    date: '2026-07-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    siteName: 'Riverside Park Bridge',
    clientName: 'City Municipality',
    description: 'Routine inspection of pedestrian bridge supports and railings.',
    priority: 'Medium',
    date: '2026-07-19',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    siteName: 'Green Valley School',
    clientName: 'Education Board',
    description: 'Safety assessment of school playground equipment.',
    priority: 'Low',
    date: '2026-07-18',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const INITIAL_PROFILE = {
  name: 'Arpan Shah',
  id: 'STU-2026-0042',
  department: 'Computer Engineering',
  semester: '3rd Semester',
  email: 'arpan.shah@university.edu',
  phone: '+91 98765 43210',
};

export function SurveyProvider({ children }) {
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [profile, setProfile] = useState(INITIAL_PROFILE);

  const addSurvey = (survey) => {
    const newSurvey = {
      ...survey,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSurveys((prev) => [newSurvey, ...prev]);
    setCapturedPhoto(null);
    return newSurvey;
  };

  const updateSurvey = (id, updates) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    setSelectedSurvey((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev
    );
  };

  const deleteSurvey = (id) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
    if (selectedSurvey && selectedSurvey.id === id) {
      setSelectedSurvey(null);
    }
  };

  const getTodayCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return surveys.filter((s) => s.date === today).length;
  };

  const getRecentSurveys = (count = 3) => {
    return surveys.slice(0, count);
  };

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        addSurvey,
        updateSurvey,
        deleteSurvey,
        getTodayCount,
        getRecentSurveys,
        selectedSurvey,
        setSelectedSurvey,
        capturedPhoto,
        setCapturedPhoto,
        profile,
        updateProfile,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurveys() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurveys must be used within a SurveyProvider');
  }
  return context;
}
