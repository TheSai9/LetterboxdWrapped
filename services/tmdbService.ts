
import { TMDB_API_KEY } from '../config';
import { SimpleMovie, EnrichedItem } from '../types';

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
    topActors: EnrichedItem[];
    topDirectors: EnrichedItem[];
    topGenres: EnrichedItem[];
    processedCount: number;
    totalCount: number;
}

/**
 * Streams enriched data for all films.
 * Processes in small batches to respect TMDB rate limits.
 */
export const streamEnrichedData = async (
  films: SimpleMovie[], 
  onUpdate: (data: EnrichedDataUpdate) => void,
  shouldStop: () => boolean 
) => {
  const actorCounts: Record<string, { count: number; image: string | null; movies: SimpleMovie[] }> = {};
  const directorCounts: Record<string, { count: number; image: string | null; movies: SimpleMovie[] }> = {};
  const genreCounts: Record<string, { count: number; movies: SimpleMovie[] }> = {};
  
  const BATCH_SIZE = 5;
  const DELAY_MS = 500;

  let processed = 0;
  
  for (let i = 0; i < films.length; i += BATCH_SIZE) {
    if (shouldStop()) break;

    const chunk = films.slice(i, i + BATCH_SIZE);
    
    // Fetch chunk in parallel
    const promises = chunk.map(film => getMovieDetails(film.title, film.year).then(res => ({ detail: res, source: film })));
    const results = await Promise.all(promises);

    results.forEach(({ detail, source }) => {
      if (detail) {
        // Aggregate Genres
        detail.genres.forEach(g => {
          if (!genreCounts[g.name]) {
            genreCounts[g.name] = { count: 0, movies: [] };
          }
          genreCounts[g.name].count++;
          genreCounts[g.name].movies.push(source);
        });

        // Aggregate Actors (Limit to top 10 billed)
        detail.credits.cast.slice(0, 10).forEach(actor => {
          if (!actorCounts[actor.name]) {
            actorCounts[actor.name] = { count: 0, image: actor.profile_path, movies: [] };
          }
          actorCounts[actor.name].count++;
          actorCounts[actor.name].movies.push(source);
        });

        // Aggregate Directors
        detail.credits.crew.forEach(member => {
            if (member.job === 'Director') {
                if (!directorCounts[member.name]) {
                    directorCounts[member.name] = { count: 0, image: member.profile_path, movies: [] };
                }
                directorCounts[member.name].count++;
                directorCounts[member.name].movies.push(source);
            }
        });
      }
    });

    processed += chunk.length;

    // Calculate Top X arrays for the update
    const topActors = Object.entries(actorCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, data]) => ({ 
            name, 
            count: data.count, 
            image: data.image ? `${IMAGE_BASE_URL}${data.image}` : undefined,
            movies: data.movies
        }));

    const topDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, data]) => ({ 
            name, 
            count: data.count, 
            image: data.image ? `${IMAGE_BASE_URL}${data.image}` : undefined,
            movies: data.movies
        }));

    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8) 
        .map(([name, data]) => ({ 
            name, 
            count: data.count,
            movies: data.movies
        }));

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
