const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const checkAdminPassword = (req, res, next) => {
  const providedPassword = req.headers['admin-password'];
  
  if (!providedPassword || providedPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

const uri = process.env.MONGODB_URI;const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("moviesDB");
    const movies = database.collection("movies");

    // Existing endpoint to get all movies (Read)
    app.get('/api/movies', async (req, res) => {
      try {
        const documents = await movies.find({}).toArray();
        
        if (!documents || documents.length === 0) {
            console.log('No documents found');
            return res.json({ movies: [] });
        }
        
        res.json({ movies: documents[0].movies });
      } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Admin login endpoint
    app.post('/api/login', (req, res) => {
      const { password } = req.body;
      
      if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    });

    // Add new movie (Create)
    app.post('/api/movies', checkAdminPassword, async (req, res) => {
      try {
        const newMovie = req.body;
        const document = await movies.findOne({});
        
        // Get the current highest ID and increment by 1
        const currentMovies = document.movies || [];
        const maxId = Math.max(...currentMovies.map(m => m.id), -1);
        newMovie.id = maxId + 1;

        // Add the new movie to the array
        await movies.updateOne(
          { _id: document._id },
          { $push: { movies: newMovie } }
        );

        res.json({ success: true, movie: newMovie });
      } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Update existing movie (Update)
    app.put('/api/movies/:id', checkAdminPassword, async (req, res) => {
      try {
        const movieId = parseInt(req.params.id);
        const updatedMovie = req.body;
        updatedMovie.id = movieId; // Ensure ID doesn't change

        const document = await movies.findOne({});
        
        await movies.updateOne(
          { _id: document._id },
          { 
            $set: { 
              'movies.$[movie]': updatedMovie 
            }
          },
          {
            arrayFilters: [{ 'movie.id': movieId }]
          }
        );

        res.json({ success: true, movie: updatedMovie });
      } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Delete movie (Delete)
    app.delete('/api/movies/:id', checkAdminPassword, async (req, res) => {
      try {
        const movieId = parseInt(req.params.id);
        const document = await movies.findOne({});

        await movies.updateOne(
          { _id: document._id },
          { $pull: { movies: { id: movieId } } }
        );

        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });

  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

run().catch(console.dir);