const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp = null;

const initializeFirebase = () => {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      // Initialize from environment variables
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      logger.info('Firebase initialized successfully');
    } else {
      logger.warn('Firebase not configured, using mock auth');
    }
  } catch (error) {
    logger.error('Firebase initialization error:', error);
  }
  return firebaseApp;
};

// Verify Firebase token
const verifyFirebaseToken = async (token) => {
  if (!firebaseApp) {
    // Mock verification for development
    return {
      uid: 'mock_uid_' + Date.now(),
      email: 'mock@example.com',
      name: 'Mock User'
    };
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};

module.exports = { initializeFirebase, verifyFirebaseToken };
