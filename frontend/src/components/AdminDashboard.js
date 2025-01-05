import React, { useState, useEffect, useCallback, memo } from 'react';

// Memoized form component to prevent unnecessary re-renders
const MovieForm = memo(({ onSubmit, initialData, isEdit }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="text-light">
      <div className="mb-3">
        <input
          type="text"
          name="title"
          className="form-control bg-dark text-light"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="row mb-3">
        <div className="col">
          <input
            type="number"
            name="year"
            className="form-control bg-dark text-light"
            placeholder="Year"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col">
          <input
            type="text"
            name="director"
            className="form-control bg-dark text-light"
            placeholder="Director"
            value={formData.director}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <input
          type="text"
          name="genre"
          className="form-control bg-dark text-light"
          placeholder="Genres (comma-separated)"
          value={formData.genre}
          onChange={handleChange}
          required
        />
      </div>
      <div className="row mb-3">
        <div className="col">
          <input
            type="number"
            name="runtime"
            className="form-control bg-dark text-light"
            placeholder="Runtime (minutes)"
            value={formData.runtime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col">
          <input
            type="number"
            name="rating"
            step="0.1"
            className="form-control bg-dark text-light"
            placeholder="Rating"
            value={formData.rating}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <input
          type="text"
          name="language"
          className="form-control bg-dark text-light"
          placeholder="Language"
          value={formData.language}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          name="synopsis"
          className="form-control bg-dark text-light"
          placeholder="Synopsis"
          value={formData.synopsis}
          onChange={handleChange}
          required
          rows="3"
        />
      </div>
      <div className="mb-3">
        <input
          type="url"
          name="image"
          className="form-control bg-dark text-light"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {isEdit ? 'Update Movie' : 'Add Movie'}
      </button>
    </form>
  );
});

function AdminDashboard({ adminPassword }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const emptyFormData = {
    title: '',
    year: '',
    director: '',
    genre: '',
    runtime: '',
    rating: '',
    language: '',
    synopsis: '',
    image: ''
  };

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/movies');
      const data = await response.json();
      setMovies(data.movies || []);
      setIsLoading(false);
    } catch (error) {
      setError('Error fetching movies');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleDelete = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
          method: 'DELETE',
          headers: {
            'admin-password': adminPassword
          }
        });

        if (response.ok) {
          fetchMovies();
        } else {
          setError('Failed to delete movie');
        }
      } catch (error) {
        setError('Error deleting movie');
      }
    }
  };

  const handleSubmit = async (formData) => {
    const movieData = {
      ...formData,
      genre: formData.genre.split(',').map(g => g.trim()),
      year: parseInt(formData.year),
      runtime: parseInt(formData.runtime),
      rating: parseFloat(formData.rating)
    };

    try {
      const url = showEditModal 
        ? `http://localhost:5000/api/movies/${selectedMovie.id}`
        : 'http://localhost:5000/api/movies';
      
      const response = await fetch(url, {
        method: showEditModal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-password': adminPassword
        },
        body: JSON.stringify(movieData)
      });

      if (response.ok) {
        fetchMovies();
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedMovie(null);
      } else {
        setError('Failed to save movie');
      }
    } catch (error) {
      setError('Error saving movie');
    }
  };

  const handleEdit = (movie) => {
    setSelectedMovie(movie);
    setShowEditModal(true);
  };

  const getInitialFormData = () => {
    if (selectedMovie) {
      return {
        title: selectedMovie.title,
        year: selectedMovie.year.toString(),
        director: selectedMovie.director,
        genre: selectedMovie.genre.join(', '),
        runtime: selectedMovie.runtime.toString(),
        rating: selectedMovie.rating.toString(),
        language: selectedMovie.language,
        synopsis: selectedMovie.synopsis,
        image: selectedMovie.image
      };
    }
    return emptyFormData;
  };

  if (isLoading) {
    return <div className="text-light text-center">Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="text-light mb-4">Backoffice</h1>

      <div className="row mb-5">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control bg-dark text-light"
            placeholder="Search movies by title, director, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            Add New Movie
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Director</th>
              <th>Genre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.filter(movie => {
              const searchLower = searchTerm.toLowerCase();
              return movie.title.toLowerCase().includes(searchLower) ||
                     movie.director.toLowerCase().includes(searchLower) ||
                     movie.genre.some(g => g.toLowerCase().includes(searchLower));
            }).map((movie) => (
              <tr key={movie.id}>
                <td>{movie.title}</td>
                <td>{movie.year}</td>
                <td>{movie.director}</td>
                <td>{movie.genre.join(', ')}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(movie)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(movie.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-light">Add New Movie</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <div className="modal-body">
                <MovieForm 
                  onSubmit={handleSubmit}
                  initialData={emptyFormData}
                  isEdit={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showEditModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content bg-dark">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-light">Edit Movie</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMovie(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <MovieForm 
                  onSubmit={handleSubmit}
                  initialData={getInitialFormData()}
                  isEdit={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;