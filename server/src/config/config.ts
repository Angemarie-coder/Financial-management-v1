import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

dotenv.config(); // Load environment variables from .env

// ✅ Runtime validation for critical env vars
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL in environment variables');
}

if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
  throw new Error('Missing JWT_SECRET or JWT_EXPIRES_IN in environment variables');
}

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables');
}

export const config = {
  port: process.env.PORT || 4000,

  // ✅ Use DATABASE_URL only — for local and Render environments
  databaseUrl: process.env.DATABASE_URL as string,

  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],

  // ✅ Gmail SMTP Configuration
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,

  // ✅ Optional: Cloudinary config
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
