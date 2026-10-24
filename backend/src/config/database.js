import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export function databaseReady() {
  return mongoose.connection.readyState === 1;
}
