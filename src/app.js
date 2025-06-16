const express = require('express');
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');



const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

app.post("/signup", async (req, res) => {

    try{
        //Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, email, currentAddress, permanentAddress, pinCodeCurrent, pinCodePermanent, role, skills, password } = req.body;
        
        const passwordHash = await bcrypt.hash(password, 10);
        // push skills into an array
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        

        // Creating a new instance of User model
        // and saving it to the database
        const user = new User({firstName, lastName, email, currentAddress, permanentAddress, pinCodeCurrent, pinCodePermanent, role, skills: skillsArray, password: passwordHash});
        
        await user.save();
        res.status(201).send({
            "message":"User created successfully"
        });
    }catch(e){
        if (e.code === 11000) {
            // Duplicate key error
            res.status(400).send("Email already exists");
        } else {
            res.status(400).send(e.message);
        }
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email : email});

        if(!user){
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid){
            throw new Error("Invalid password");
        }
        else {
            const token = await jwt.sign({_id : user._id }, "ASSET_MANAGEMENT_SECRET");
            res.cookie("token", token);
            res.status(200).send("Login successful" + user);
        }
    }catch(err) {
        res.status(400).send("Something went wrong " + err.message);
    }
})

app.get("/profile",async (req, res) => {
    try{
        const cookies = req.cookies;
    const { token } = cookies;
    if(!token) {
        throw new Error("Invalid token");
    }
    const decodedMessage = jwt.verify(token, "ASSET_MANAGEMENT_SECRET");
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if(!user) {
        throw new Error("User not found");
    }
    res.status(200).send({
        "message": "User profile fetched successfully",
        "user": user
    });
    }catch(e){
        res.status(400).send("Something went wrong " + e.message);
    }
})

app.get("/user", async (req, res) => {
    const userEmail = req.body.email;
    try{
        const user = await User.find({email : userEmail});
        if(user.length === 0){
            return res.status(404).send("User not found");
        }else {
            res.status(200).send(user);
        }
    }catch(e){
        res.status(400).send("Something went wrong");
    }
})

app.get("/feed", async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).send(users);
    }catch(e){
        res.status(400).send(e.message);
    }
})

app.delete("/user", async (req, res) => {
    const userId = req.body._id;
    try{
        const user = await User.findByIdAndDelete(userId);
        if(!user){
            return res.status(404).send("User not found");
        }
        res.status(200).send({
            "message":"User deleted successfully"});
    }catch(e){
        res.status(400).send("Something went wrong");
    }
});

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    const data = req.body;
    
    try{
        const ALLOWED_UPDATES = [
            "age", 
            "currentAddress", 
            "pinCodeCurrent", 
            "role", 
            "skills"
        ];
        // Check if the updates are allowed
        const isUpdateAllowed = Object.keys(data).every((update) => 
            ALLOWED_UPDATES.includes(update));
    if(!isUpdateAllowed){
        throw new Error("Invalid update fields");
    }
    if(data.skills.length > 8) {
        throw new Error("Skills cannot exceed 8 items");
    }
        const updatedUser = await User.findByIdAndUpdate({_id :userId}, data, {
            returnDocument: "after", new: true, runValidators: true });
        res.status(200).send({"message":"User updated successfully", "user": updatedUser});
    }catch(e){
        res.status(400).send("Something went wrong: " + e.message);
    }
})

connectDB()
.then(() => {
console.log("Database connected");
app.listen(port, () => console.log(`Listening on port ${port}`));}
)
.catch((err) => console.error("database Connection Error", err) 
);