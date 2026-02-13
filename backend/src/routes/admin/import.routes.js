const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../../controllers/admin/import.controller');
const { protect, authorize } = require('../../middleware/auth');

// Setup multer for file upload
const upload = multer({
  dest: 'uploads/imports/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
});

router.use(protect);
router.use(authorize('admin'));

// Import Routes
router.post('/data', upload.single('file'), importController.importData);
router.get('/template/:type', importController.getTemplate);
router.get('/history', importController.getImportHistory);

module.exports = router;
