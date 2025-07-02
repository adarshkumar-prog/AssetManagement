exports.assetAssignmentToDTO = (assignment) => ({
    id: assignment._id,
    asset: assignment.asset,
    user: assignment.user,
    assignedAt: assignment.assignedAt,
    returnedAt: assignment.returnedAt,
    status: assignment.status
});