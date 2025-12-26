
const TMDB_API_KEY = '73cee11127b6d7ede74c4a190b48e2d0';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getMoviePoster = async (title: string, year: string): Promise<string | null> => {
  try {
    // Search for the movie
    const searchUrl = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0 && data.results[0].poster_path) {
      return `${IMAGE_BASE_URL}${data.results[0].poster_path}`;
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch poster for ${title}`, error);
    return null;
  }
};
