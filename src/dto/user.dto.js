exports.userToDTO = (user) => {
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};