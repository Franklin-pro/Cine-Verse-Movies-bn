import Movie from "../models/Movie.model.js";

// 📌 Add a new movie
export const addMovie = async (req, res) => {
  try {
    const existingMovie = await Movie.findOne({ id: req.body.id });
    if (existingMovie) {
      return res.status(400).json({ message: "Movie already exists" });
    }

    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ message: "Movie added successfully", movie });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get all movies
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Get movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({ id: req.params.id });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Delete movie
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findOneAndDelete({ id: req.params.id });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📌 Update movie
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({ message: "Movie updated successfully", movie });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    const movies = await Movie.find({
      title: { $regex: query, $options: "i" },
    });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};