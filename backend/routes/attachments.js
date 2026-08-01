const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAttachments,
  getAttachment,
  createAttachment,
  updateAttachment,
  deleteAttachment,
} = require('../controllers/attachmentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router
  .route('/')
  .get(getAttachments)
  .post(
    [
      body('moduleId').notEmpty().withMessage('Module is required'),
      body('attachmentTypeId').notEmpty().withMessage('Attachment type is required'),
    ],
    createAttachment
  );

router
  .route('/:id')
  .get(getAttachment)
  .put(updateAttachment)
  .delete(deleteAttachment);

module.exports = router;
