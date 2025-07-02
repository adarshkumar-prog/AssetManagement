exports.assetToDTO = (asset) => ({
    id: asset._id,
    name: asset.name,
    serialNumber: asset.serialNumber,
    status: asset.status,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt
});