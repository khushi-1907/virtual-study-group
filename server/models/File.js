const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String },
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);
