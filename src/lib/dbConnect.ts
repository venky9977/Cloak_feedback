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
    // Log the URI (without sensitive info) to verify it's loaded correctly
    console.log('MongoDB URI:', process.env.MONGODB_URI);

    const db = await mongoose.connect(process.env.MONGODB_URI || '', {
      // No need for `useNewUrlParser` or `useUnifiedTopology` in newer versions of Mongoose
    });

    connection.isConnected = db.connections[0].readyState;

    console.log('DB Connected Successfully');
  } catch (error) {
    console.error('DB connection failed', error);
    console.log('MONGODB_URI:', process.env.MONGODB_URI); // For debugging purposes
    process.exit(1); // Exits the process if connection fails, consider retrying
  }
}

export default dbConnect;
