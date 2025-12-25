import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import WrappedSlides from './components/WrappedSlides';
import { ProcessedStats } from './types';

const App: React.FC = () => {
  const [stats, setStats] = useState<ProcessedStats | null>(null);

  return (
    <div className="w-full h-screen bg-slate-950">
      {!stats ? (
        <FileUpload onDataProcessed={setStats} />
      ) : (
        <WrappedSlides stats={stats} onReset={() => setStats(null)} />
      )}
    </div>
  );
};

export default App;