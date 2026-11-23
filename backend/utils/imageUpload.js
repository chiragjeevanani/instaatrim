// Shared rules for every image upload (ads, categories, rituals).
// Only real image types are accepted, and the saved file extension comes from the
// image type — never from the uploaded file name — so an .html/.svg/.js file can
// never be stored and served from /uploads.
const path = require('path');

const IMAGE_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/pjpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif'
};
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

const imageFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (IMAGE_TYPES[file.mimetype] && (!ext || IMAGE_EXTENSIONS.includes(ext))) return cb(null, true);
    const err = new Error('Only image files (JPG, PNG, WEBP, GIF) can be uploaded.');
    err.status = 400;
    return cb(err);
};

// Extension for the stored file, based on the image type
const imageExt = (file) => IMAGE_TYPES[file.mimetype] || '.jpg';

const imageUploadOptions = (storage) => ({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_IMAGE_BYTES }
});

module.exports = { imageFileFilter, imageExt, imageUploadOptions, IMAGE_EXTENSIONS, MAX_IMAGE_BYTES };
