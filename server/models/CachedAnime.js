const mongoose = require("mongoose");

const CachedAnimeSchema = new mongoose.Schema(
  {
    queryType: {
      type: String,
      required: true,
      enum: [
        "top_anime",
        "top_airing",
        "top_upcoming",
        "top_tv_series",
        "top_movies",
        "top_ova",
        "top_ona",
        "top_special",
        "most_popular",
        "most_favorited",
        "anime_season",
        "anime_schedule",
        "anime_search",
        "anime_details",
        "character_details",
        "person_details",
      ],
    },
    queryParams: {
      type: Object,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatically expire after 24 hours
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for efficient querying
CachedAnimeSchema.index({ queryType: 1, "queryParams.page": 1 });

module.exports = mongoose.model("CachedAnime", CachedAnimeSchema);
