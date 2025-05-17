const { MongoClient } = require("mongodb");

const uri = "mongodb://root:example@mongo:27017/ecommerce-db"; // Change this to your MongoDB URI
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.close();
  }
}

testConnection();