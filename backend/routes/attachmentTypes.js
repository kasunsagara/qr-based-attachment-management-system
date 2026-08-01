const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAttachmentTypes,
  getAttachmentType,
  createAttachmentType,
  updateAttachmentType,
  deleteAttachmentType,
} = require('../controllers/attachmentTypeController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router
  .route('/')
  .get(getAttachmentTypes)
  .post(
    [body('attachmentName').notEmpty().withMessage('Attachment name is required')],
    createAttachmentType
  );

router
  .route('/:id')
  .get(getAttachmentType)
  .put(updateAttachmentType)
  .delete(deleteAttachmentType);

module.exports = router;
