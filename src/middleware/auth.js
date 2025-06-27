const jwt = require('jsonwebtoken');
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require('bcrypt');

const userAuth = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error({ message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(' ')[1];
    if(!token) {
        throw new Error(" Unauthorized ");
    }
    const decodedObj = await jwt.verify(token, "ASSET_MANAGEMENT_SECRET" );
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
        throw new Error("Unauthorized: User not found");
    }
    req.user = user;

    next();
    }catch(e){
        res.status(400).json({ message: "ERROR", error: e.message });
    }
}

register = async (req, res) => {

    try{
        //Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, email, password, department, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        // Creating a new instance of User model
        // and saving it to the database
        const user = new User({firstName, lastName, email, role, department, password: passwordHash, assignedAssets: [], previouslyAssignedAssets: []});
       
        await user.save();
        res.status(201).json({
            "message":"User registered successfully"
        });
    }catch(e){
        if (e.code === 11000) {
            // Duplicate key error
            res.status(400).json({ message: "Email already exists" });
        } else {
            res.status(400).json({ message: e.message });
        }
    }
}

login = async (req, res) => {
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
            const token = await user.getJWT();
            res.status(200).json({ 
    message: "Login Successful", 
    token,
    user 
});

        }
    }catch(err) {
        res.status(400).json({ message: "Something went wrong", error: err.message });
    }
}

module.exports = {
    userAuth,
    register,
    login
};