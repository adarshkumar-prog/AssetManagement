exports.assetAssignmentToDTO = (assignment) => ({
   asset: assignment.assetId,
    assignedAt: assignment.assignedAt,
    status: assignment.status,
    unassignedAt: assignment?.unassignedAt,
    assignedTo: {
        firstName: assignment.assignedTo?.firstName,
        lastName: assignment.assignedTo?.lastName,
        email: assignment.assignedTo?.email
    }
});