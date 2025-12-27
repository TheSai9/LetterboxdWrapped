
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Star, X } from 'lucide-react';
import { SimpleMovie } from '../types';
import { getMoviePoster } from '../services/tmdbService';

interface MovieListPanelProps {
  title: string;
  movies: SimpleMovie[];
  onClose: () => void;
  className?: string;
}

const MovieListPanel: React.FC<MovieListPanelProps> = ({ title, movies, onClose, className = "" }) => {
  const [posters, setPosters] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPosters = async () => {
      const newPosters: Record<string, string> = {};
      // Fetch for first 10 to avoid slam, load rest if needed or pagination (keeping simple here)
      for (const movie of movies) {
        if (!posters[movie.title]) {
          const url = await getMoviePoster(movie.title, movie.year);
          if (url) newPosters[movie.title] = url;
        }
      }
      setPosters(prev => ({ ...prev, ...newPosters }));
    };

    fetchPosters();
  }, [movies]);

  return (
    <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`overflow-hidden ${className}`}
    >
        <div className="bg-bauhaus-bg border-t-4 border-bauhaus-black mt-2 p-4 relative">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-bauhaus-bg z-10 py-2 border-b-2 border-gray-200">
                <h4 className="font-black uppercase text-lg text-bauhaus-blue pr-8">
                    {title} <span className="text-black opacity-50 text-sm ml-2">({movies.length})</span>
                </h4>
                <button onClick={onClose} className="text-xs font-bold uppercase hover:text-bauhaus-red flex items-center gap-1">
                    <X size={14} /> Close
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {movies.map((movie, idx) => (
                    <div key={`${movie.title}-${idx}`} className="flex gap-4 bg-white p-2 border-2 border-bauhaus-black shadow-hard-sm hover:translate-x-1 transition-transform">
                        {/* Poster */}
                        <div className="w-12 h-16 bg-gray-200 border border-black flex-shrink-0">
                            {posters[movie.title] ? (
                                <img src={posters[movie.title]} alt={movie.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Film size={16} />
                                </div>
                            )}
                        </div>
                        {/* Info */}
                        <div className="flex flex-col justify-center">
                            <div className="font-bold text-sm uppercase leading-tight">{movie.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="text-xs bg-bauhaus-yellow px-1 border border-black font-bold">{movie.year}</div>
                                {movie.rating && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-bauhaus-blue">
                                        <Star size={10} fill="currentColor" />
                                        {movie.rating}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
  );
};

export default MovieListPanel;
