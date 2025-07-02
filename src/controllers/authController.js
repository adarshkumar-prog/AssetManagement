const User = require("../models/user");
const { validateSignUpData } = require("../middleware/validation");
const { sendEmail } = require("../utils/sendEmail");
const bcrypt = require('bcrypt');
const { userToDTO } = require("../dto/user.dto");

exports.register = async (req, res) => {

    try{
        //Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, email, password, department, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({firstName, lastName, email, role, department, password: passwordHash, verificationCode: null, verificationCodeExpires: null});
       
        await user.save();

        await sendEmail({
            to: email,
            subject: "Welcome to Asset Management System",
            text: "You have successfully registered with Asset Management System"
        });

        res.status(201).json({
            success: true,
            error: false,
            "message":"User registered successfully"
        });
    }catch(e){
        if (e.code === 11000) {
            res.status(400).json({ success: false, error: true, message: "Email already exists" });
        } else {
            res.status(400).json({ success: false, error: true, message: e.message });
        }
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email : email});

        if(!user){
            throw new Error("User not found");
        }

        const isPasswordValid = await user.ValidatePassword(password);
        
        if(!isPasswordValid){
            throw new Error("Invalid password");
        }
        else {
            user.password = undefined;
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            const token = await user.getJWT();
            res.status(200).json({ 
    success: true,
    error: false,
    message: "Login Successful", 
    token,
    user: userToDTO(user) 
});

        }
    }catch(err) {
        res.status(400).json({ success: false, error: true + " , " + err.message, message: "Something went wrong" });
    }
}