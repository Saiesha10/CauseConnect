const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setCustomClaims(email, role) {
  try {
    // Fetch user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    // Set custom claims: role and user-id (mapped to Firebase UID)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: role,
      'x-hasura-user-id': userRecord.uid,
    });
    console.log(`Set role ${role} for ${email} (UID: ${userRecord.uid})`);
    return { uid: userRecord.uid, email, role };
  } catch (error) {
    console.error(`Error processing ${email}:`, error);
    throw error;
  }
}

// Accept command-line arguments: email and role
const [,, email, role] = process.argv;

if (!email || !role) {
  console.error('Usage: node setNewUserClaims.js <email> <role>');
  process.exit(1);
}

setCustomClaims(email, role)
  .then(() => {
    console.log('Custom claims set successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });