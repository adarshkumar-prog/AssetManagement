const express = require('express');
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require('bcrypt');
const User = require("../models/user");
const authRouter = express.Router();

authRouter.post("/api/auth/register", async (req, res) => {

    try{
        //Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, email, role, department, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        // Creating a new instance of User model
        // and saving it to the database
        const user = new User({firstName, lastName, email, role, department, password: passwordHash});
       
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

authRouter.post("/api/auth/login", async (req, res) => {
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
            const token = await user.getJWT();
            res.cookie("token", token, {
                expires: new Date(Date.now() + 3600000), // 1 hour
            });
            res.status(200).send("Login successful" + user);
        }
    }catch(err) {
        res.status(400).send("Something went wrong " + err.message);
    }
})

authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    }).send("Logout successful");
})

module.exports = authRouter;