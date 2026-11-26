// Contact Routes
const express = require('express');
const router = express.Router();
const { getContacts, addContact, updateContact, deleteContact } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/contacts    - Get all emergency contacts
// POST /api/contacts   - Add new emergency contact
router.route('/')
  .get(protect, getContacts)
  .post(protect, addContact);

// PUT /api/contacts/:id    - Update a contact
// DELETE /api/contacts/:id - Delete a contact
router.route('/:id')
  .put(protect, updateContact)
  .delete(protect, deleteContact);

module.exports = router;
