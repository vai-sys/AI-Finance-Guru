const express=require("express");
const dotenv=require("dotenv");
const connectDB=require("./config/db.js");

const authRoutes=require("./routes/authRoutes.js");
const categoryRoutes=require("./routes/categoryRoutes.js");
const transactionRoutes=require("./routes/transactionRoutes.js");
const importsRouter=require("./routes/importRoutes.js")

const app=express();
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
dotenv.config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.use(express.json());

connectDB();

app.get("/",(req,res)=>{
    return res.json("Hii there!!!")
})

app.use("/api/user",authRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/transaction",transactionRoutes);
app.use('/api/imports', importsRouter);

app.listen(process.env.PORT,()=>{
    console.log("Server is running on Port",process.env.PORT);
})



