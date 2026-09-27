import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// firebase-admin doesn't have a proper ESM export, so we use createRequire
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccountPath = join(__dirname, '..', 'serviceAccountKey.json');

let firebaseAdminReady = false;

if (existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = require(serviceAccountPath);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    firebaseAdminReady = true;
    console.log('✅ Firebase Admin SDK initialized with service account');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  }
} else {
  console.warn('⚠️  serviceAccountKey.json not found at:', serviceAccountPath);
  console.warn('⚠️  Auth middleware will run in BYPASS mode (NOT SECURE for production!)');
  console.warn('⚠️  Download it from: Firebase Console → Project Settings → Service Accounts');
}

/**
 * Middleware: Verify Firebase ID Token
 * Extracts the Bearer token from the Authorization header,
 * verifies it with Firebase Admin SDK, and attaches the decoded
 * user info to req.user.
 * 
 * If Firebase Admin is not configured, it falls back to trusting
 * the token payload (DEVELOPMENT ONLY — not secure for production).
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If Firebase Admin is not ready, allow unauthenticated requests in dev mode
    if (!firebaseAdminReady) {
      console.warn('⚠️  No auth token & Firebase Admin not configured — bypassing auth (DEV MODE)');
      // Try to extract uid from body or params as fallback
      req.user = { uid: req.body?.uid || req.params?.uid || 'dev-user' };
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  if (firebaseAdminReady) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = decoded; // { uid, email, name, ... }
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
  } else {
    // DEV FALLBACK: Decode the JWT without verification (NOT SECURE!)
    // This allows the app to work while developing without a service account
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = { uid: payload.user_id || payload.sub, email: payload.email };
      console.warn('⚠️  Token accepted WITHOUT verification (DEV MODE)');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
    }
  }
};

/**
 * Middleware: Verify Studio Membership
 * Must be used AFTER verifyToken.
 * Checks that the authenticated user is a member of the studio
 * referenced by :studioId or :id in the route params, or by studioId in the body.
 */
export const verifyStudioMember = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const { default: Studio } = await import('../models/Studio.js');
      const studioId = req.params.studioId || req.params.id || req.body.studioId;

      if (!studioId) {
        return res.status(400).json({ message: 'Studio ID is required' });
      }

      const studio = await Studio.findById(studioId);
      if (!studio) {
        return res.status(404).json({ message: 'Studio not found' });
      }

      const member = studio.members.find(m => m.uid === req.user.uid);
      if (!member) {
        return res.status(403).json({ message: 'Forbidden: You are not a member of this studio' });
      }

      // If a specific role is required (e.g., 'admin')
      if (requiredRole === 'admin' && member.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }

      req.studioMember = member;
      req.studio = studio;
      next();
    } catch (error) {
      console.error('Studio membership check failed:', error.message);
      return res.status(500).json({ message: 'Server error during authorization' });
    }
  };
};
