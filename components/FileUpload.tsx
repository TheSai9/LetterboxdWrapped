
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Square, Circle } from 'lucide-react';
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
             throw new Error("Invalid Diary CSV.");
          }
          setDiaryData(parsed);
        } else {
          const parsed = parseCSV<RatingEntry>(text);
          if (!parsed[0]?.Rating) {
             throw new Error("Invalid Ratings CSV.");
          }
          setRatingsData(parsed);
        }
        setError(null);
      } catch (err) {
        setError("Failed to parse file. Ensure it is a valid Letterboxd export.");
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (diaryData.length === 0) {
      setError("Diary CSV is required.");
      return;
    }

    setError(null);

    try {
        // 1. Basic Processing only
        const basicStats = processData(diaryData, ratingsData);
        if (!basicStats) {
            throw new Error("Could not process stats. Check your data.");
        }

        // 2. Immediately pass data to parent. Enrichment happens in background.
        onDataProcessed(basicStats);

    } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred during processing.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bauhaus-bg text-bauhaus-fg relative overflow-hidden">
      
      {/* Left Panel: Geometric Composition */}
      <div className="hidden md:flex w-1/3 bg-bauhaus-blue border-r-4 border-bauhaus-black flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-12 -left-12 w-64 h-64 bg-bauhaus-red rounded-full border-4 border-bauhaus-black"></div>
        <div className="absolute bottom-24 -right-12 w-48 h-48 bg-bauhaus-yellow rotate-45 border-4 border-bauhaus-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10"
             style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

        <div className="relative z-10">
          <div className="text-8xl font-black text-white leading-none tracking-tighter drop-shadow-[4px_4px_0px_black]">
            CINE
            <br />
            WRAP
            <br />
            PED
          </div>
        </div>
        
        <div className="relative z-10 text-white font-bold text-xl uppercase tracking-widest border-l-4 border-white pl-4">
          Letterboxd<br/>Year in Review
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 relative">
         {/* Mobile Header */}
         <div className="md:hidden w-full mb-12 border-b-4 border-bauhaus-black pb-8">
            <h1 className="text-6xl font-black text-bauhaus-fg tracking-tighter">CINE<br/>WRAPPED</h1>
         </div>

         <div className="w-full max-w-lg space-y-8">
            <p className="font-medium text-lg border-l-4 border-bauhaus-red pl-4">
              Construct your viewing history. Upload your Letterboxd data to generate a geometric analysis of your year.
            </p>

            {/* Inputs */}
            <div className="space-y-6">
              
              {/* Diary Input */}
              <div className="relative group">
                 <div className="absolute -inset-1 bg-bauhaus-black translate-x-2 translate-y-2 rounded-none"></div>
                 <div className={`relative bg-white border-2 border-bauhaus-black p-6 transition-transform group-hover:-translate-y-1 ${diaryData.length > 0 ? 'bg-green-100' : ''}`}>
                    <label className="flex flex-col cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xl uppercase">1. Diary.csv</span>
                        {diaryData.length > 0 ? <CheckCircle className="text-bauhaus-black w-6 h-6" /> : <Square className="text-bauhaus-black w-6 h-6" />}
                      </div>
                      <span className="text-sm font-medium text-gray-600 mb-4">Required. Your log of watched films.</span>
                      <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'diary')} className="hidden" />
                      <div className="bg-bauhaus-black text-white text-center py-2 font-bold uppercase hover:bg-bauhaus-red transition-colors">
                        Select File
                      </div>
                    </label>
                 </div>
              </div>

              {/* Ratings Input */}
              <div className="relative group">
                 <div className="absolute -inset-1 bg-bauhaus-black translate-x-2 translate-y-2 rounded-none"></div>
                 <div className={`relative bg-white border-2 border-bauhaus-black p-6 transition-transform group-hover:-translate-y-1 ${ratingsData.length > 0 ? 'bg-green-100' : ''}`}>
                    <label className="flex flex-col cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xl uppercase">2. Ratings.csv</span>
                         {ratingsData.length > 0 ? <CheckCircle className="text-bauhaus-black w-6 h-6" /> : <Circle className="text-bauhaus-black w-6 h-6" />}
                      </div>
                      <span className="text-sm font-medium text-gray-600 mb-4">Optional. For ratings distribution.</span>
                      <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'ratings')} className="hidden" />
                      <div className="bg-bauhaus-black text-white text-center py-2 font-bold uppercase hover:bg-bauhaus-blue transition-colors">
                        Select File
                      </div>
                    </label>
                 </div>
              </div>

            </div>

            {error && (
              <div className="bg-bauhaus-red text-white p-4 border-2 border-bauhaus-black shadow-hard-sm flex items-center gap-3 font-bold">
                 <AlertCircle className="w-6 h-6" />
                 {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={diaryData.length === 0}
              className={`w-full py-5 text-xl font-black uppercase tracking-widest border-2 border-bauhaus-black shadow-hard-md transition-all
                ${diaryData.length === 0
                  ? 'bg-bauhaus-muted text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-bauhaus-yellow text-bauhaus-black hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
            >
              Construct Analysis
            </button>
         </div>
      </div>
    </div>
  );
};

export default FileUpload;
