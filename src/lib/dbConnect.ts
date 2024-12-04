import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || '', {
    });

    connection.isConnected = db.connections[0].readyState;

    console.log('DB Connected Successfully');
  } catch (error) {
    console.error('DB connection failed', error);
    process.exit(1); // Exits the process if connection fails
  }
}

export default dbConnect;
