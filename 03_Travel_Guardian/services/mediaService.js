// Travel Guardian - Media Evidence Service
// Connects the media screen to the backend REST API

import { get, post, del } from './api';

// -------------------------------------------------------
// Get all media evidence items saved in the vault
// GET /api/media
// -------------------------------------------------------
export const getMedia = async () => {
  return await get('/media');
};

// -------------------------------------------------------
// Upload a photo or video evidence file to the backend
// POST /api/media (multipart/form-data)
// formData must contain: file (binary), title, mediaType, location
// -------------------------------------------------------
export const uploadMedia = async (formData) => {
  return await post('/media', formData);
};

// -------------------------------------------------------
// Delete a media evidence item by ID
// DELETE /api/media/:id
// -------------------------------------------------------
export const deleteMedia = async (mediaId) => {
  return await del(`/media/${mediaId}`);
};

export default { getMedia, uploadMedia, deleteMedia };
