const crypto = require('crypto');

// 32-byte key (AES-256) and 16-byte IV or 12-byte for GCM
const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY 
    ? Buffer.from(process.env.PII_ENCRYPTION_KEY, 'hex') 
    : crypto.createHash('sha256').update(process.env.JWT_SECRET || 'instaatrim_enterprise_secret_32bytes!').digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM

/**
 * Encrypt sensitive PII text with AES-256-GCM
 * Output format: iv:authTag:encryptedText (hex encoded)
 */
function encryptPII(text) {
    if (!text || typeof text !== 'string') return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (err) {
        console.error('Encryption error:', err);
        return text;
    }
}

/**
 * Decrypt AES-256-GCM encrypted PII text
 */
function decryptPII(cipherText) {
    if (!cipherText || typeof cipherText !== 'string' || !cipherText.includes(':')) return cipherText;
    try {
        const parts = cipherText.split(':');
        if (parts.length !== 3) return cipherText;
        const [ivHex, authTagHex, encryptedText] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        // If not matching format or wrong key, return as is safely
        return cipherText;
    }
}

/**
 * Anonymize PII for Right-to-Erasure (GDPR)
 */
function anonymizePII(text, type = 'text') {
    if (!text) return '';
    if (type === 'email') {
        return `anonymized_${crypto.randomBytes(4).toString('hex')}@erased.instaatrim.com`;
    }
    if (type === 'phone') {
        return `+91000000${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return `Anonymized_User_${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = {
    encryptPII,
    decryptPII,
    anonymizePII
};
