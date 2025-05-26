const mongoose = require("mongoose");

const WatchListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        animeId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        imageUrl: String,
        status: {
          type: String,
          enum: [
            "plan_to_watch",
            "watching",
            "completed",
            "on_hold",
            "dropped",
          ],
          default: "plan_to_watch",
        },
        totalEpisodes: Number,
        episodesWatched: {
          type: Number,
          default: 0,
        },
        rating: {
          type: Number,
          min: 0,
          max: 10,
          default: 0,
        },
        notes: String,
        startDate: Date,
        finishDate: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WatchList", WatchListSchema);
