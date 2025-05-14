const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tag: { type: String, required: true },
    endDate: { type: Date, required: true },
    visibleTo: [
        {
            type: String,
            enum: [
                "student",
                "teaching_staff",
                "non_teaching_staff",
                "hod",
                "principal",
            ],
        },
    ],
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
    "Announcement",
    announcementSchema,
    "announcements"
);