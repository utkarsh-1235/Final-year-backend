const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI).then((conn)=>{
      console.log(`database connected successfully ${conn.connection.host}`)});
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
