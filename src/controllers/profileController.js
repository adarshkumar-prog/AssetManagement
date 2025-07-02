const User = require("../models/user");
const { validateUpdateProfileData } = require("../middleware/validation");
const bcrypt = require('bcrypt');
const { sendEmailCode } = require("../utils/sendEmail");
const { userToDTO } = require("../dto/user.dto");

exports.updateUser = async (req, res) => {
    try{
        if(!validateUpdateProfileData(req)){
            throw new Error("Invalid update fields");
        }

        const loggedInUserId = req.params.id;
        const loggedInUser = await User.findById(loggedInUserId);
        if(!loggedInUser){
            throw new Error("User not found");
        }
        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
        await loggedInUser.save();

        res.status(200).json({ success: true, error: false, message: `${loggedInUser.firstName} ${loggedInUser.lastName} your profile updated successfully` });

    }catch(e){
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" });
    }
}

exports.getUserById = async (req, res) => {
    try{
        const userWantsToView = req.user;
        if(userWantsToView.role !== "admin"){
            throw new Error("Only admin can view user details");
        }
        const user = await User.findById(req.params.id);
        if(!user){
            throw new Error("User not found");
        }
        user.password = undefined;
        res.status(200).json({
            "success": true,
            "error": false,
            "message":"User fetched successfully",
            "user": userToDTO(user)
        });
    }catch(e){
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" });
    }
}

exports.getAllUsers = async (req, res) => {
    try{
        const userWantsToView = req.user;
        if(userWantsToView.role !== "admin"){
            throw new Error("Only admin can view all users");
        }
        const users = await User.find({});
        users.forEach(user => {
            user.password = undefined;
        });
        res.status(200).json({ success: true, error: false, count: users.length, message: "Users fetched successfully", users: users.map(user => userToDTO(user)) });
    }catch(e){
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        const isCurrentPasswordValid = await req.user.ValidatePassword(currentPassword);
        if(!isCurrentPasswordValid){
           throw new Error("Invalid current password");
        }
        if(newPassword !== confirmPassword){
          throw new Error("Passwords do not match");
        }
        req.user.password = await bcrypt.hash(newPassword, 10);;
    await req.user.save();
    res.status(200).json({ success: true, error: false, message: "Password changed successfully" });
    } catch (e) {
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" }); 
    }
}

exports.validateCodeAndResetPassword = async (req, res) => {
    try {
        const { email, verificationCode, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }
        if (
            !user.verificationCode ||
            user.verificationCode !== verificationCode ||
            !user.verificationCodeExpires ||
            user.verificationCodeExpires < Date.now()
        ) {
            throw new Error("Invalid or expired verification code");
        }
        if (newPassword !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();

        res.status(200).json({ success: true, error: false, message: "Password changed successfully" });
    } catch (e) {
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" });
    }
}

exports.sendVerificationCode = async ( req, res ) => {
    try{
        const userEmail = req.body.email;
        const user = await User.findOne({email: userEmail});
        if(!user){
            throw new Error("User not found");
        }
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await user.save();

        await sendEmailCode({
            to: user.email,
            subject: "Verification Code",
            text: `Your verification code is ${verificationCode}`
        });
        res.status(200).json({ success: true, error: false, message: "Verification code sent successfully" });
    }
    catch(e){
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" });
    }
}

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    const userWantsToDelete = req.user;
    try{
        if(userWantsToDelete.role !== "admin"){
        throw new Error("Only admin can delete users");
    }
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            throw new Error("User not found!!");
        }
        res.status(200).json({
            "success": true,
            "error": false,
            "message":"User deleted successfully",
            "user": userToDTO(user)
        });
    }catch(e){
        res.status(400).json({ success: false, error: true + " , " + e.message, message: "Something went wrong" });
    }
}