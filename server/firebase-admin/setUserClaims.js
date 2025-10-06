const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const users = [
  { email: 'priya.sharma@ngo.org', role: 'organizer', uid: 'FRjufJRWAacowpo7q6SBRp9Nyjp2' },
  { email: 'rajesh.patel@ngo.org', role: 'organizer', uid: '93M8SuREo0NXdgUJLF2jO0luBN03' },
  { email: 'ananya.gupta@ngo.org', role: 'organizer', uid: 'iGAaNm8wtIM6qT0ogUyJmG6fJ1g2' },
  { email: 'vikram.singh@ngo.org', role: 'organizer', uid: '4c42eiqBPvfRPlQrLyBCHltMkCd2' },
  { email: 'neha.verma@ngo.org', role: 'organizer', uid: 'ZO1A2eCgROTY2lA1KzBrmIVPLFO2' },
  { email: 'arjun.mehta@ngo.org', role: 'organizer', uid: 'DP0wqfHnbsgHcq9qEnKCVUSm2aB2' },
  { email: 'sneha.reddy@ngo.org', role: 'organizer', uid: 'qd8tmSw9ttPQ8uGcOqFbq3g6JtH3' },
  { email: 'rohan.desai@ngo.org', role: 'organizer', uid: 'pTObHOfLJogHMoo8FYdJvCkMTWq1' },
  { email: 'kavita.joshi@ngo.org', role: 'organizer', uid: '2BsjRUI9a7gdKtt5cpwubLn0NzB2' },
  { email: 'sanjay.kumar@ngo.org', role: 'organizer', uid: '09iJwTexywRy0dtJneGar4tGRAn2' },
  { email: 'aisha.khan@gmail.com', role: 'user', uid: 'k7AEh2TEPWcIY9glwLX5yGSUb863' },
  { email: 'sameer.ali@yahoo.com', role: 'user', uid: 'SaVHKXYsxxdGfondUiyzS4wlseT2' },
  { email: 'riya.kapoor@outlook.com', role: 'user', uid: 'OOpWETTtobcFb9e0mhbLmvEAhWq2' },
  { email: 'aditya.nair@gmail.com', role: 'user', uid: 'h8CufmTmmeNIK9gJEYlqJ5VL2hk1' },
  { email: 'pooja.menon@hotmail.com', role: 'user', uid: 'UqHcf9gBISYChyXB4j8CovB6wJs1' },
  { email: 'karan.shah@gmail.com', role: 'user', uid: 'AJLm6IpmIJeKRLcbUTgdORhNzEg2' },
  { email: 'divya.iyer@yahoo.com', role: 'user', uid: 'xyAewLG4WFUnYsa2d0MXMsylT8Z2' },
  { email: 'amitabh.bose@outlook.com', role: 'user', uid: 'ivklkCSf53ao2liAlRyPm54ZNXi1' },
  { email: 'lakshmi.rao@gmail.com', role: 'user', uid: 'KJLTmXxGYuU8vRFbapNI9Tb1U4q1' },
  { email: 'siddharth.pillai@hotmail.com', role: 'user', uid: 'S3SMXjrm9SOFNp20Cb8QoD9MjUf1' },
];

async function setCustomClaims() {
  for (const user of users) {
    try {
      const userRecord = await admin.auth().getUser(user.uid);
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: user.role });
      console.log(`Set role ${user.role} for ${user.email} (UID: ${userRecord.uid})`);
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error);
    }
  }
}

setCustomClaims()
  .then(() => {
    console.log('All custom claims set successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running setCustomClaims:', error);
    process.exit(1);
  });