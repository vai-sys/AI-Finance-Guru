const express=require("express");
const router=express.Router();

const { RegisterUser,
    LoginUser,
    getProfile,
    updateProfile ,logoutUser } =require("../controllers/authController.js");

const {auth}=require("../middlewares/authMiddleware.js");


router.post('/register',RegisterUser);
router.post('/login',LoginUser);
router.post('/logout',logoutUser);


router.get('/profile',auth,getProfile);
router.patch('/profile',auth,updateProfile);
module.exports=router;