
import { TMDB_API_KEY } from '../config';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getMoviePoster = async (title: string, year: string): Promise<string | null> => {
  const apiKey = TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const searchUrl = `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;
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

interface TMDBMovieDetail {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  credits: {
    cast: { id: number; name: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; profile_path: string | null }[];
  };
}

const getMovieDetails = async (title: string, year: string): Promise<TMDBMovieDetail | null> => {
  const apiKey = TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    // 1. Search to get ID
    const searchUrl = `${BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) return null;
    const movieId = searchData.results[0].id;

    // 2. Get Details with Append to Response for Credits
    const detailUrl = `${BASE_URL}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    return detailData as TMDBMovieDetail;
  } catch (error) {
    return null;
  }
};

export interface EnrichedDataUpdate {
    topActors: { name: string; count: number; image?: string }[];
    topDirectors: { name: string; count: number; image?: string }[];
    topGenres: { name: string; count: number }[];
    processedCount: number;
    totalCount: number;
}

/**
 * Streams enriched data for all films.
 * Processes in small batches to respect TMDB rate limits (approx 40 req/s max, we stay safer).
 * Invokes onUpdate callback after every batch.
 */
export const streamEnrichedData = async (
  films: { title: string; year: string }[], 
  onUpdate: (data: EnrichedDataUpdate) => void,
  shouldStop: () => boolean // Callback to check if we should abort (e.g. unmount)
) => {
  const actorCounts: Record<string, { count: number; image: string | null }> = {};
  const directorCounts: Record<string, { count: number; image: string | null }> = {};
  const genreCounts: Record<string, number> = {};
  
  // Batch Size 5. 
  // Each film = ~2 calls. 5 films = ~10 calls.
  // Delay 500ms. = ~20 calls/sec. Safe.
  const BATCH_SIZE = 5;
  const DELAY_MS = 500;

  let processed = 0;
  
  for (let i = 0; i < films.length; i += BATCH_SIZE) {
    if (shouldStop()) break;

    const chunk = films.slice(i, i + BATCH_SIZE);
    
    // Fetch chunk in parallel
    const promises = chunk.map(film => getMovieDetails(film.title, film.year));
    const results = await Promise.all(promises);

    results.forEach(details => {
      if (details) {
        // Aggregate Genres
        details.genres.forEach(g => {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        });

        // Aggregate Actors (Limit to top 10 billed to capture ensemble, but avoid extras)
        details.credits.cast.slice(0, 10).forEach(actor => {
          if (!actorCounts[actor.name]) {
            actorCounts[actor.name] = { count: 0, image: actor.profile_path };
          }
          actorCounts[actor.name].count++;
        });

        // Aggregate Directors
        details.credits.crew.forEach(member => {
            if (member.job === 'Director') {
                if (!directorCounts[member.name]) {
                    directorCounts[member.name] = { count: 0, image: member.profile_path };
                }
                directorCounts[member.name].count++;
            }
        });
      }
    });

    processed += chunk.length;

    // Calculate Top X arrays for the update
    const topActors = Object.entries(actorCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5) // Top 5
        .map(([name, data]) => ({ 
            name, 
            count: data.count, 
            image: data.image ? `${IMAGE_BASE_URL}${data.image}` : undefined 
        }));

    const topDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, data]) => ({ 
            name, 
            count: data.count, 
            image: data.image ? `${IMAGE_BASE_URL}${data.image}` : undefined 
        }));

    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8) // Top 8
        .map(([name, count]) => ({ name, count }));

    onUpdate({
        topActors,
        topDirectors,
        topGenres,
        processedCount: processed,
        totalCount: films.length
    });

    // Rate Limit Delay
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
};
