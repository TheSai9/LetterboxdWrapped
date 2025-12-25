import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCSV } from '../services/csvParser';
import { processData } from '../services/statsService';
import { DiaryEntry, RatingEntry, ProcessedStats } from '../types';

interface FileUploadProps {
  onDataProcessed: (stats: ProcessedStats) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataProcessed }) => {
  const [diaryData, setDiaryData] = useState<DiaryEntry[]>([]);
  const [ratingsData, setRatingsData] = useState<RatingEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'diary' | 'ratings') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        if (type === 'diary') {
          const parsed = parseCSV<DiaryEntry>(text);
          if (!parsed[0]?.Date && !parsed[0]?.["Watched Date"]) {
             throw new Error("Invalid Diary CSV. Check format.");
          }
          setDiaryData(parsed);
        } else {
          const parsed = parseCSV<RatingEntry>(text);
          if (!parsed[0]?.Rating) {
             throw new Error("Invalid Ratings CSV. Check format.");
          }
          setRatingsData(parsed);
        }
        setError(null);
      } catch (err) {
        setError("Failed to parse file. Please ensure it is a valid Letterboxd export.");
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = () => {
    if (diaryData.length === 0) {
      setError("Please upload your diary.csv at minimum.");
      return;
    }
    const stats = processData(diaryData, ratingsData);
    if (stats) {
      onDataProcessed(stats);
    } else {
      setError("Could not process stats. Ensure your diary contains data for a recent year.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent cinematic-text">
            CineWrapped
          </h1>
          <p className="text-slate-400">
            Export your data from Letterboxd settings and upload the CSVs below to generate your cinematic year in review.
          </p>
        </div>

        <div className="space-y-6">
          {/* Diary Input */}
          <div className="group relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              1. Upload <code className="bg-slate-800 px-1 py-0.5 rounded text-orange-300">diary.csv</code> (Required)
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 transition-all ${diaryData.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/50'}`}>
              <div className="flex items-center justify-center gap-4">
                {diaryData.length > 0 ? <CheckCircle className="text-green-400 w-8 h-8" /> : <FileText className="text-slate-500 w-8 h-8" />}
                <div className="flex-1">
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, 'diary')}
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                    />
                </div>
              </div>
              {diaryData.length > 0 && <p className="text-xs text-green-400 mt-2 text-center">{diaryData.length} entries loaded</p>}
            </div>
          </div>

          {/* Ratings Input */}
          <div className="group relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              2. Upload <code className="bg-slate-800 px-1 py-0.5 rounded text-green-300">ratings.csv</code> (Optional)
            </label>
             <div className={`border-2 border-dashed rounded-xl p-6 transition-all ${ratingsData.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-green-500/50 hover:bg-slate-800/50'}`}>
              <div className="flex items-center justify-center gap-4">
                {ratingsData.length > 0 ? <CheckCircle className="text-green-400 w-8 h-8" /> : <FileText className="text-slate-500 w-8 h-8" />}
                <div className="flex-1">
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={(e) => handleFileChange(e, 'ratings')}
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                    />
                </div>
              </div>
               {ratingsData.length > 0 && <p className="text-xs text-green-400 mt-2 text-center">{ratingsData.length} ratings loaded</p>}
            </div>
          </div>
        </div>

        {error && (
            <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={diaryData.length === 0}
          className={`mt-8 w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${diaryData.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-900/50'}`}
        >
          Start The Show
        </button>
      </div>
    </div>
  );
};

export default FileUpload;