// backend/models/SanityLevel.js

const mongoose = require('mongoose');

const sanityLevelSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            //unique: true, // Ensures one entry per user
        },
        sanityPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Indexes for optimization
sanityLevelSchema.index({ user: 1 });
sanityLevelSchema.index({ sanityPercentage: -1 });

module.exports = mongoose.model('SanityLevel', sanityLevelSchema);
