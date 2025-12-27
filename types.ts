
export interface DiaryEntry {
  Date: string; // "YYYY-MM-DD"
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string; // "3.5"
  Rewatch: string; // "Yes" or ""
  Tags: string;
  "Watched Date": string;
}

export interface RatingEntry {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string;
}

export interface DailyEntryDetail {
    name: string;
    year: string;
    rating: string;
    uri: string;
}

export interface SimpleMovie {
    title: string;
    year: string;
    rating?: string;
}

export interface EnrichedItem {
    name: string;
    count: number;
    image?: string;
    movies: SimpleMovie[];
}

export interface ProcessedStats {
  totalWatched: number;
  totalRuntimeHours: number; // Est
  topMonth: string;
  topDayOfWeek: string;
  averageRating: number;
  ratingDistribution: { rating: string; count: number; movies: SimpleMovie[] }[];
  monthlyDistribution: { month: string; count: number; movies: SimpleMovie[] }[];
  dailyActivity: { date: string; count: number }[];
  dailyEntries: Record<string, DailyEntryDetail[]>; 
  dayOfWeekDistribution: { day: string; count: number; movies: SimpleMovie[] }[];
  decadeDistribution: { decade: string; count: number; movies: SimpleMovie[] }[];
  rewatchCount: number;
  rewatchedFilms: SimpleMovie[]; // Added
  topRatedFilms: RatingEntry[]; // Top 5
  longestStreak: number;
  busiestDay: { date: string; count: number };
  firstFilm: string;
  lastFilm: string;
  uniqueFilmsCount: number;
  moviesPerWeekAvg: number;
  year: number; // The analysis year
  
  // The full list needed for background enrichment
  allFilms: SimpleMovie[];

  // New Enriched Data
  topActors?: EnrichedItem[];
  topDirectors?: EnrichedItem[];
  topGenres?: EnrichedItem[];
}

export interface PersonaResult {
    title: string;
    description: string;
}
