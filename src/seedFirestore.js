const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

const usersCollectionName = "users";
const threadsCollectionName = "threads";
const messagesCollectionName = "messages";

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();
const dataToSeed = require("./seedData.json");

async function addUsersCollection() {
  const users = dataToSeed.users;
  const collectionRef = firestore.collection(usersCollectionName);

  users.forEach(async (user) => {
    collectionRef.doc(user.id).set(user);
  });
}

async function addThreadsCollection() {
  const threads = dataToSeed.threads;
  const collectionRef = firestore.collection(threadsCollectionName);

  threads.forEach(async (thread) => {
    let readReceipts = {};
    let usersRoles = {};

    thread.readReceipts.forEach((readReceipt) => {
      readReceipts[readReceipt.userId] = new Date(readReceipt.readTime);
    });

    thread.usersRoles.forEach((userRole) => {
      usersRoles[userRole.userId] = userRole.role;
    });

    await collectionRef
      .doc(thread.id)
      .set({ ...thread, readReceipts, usersRoles });
  });
}

async function addMessagesToThreads() {
  const threadMessages = dataToSeed.threadMessages;
  const threadsRef = firestore.collection(threadsCollectionName);

  threadMessages.forEach(async (threadMessage) => {
    threadMessage.messages.forEach(async (message) => {
      await threadsRef
        .doc(threadMessage.threadId)
        .collection(messagesCollectionName)
        .doc(message.id)
        .set({ ...message, timestamp: new Date(message.timestamp) });
    });
  });
}

async function seedFirestore() {
  await addUsersCollection();
  await addThreadsCollection();
  await addMessagesToThreads();

  console.log("Seed completed 🍀");
}

seedFirestore();
