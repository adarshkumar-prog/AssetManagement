const User = require("../models/user");
const { validateUpdateProfileData } = require("../utils/validation");

updateUser = async (req, res) => {
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

        res.status(200).json({ message: `${loggedInUser.firstName} ${loggedInUser.lastName} your profile updated successfully` });

    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
}

getUserById = async (req, res) => {
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
            "message":"User fetched successfully",
            "user": user
        });
    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
}

getAllUsers = async (req, res) => {
    try{
        const userWantsToView = req.user;
        if(userWantsToView.role !== "admin"){
            throw new Error("Only admin can view all users");
        }
        const users = await User.find({});
        users.forEach(user => {
            user.password = undefined; // Hide password from response
        });
        res.status(200).json(users);
    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
}

deleteUser = async (req, res) => {
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
            "message":"User deleted successfully"
        });
    }catch(e){
        res.status(400).json({ message: "Something went wrong", error: e.message });
    }
}

module.exports = {
    updateUser,
    getUserById,
    getAllUsers,
    deleteUser
};