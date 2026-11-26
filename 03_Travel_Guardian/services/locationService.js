// Travel Guardian - Location Service
// Sends GPS updates and SOS distress beacons to the backend

import { get, post } from './api';

// -------------------------------------------------------
// Get saved location history
// GET /api/location
// -------------------------------------------------------
export const getLocationHistory = async () => {
  return await get('/location');
};

// -------------------------------------------------------
// Save a GPS location update to the backend
// POST /api/location
// Sends: { latitude, longitude, address, isSosTriggered }
// -------------------------------------------------------
export const saveLocation = async (locationData) => {
  return await post('/location', locationData);
};

export default { getLocationHistory, saveLocation };
