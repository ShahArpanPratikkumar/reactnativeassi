// ============================================================
// Contact Controller - CRUD for Emergency Contacts
// All contacts are private — only the owner can access them
// ============================================================
const Contact = require('../models/Contact');

// ============================================================
// @desc    Get all emergency contacts for the logged-in user
// @route   GET /api/contacts
// @access  Private
// ============================================================
const getContacts = async (req, res) => {
  try {
    // Sort: primary contacts first, then by newest
    const contacts = await Contact.find({ user: req.user._id })
      .sort({ isPrimary: -1, createdAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('getContacts error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Add a new emergency contact
// @route   POST /api/contacts
// @access  Private
// ============================================================
const addContact = async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    // --- Validation ---
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide contact name and phone number',
      });
    }

    // If this new contact is primary, unset any existing primary contact first
    if (isPrimary) {
      await Contact.updateMany({ user: req.user._id }, { isPrimary: false });
    }

    const contact = await Contact.create({
      user:         req.user._id,
      name:         name.trim(),
      phone:        phone.trim(),
      relationship: relationship || 'Emergency Contact',
      isPrimary:    isPrimary    || false,
    });

    res.status(201).json({
      success: true,
      message: 'Emergency contact added!',
      data: contact,
    });
  } catch (error) {
    console.error('addContact error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Update an emergency contact
// @route   PUT /api/contacts/:id
// @access  Private
// ============================================================
const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Ownership check
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this contact' });
    }

    // If updating to primary, clear other primary contacts first
    if (req.body.isPrimary) {
      await Contact.updateMany({ user: req.user._id }, { isPrimary: false });
    }

    const updated = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json({
      success: true,
      message: 'Contact updated!',
      data: updated,
    });
  } catch (error) {
    console.error('updateContact error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// ============================================================
// @desc    Delete an emergency contact
// @route   DELETE /api/contacts/:id
// @access  Private
// ============================================================
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Ownership check
    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this contact' });
    }

    await contact.deleteOne();

    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('deleteContact error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { getContacts, addContact, updateContact, deleteContact };
