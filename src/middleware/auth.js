const jwt = require('jsonwebtoken');
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try{
        const cookies = req.cookies;
    const { token } = cookies;
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
        res.status(400).send("ERROR " + e.message);
    }
}

module.exports = {
    userAuth
};