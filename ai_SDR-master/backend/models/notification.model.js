import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["lead", "meeting", "email", "phone", "system", "warning", "success"],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        data: {
            type: Schema.Types.Mixed,
            default: {},
        },

        read: {
            type: Boolean,
            default: false,
            index: true,
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },

        expiresAt: {
            type: Date,
            default: null,
        },
    },
    { 
        timestamps: true,
        indexes: [
            { adminId: 1, read: 1 },
            { adminId: 1, createdAt: -1 },
            { type: 1, createdAt: -1 },
            { expiresAt: 1, expireAfterSeconds: 0 }
        ]
    }
);

// Index for automatic deletion of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins}m ago`;
    } else if (diffHours < 24) {
        return `${diffHours}h ago`;
    } else {
        return `${diffDays}d ago`;
    }
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export const NotificationModel = model("Notification", notificationSchema);

