const mongoose = require("mongoose");

const getConnectionString = () => {
  const env = process.env.NODE_ENV || 'development';
  const baseUrl = process.env.MONGO_URL;
  
  if (!baseUrl) {
    throw new Error('MONGO_URL not set in environment variables');
  }

  // Extract the database name from the connection string
  const dbNameMatch = baseUrl.match(/\/([^/?]+)(\?|$)/);
  const defaultDbName = dbNameMatch ? dbNameMatch[1] : 'is212';
  
  // Replace or append the database name based on environment
  let dbName;
  switch (env) {
    case 'test':
      dbName = 'is212_test';
      break;
    case 'production':
      dbName = 'is212_prod';
      break;
    default:
      dbName = 'is212_dev';
  }
  
  // Replace the database name in the connection string
  return baseUrl.replace(defaultDbName, dbName);
};

const connectDB = async () => {
  try {
    const uri = getConnectionString();
    if (!uri) throw new Error("Database URL not configured");

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(uri, options);
    
    const env = process.env.NODE_ENV || 'development';
    console.log(`✅ MongoDB connected (${env} environment)`);
    
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    throw err; // Let the caller handle the error
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    console.error('❌ MongoDB disconnection failed:', err.message);
    throw err;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionString
};