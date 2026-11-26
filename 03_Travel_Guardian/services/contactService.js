// Travel Guardian - Emergency Contacts Service
// Handles REST API calls for emergency guardian network contacts

import { get, post, put, del } from './api';

// Fetch all emergency contacts for the user
export const getContacts = async () => {
  try {
    return await get('/contacts');
  } catch (error) {
    throw error;
  }
};

// Add a new emergency contact
export const addContact = async (contactData) => {
  try {
    return await post('/contacts', contactData);
  } catch (error) {
    throw error;
  }
};

// Update an existing contact
export const updateContact = async (contactId, contactData) => {
  try {
    return await put(`/contacts/${contactId}`, contactData);
  } catch (error) {
    throw error;
  }
};

// Delete an emergency contact
export const deleteContact = async (contactId) => {
  try {
    return await del(`/contacts/${contactId}`);
  } catch (error) {
    throw error;
  }
};

export default {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
};
