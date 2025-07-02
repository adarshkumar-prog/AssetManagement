const validator = require('validator');
const Asset = require("../models/asset");

const validateSignUpData = (req) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new Error("All fields are required");
    }
    else if(firstName.length < 4 || firstName.length > 50) {
      throw new Error("First name must be between 4 and 50 characters");
    }
    else if(lastName.length < 4 || lastName.length > 50) {
      throw new Error("Last name must be between 4 and 50 characters");
    }
    else if(!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }
    else if(!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }
}
const validateUpdateProfileData = (req) => {
    try{
      const ALLOWED_UPDATES = [
        "firstName",
        "lastName",
        "email",
        "department"
    ];
    
    // Check if the updates are allowed
    const isUpdateAllowed = Object.keys(req.body).every((update) => 
        ALLOWED_UPDATES.includes(update));
    
    if(!isUpdateAllowed){
        throw new Error("Invalid update fields");
    }
    return isUpdateAllowed;
    }catch(e){
        throw new Error(e.message);
    }
}
const validateAssetData = async function(req){
    const { name, serialNumber } = req.body;
    if (!name || !serialNumber) {
        throw new Error("Name and serialNumber are required.");
    }
    // Check for duplicate serial number
        const existingAsset = await Asset.findOne({ serialNumber });
        if (existingAsset) {
            throw new Error("Asset with this serial number already exists.");
        }
}

module.exports = {
    validateSignUpData,
    validateUpdateProfileData,
    validateAssetData
};