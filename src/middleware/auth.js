const jwt = require('jsonwebtoken');
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        // if (!authHeader || !authHeader.startsWith('Bearer')) {
        //     throw new Error("Unauthorized: No token provided");
        // }
        let token = authHeader?split(' ')[1]:undefined;
        if ( req.query && req.query.token ) {
            token = req.query.token;
        }
        console.log("Token: ", token);
        if(!token) {
            throw new Error("Unauthorized");
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
        res.status(400).json({ success: false, error: true + " , " + e.message});
    }
}

module.exports = {
    userAuth
};