// Travel Guardian - Document Vault Service
// Connects document screens to backend REST API with offline-first AsyncStorage caching

import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, put, del } from './api';

export const DOCUMENTS_CACHE_KEY = 'travel_guardian_documents_cache';

// -------------------------------------------------------
// Local Cache Helpers
// -------------------------------------------------------
export const getCachedDocuments = async () => {
  try {
    const raw = await AsyncStorage.getItem(DOCUMENTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log('[Documents] Cache read error:', err.message);
    return [];
  }
};

export const setCachedDocuments = async (docs) => {
  try {
    if (Array.isArray(docs)) {
      await AsyncStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(docs));
    }
  } catch (err) {
    console.log('[Documents] Cache write error:', err.message);
  }
};

// -------------------------------------------------------
// Get all documents saved in the vault
// GET /api/documents with local cache fallback for offline readiness
// -------------------------------------------------------
export const getDocuments = async () => {
  try {
    const res = await get('/documents');
    if (res && res.data && Array.isArray(res.data)) {
      // Update local offline cache
      await setCachedDocuments(res.data);
      return res;
    }
  } catch (err) {
    console.log('[Documents] Backend fetch notice, falling back to cache:', err.message);
  }

  // Fallback to local cache if backend is unavailable
  const cached = await getCachedDocuments();
  return { success: true, data: cached, offline: true };
};

// -------------------------------------------------------
// Upload a scanned document image to the backend
// POST /api/documents (multipart/form-data)
// formData must contain: file (binary), title, documentType, expiryDate
// -------------------------------------------------------
export const uploadDocument = async (formData) => {
  const res = await post('/documents', formData);
  if (res && res.data) {
    try {
      const cached = await getCachedDocuments();
      const updated = [res.data, ...cached.filter((d) => (d._id || d.id) !== (res.data._id || res.data.id))];
      await setCachedDocuments(updated);
    } catch {}
  }
  return res;
};

// -------------------------------------------------------
// Update document title (rename), favorite status, or metadata
// PUT /api/documents/:id
// -------------------------------------------------------
export const updateDocument = async (documentId, updateData) => {
  const res = await put(`/documents/${documentId}`, updateData);
  if (res && res.data) {
    try {
      const cached = await getCachedDocuments();
      const updated = cached.map((d) => ((d._id || d.id) === documentId ? { ...d, ...res.data } : d));
      await setCachedDocuments(updated);
    } catch {}
  }
  return res;
};

// -------------------------------------------------------
// Delete a document from the vault by ID
// DELETE /api/documents/:id
// -------------------------------------------------------
export const deleteDocument = async (documentId) => {
  try {
    const cached = await getCachedDocuments();
    const updated = cached.filter((d) => (d._id || d.id) !== documentId);
    await setCachedDocuments(updated);
  } catch {}

  return await del(`/documents/${documentId}`);
};

export default {
  DOCUMENTS_CACHE_KEY,
  getCachedDocuments,
  setCachedDocuments,
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
};
