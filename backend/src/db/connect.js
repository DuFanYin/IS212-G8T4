const mongoose = require("mongoose");

const getConnectionString = () => {
  const env = process.env.NODE_ENV;
  let baseUrl = process.env.MONGO_URL;
  
  if (!baseUrl) throw new Error('MONGO_URL not set');

  let dbName;
  switch (env) {
    case 'test': dbName = 'is212_test'; break;
    case 'production': dbName = 'is212_prod'; break;
    default: dbName = 'is212_dev';
  }

  // Extract the base URL without the database name and query parameters
  const urlParts = baseUrl.split('?');
  const baseUrlWithoutQuery = urlParts[0];
  const queryParams = urlParts[1] ? `?${urlParts[1]}` : '';

  // Remove any existing database name from the URL
  const baseUrlWithoutDB = baseUrlWithoutQuery.replace(/\/[^/]*$/, '');

  // Construct the new URL with the correct database name
  return `${baseUrlWithoutDB}/${dbName}${queryParams}`;
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