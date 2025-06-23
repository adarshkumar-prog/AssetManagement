const jwt = require('jsonwebtoken');
const User = require("../models/user");

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

module.exports = {
    userAuth
};