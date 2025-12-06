const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();
const connectDB=async()=>{
    const uri=process.env.MONGO_URI;
      if (!uri) throw new Error('MONGO_URI not set in .env');

   mongoose.connect(uri).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
};
   
module.exports=connectDB;

