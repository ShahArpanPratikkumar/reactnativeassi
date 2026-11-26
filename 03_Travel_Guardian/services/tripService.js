// Travel Guardian - Trip Management Service
// Handles REST API calls for travel plans, itineraries, and status updates
// Includes AsyncStorage local caching for offline availability & immediate rendering

import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, put, del } from './api';

const TRIPS_CACHE_KEY = 'travel_guardian_trips_cache';

// Retrieve cached trips from local storage
export const getCachedTrips = async () => {
  try {
    const raw = await AsyncStorage.getItem(TRIPS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log('[TripService] Cache read error:', err.message);
    return [];
  }
};

// Save trips array to local storage
export const cacheTrips = async (trips) => {
  try {
    if (Array.isArray(trips)) {
      await AsyncStorage.setItem(TRIPS_CACHE_KEY, JSON.stringify(trips));
    }
  } catch (err) {
    console.log('[TripService] Cache write error:', err.message);
  }
};

// Fetch all trips for the logged-in user (with automatic caching and offline fallback)
export const getTrips = async () => {
  try {
    const response = await get('/trips');
    if (response?.data && Array.isArray(response.data)) {
      await cacheTrips(response.data);
    }
    return response;
  } catch (error) {
    console.log('[TripService] API failed, checking local cache:', error.message);
    const cached = await getCachedTrips();
    if (cached && cached.length > 0) {
      return { success: true, count: cached.length, data: cached, isFromCache: true };
    }
    throw error;
  }
};

// Fetch single trip details by ID
export const getTripById = async (tripId) => {
  try {
    const response = await get(`/trips/${tripId}`);
    return response;
  } catch (error) {
    // Check cached list if network fails
    const cached = await getCachedTrips();
    const match = cached.find((t) => (t._id || t.id) === tripId);
    if (match) {
      return { success: true, data: match, isFromCache: true };
    }
    throw error;
  }
};

// Create a new trip itinerary (with offline local storage fallback)
export const createTrip = async (tripData) => {
  try {
    const response = await post('/trips', tripData);
    if (response?.data) {
      const cached = await getCachedTrips();
      await cacheTrips([response.data, ...cached]);
    }
    return response;
  } catch (error) {
    console.log('[TripService] Backend create failed, saving to local cache:', error.message);
    const tempId = 'trip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const localTrip = {
      _id: tempId,
      id: tempId,
      ...tripData,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };
    const cached = await getCachedTrips();
    const updated = [localTrip, ...cached];
    await cacheTrips(updated);
    return { success: true, data: localTrip, isLocal: true };
  }
};

// Update an existing trip (with offline local storage fallback)
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await put(`/trips/${tripId}`, tripData);
    if (response?.data) {
      const cached = await getCachedTrips();
      const updated = cached.map((t) =>
        (t._id || t.id) === tripId ? { ...t, ...response.data } : t
      );
      await cacheTrips(updated);
    }
    return response;
  } catch (error) {
    console.log('[TripService] Backend update failed, updating local cache:', error.message);
    const cached = await getCachedTrips();
    const updated = cached.map((t) =>
      (t._id || t.id) === tripId ? { ...t, ...tripData, updatedAt: new Date().toISOString() } : t
    );
    await cacheTrips(updated);
    const match = updated.find((t) => (t._id || t.id) === tripId);
    return { success: true, data: match, isLocal: true };
  }
};

// Delete a trip (with offline local storage fallback)
export const deleteTrip = async (tripId) => {
  try {
    const response = await del(`/trips/${tripId}`);
    const cached = await getCachedTrips();
    const filtered = cached.filter((t) => (t._id || t.id) !== tripId);
    await cacheTrips(filtered);
    return response;
  } catch (error) {
    console.log('[TripService] Backend delete failed, removing from local cache:', error.message);
    const cached = await getCachedTrips();
    const filtered = cached.filter((t) => (t._id || t.id) !== tripId);
    await cacheTrips(filtered);
    return { success: true, message: 'Deleted locally', isLocal: true };
  }
};

export default {
  getCachedTrips,
  cacheTrips,
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
};
