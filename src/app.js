const express = require('express');
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/signup", async (req, res) => {
    try{
        const user = new User(req.body);
        await user.save();
        res.status(201).send({
            "message":"User created successfully"
        })
    }catch(e){
        res.status(400).send(e.message);
    }
})



connectDB()
.then(() => {
console.log("Database connected");
app.listen(port, () => console.log(`Listening on port ${port}`));}
)
.catch((err) => console.log(err));