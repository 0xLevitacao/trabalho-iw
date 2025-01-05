import React, { useState, useEffect } from "react";
import "./MovieDisplay.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const MovieDisplay = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }
        return response.json();
      })
      .then((data) => {
        setMovies(data.movies || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading movies:", error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const getUniqueGenres = () => {
    const genres = new Set();
    movies.forEach((movie) => {
      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre.forEach((genre) => genres.add(genre));
      }
    });

    const sortedGenres = Array.from(genres).sort();
    return ["All", ...sortedGenres];
  };

  const allGenres = getUniqueGenres();

  const filteredMovies = movies.filter((movie) => {
    if (!movie) return false;

    const matchesSearch =
      (movie.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movie.director || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === "All" ||
      (movie.genre &&
        Array.isArray(movie.genre) &&
        movie.genre.includes(selectedGenre));

    return matchesSearch && matchesGenre;
  });

  if (isLoading) {
    return (
      <div className="container py-4 bg-dark text-light">
        <div className="text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4 bg-dark text-light">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 bg-dark text-light">
      <div className="row mb-5">
        <div className="col">
          <h1 className="text-center">Movies DB</h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control bg-dark text-light"
            placeholder="Search movies by title or director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select bg-dark text-light"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {allGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="col"
            onClick={() => setSelectedMovie(movie)}
          >
            <div className="card h-100 bg-dark text-light border-0 shadow-sm movie-card">
              {movie.image && (
                <img
                  src={movie.image}
                  className="card-img-top"
                  alt={`${movie.title} poster`}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    backgroundColor: "#212529",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-movie.jpg";
                  }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">
                  {movie.title} ({movie.year})
                </h5>
                <h6 className="card-subtitle mb-2 text-light opacity-75">
                  Directed by {movie.director}
                </h6>
                <div className="mb-2">
                  {movie.genre &&
                    movie.genre.map((genre) => (
                      <span key={genre} className="badge bg-primary me-1">
                        {genre}
                      </span>
                    ))}
                </div>
                <p className="card-text">
                  <strong>Rating:</strong> {movie.rating}/10
                  <br />
                  <strong>Runtime:</strong> {movie.runtime} minutes
                  <br />
                  <strong>Language:</strong> {movie.language}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="alert bg-dark text-white text-center border border-secondary">
          <h4 className="alert-heading mb-0">No movies found.</h4>
        </div>
      )}

      {selectedMovie && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedMovie(null);
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">{selectedMovie.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => setSelectedMovie(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <img
                      src={selectedMovie.image}
                      className="img-fluid rounded"
                      alt={`${selectedMovie.title} poster`}
                    />
                  </div>
                  <div className="col-md-6 d-flex flex-column justify-content-center synopsis-container">
                    <p>{selectedMovie.synopsis}</p>
                    <div className="mt-3">
                      <p><strong>Director:</strong> {selectedMovie.director}</p>
                      <p><strong>Year:</strong> {selectedMovie.year}</p>
                      <p><strong>Rating:</strong> {selectedMovie.rating}/10</p>
                      <p><strong>Runtime:</strong> {selectedMovie.runtime} minutes</p>
                      <p><strong>Language:</strong> {selectedMovie.language}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDisplay;