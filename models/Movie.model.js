import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    original_title: String,
    overview: String,
    release_date: String,
    poster_path: String,
    backdrop_path: String,
    popularity: Number,
    vote_average: Number,
    vote_count: Number,
    adult: {
      type: Boolean,
      default: false,
    },
    video: {
      type: Boolean,
      default: false,
    },
    genre_ids: [Number],
    original_language: String,
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
