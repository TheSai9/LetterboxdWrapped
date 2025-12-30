
import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, AlertCircle, Square, Circle, Check, Calendar, Settings2, ChevronDown } from 'lucide-react';
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
  const [limitToReleaseYear, setLimitToReleaseYear] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
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

  // Extract available years from diary data
  const availableYears = useMemo(() => {
    if (diaryData.length === 0) return [];
    const years = new Set<number>();
    diaryData.forEach(entry => {
      const date = new Date(entry["Watched Date"]);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [diaryData]);

  // Auto-select the most recent year when data changes
  useEffect(() => {
    if (availableYears.length > 0) {
      // If current selection is invalid or null, set to latest
      if (selectedYear === null || !availableYears.includes(selectedYear)) {
         setSelectedYear(availableYears[0]);
      }
    }
  }, [availableYears, selectedYear]);

  const handleGenerate = async () => {
    if (diaryData.length === 0) {
      setError("Diary CSV is required.");
      return;
    }

    setError(null);

    try {
        // 1. Basic Processing only
        const basicStats = processData(diaryData, ratingsData, { 
            onlyReleasedInWatchedYear: limitToReleaseYear,
            year: selectedYear || undefined 
        });

        if (!basicStats) {
            throw new Error("Could not process stats. Check your data or adjust filters.");
        }

        // 2. Immediately pass data to parent. Enrichment happens in background.
        onDataProcessed(basicStats);

    } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred during processing.");
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-bauhaus-bg text-bauhaus-fg relative overflow-hidden">
      
      {/* Left Panel: Geometric Composition & Desktop Configuration */}
      <div className="hidden md:flex w-1/3 bg-bauhaus-blue border-r-4 border-bauhaus-black flex-col p-12 relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-12 -left-12 w-64 h-64 bg-bauhaus-red rounded-full border-4 border-bauhaus-black"></div>
        <div className="absolute bottom-24 -right-12 w-48 h-48 bg-bauhaus-yellow rotate-45 border-4 border-bauhaus-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10"
             style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

        <div className="relative z-10 mb-8">
          <div className="text-8xl font-black text-white leading-none tracking-tighter drop-shadow-[4px_4px_0px_black] mb-8">
            CINE
            <br />
            WRAPPED
          </div>
          <div className="text-white font-bold text-xl uppercase tracking-widest border-l-4 border-white pl-4">
            Letterboxd<br/>Year in Review
          </div>
        </div>

        {/* Configuration Section - Desktop Only (Moves here) */}
        <div className={`relative z-10 mt-auto transition-all duration-700 ease-out transform ${availableYears.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black uppercase text-bauhaus-blue text-lg mb-4 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                    <Settings2 size={20} /> Configuration
                </h3>
                
                {/* Year Selector */}
                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">Year to Analyze</label>
                    <div className="relative">
                        <select 
                            value={selectedYear || ""}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full border-2 border-black p-3 pr-10 font-black text-2xl bg-gray-50 hover:bg-white focus:bg-bauhaus-yellow focus:ring-0 outline-none appearance-none cursor-pointer transition-colors"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={24} strokeWidth={3} />
                    </div>
                </div>

                {/* Strict Mode Toggle */}
                <div 
                    className={`cursor-pointer border-2 border-black p-3 flex items-start gap-3 transition-colors select-none ${limitToReleaseYear ? 'bg-bauhaus-yellow' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => setLimitToReleaseYear(!limitToReleaseYear)}
                >
                    <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 bg-white transition-colors`}>
                        {limitToReleaseYear && <Check size={16} strokeWidth={4} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold uppercase text-sm leading-tight">Strict Mode</span>
                        <span className="text-[10px] font-bold uppercase text-gray-500 leading-tight">Released in {selectedYear || "Target Year"} Only</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex-1 flex flex-col justify-start md:justify-center items-center p-8 md:p-16 relative overflow-y-auto custom-scrollbar">
         {/* Mobile Header */}
         <div className="md:hidden w-full mb-8 border-b-4 border-bauhaus-black pb-8 shrink-0">
            <h1 className="text-6xl font-black text-bauhaus-fg tracking-tighter">CINE<br/>WRAPPED</h1>
         </div>

         <div className="w-full max-w-lg space-y-8 pb-12">
            <p className="font-medium text-lg border-l-4 border-bauhaus-red pl-4">
              Construct your viewing history. Upload your Letterboxd data to generate a geometric analysis of your year.
            </p>

            {/* Mobile-Only Configuration (Since left panel is hidden on mobile) */}
            <div className={`md:hidden transition-all duration-700 ease-in-out overflow-hidden ${availableYears.length > 0 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white border-2 border-bauhaus-black p-4 mb-6 shadow-hard-sm">
                    <div className="flex items-center gap-2 mb-3 border-b-2 border-gray-100 pb-2">
                        <Settings2 size={18} /> 
                        <span className="font-black uppercase text-sm">Configuration</span>
                    </div>
                     <div className="space-y-3">
                        {/* Mobile Year Selector */}
                         <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-500">Year</label>
                            <div className="relative">
                                <select 
                                    value={selectedYear || ""}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="w-full border-2 border-black p-2 font-black text-lg bg-gray-50 outline-none appearance-none"
                                >
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                            </div>
                        </div>
                        {/* Mobile Filter Toggle */}
                        <div 
                            className={`cursor-pointer border-2 border-black p-3 flex items-center gap-3 transition-colors ${limitToReleaseYear ? 'bg-bauhaus-yellow' : 'bg-gray-50'}`}
                            onClick={() => setLimitToReleaseYear(!limitToReleaseYear)}
                        >
                            <div className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 bg-white`}>
                                {limitToReleaseYear && <Check size={14} strokeWidth={3} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold uppercase text-xs leading-tight">Strict Mode (Released Only)</span>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Step 1: File Uploads */}
            <div className="space-y-6">
              
              {/* Diary Input */}
              <div className="relative group">
                 <div className="absolute -inset-1 bg-bauhaus-black translate-x-2 translate-y-2 rounded-none"></div>
                 <div className={`relative bg-white border-2 border-bauhaus-black p-6 transition-transform group-hover:-translate-y-1 ${diaryData.length > 0 ? 'bg-green-50' : ''}`}>
                    <label className="flex flex-col cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xl uppercase">1. Diary.csv</span>
                        {diaryData.length > 0 ? <CheckCircle className="text-bauhaus-black w-6 h-6" /> : <Square className="text-bauhaus-black w-6 h-6" />}
                      </div>
                      <span className="text-sm font-medium text-gray-600 mb-4">Required. Your log of watched films.</span>
                      <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'diary')} className="hidden" />
                      <div className="bg-bauhaus-black text-white text-center py-2 font-bold uppercase hover:bg-bauhaus-red transition-colors">
                        {diaryData.length > 0 ? "File Selected" : "Select File"}
                      </div>
                    </label>
                 </div>
              </div>

              {/* Ratings Input */}
              <div className="relative group">
                 <div className="absolute -inset-1 bg-bauhaus-black translate-x-2 translate-y-2 rounded-none"></div>
                 <div className={`relative bg-white border-2 border-bauhaus-black p-6 transition-transform group-hover:-translate-y-1 ${ratingsData.length > 0 ? 'bg-green-50' : ''}`}>
                    <label className="flex flex-col cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xl uppercase">2. Ratings.csv</span>
                         {ratingsData.length > 0 ? <CheckCircle className="text-bauhaus-black w-6 h-6" /> : <Circle className="text-bauhaus-black w-6 h-6" />}
                      </div>
                      <span className="text-sm font-medium text-gray-600 mb-4">Optional. For ratings distribution.</span>
                      <input type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'ratings')} className="hidden" />
                      <div className="bg-bauhaus-black text-white text-center py-2 font-bold uppercase hover:bg-bauhaus-blue transition-colors">
                         {ratingsData.length > 0 ? "File Selected" : "Select File"}
                      </div>
                    </label>
                 </div>
              </div>
            </div>

            {error && (
              <div className="bg-bauhaus-red text-white p-4 border-2 border-bauhaus-black shadow-hard-sm flex items-center gap-3 font-bold animate-pulse">
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
                  : 'bg-bauhaus-black text-white hover:bg-bauhaus-red hover:-translate-y-1 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none'
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
