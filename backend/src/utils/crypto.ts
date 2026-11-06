import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const saltLength = 64;
const iterations = 100000;
const keyLength = 32;
const ivLength = 16;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(saltLength);
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const [saltHex, hashHex] = hash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const derivedHash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  return derivedHash.toString('hex') === hashHex;
}

export function encryptText(text: string, secret: string): string {
  const iv = crypto.randomBytes(ivLength);
  const key = crypto.scryptSync(secret, 'salt', keyLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decryptText(encrypted: string, secret: string): string {
  const [ivHex, tagHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = crypto.scryptSync(secret, 'salt', keyLength);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
