import React, { useEffect, useState } from 'react';
import StylePanel from './components/StylePanel';
import ComicViewer from './components/ComicViewer';
import ChatPanel from './components/ChatPanel';
import { comicDatasets, defaultDatasetId, initialStylePresets } from './mockData';
import './index.css';
import './App.css';

const createPresetId = (title) =>
  `${title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'preset'}-${Date.now()}`;

function App() {
  const [activePage, setActivePage] = useState(1);
  const [presets, setPresets] = useState(() => initialStylePresets.map((preset) => ({ ...preset })));
  const [activePreset, setActivePreset] = useState(initialStylePresets[0]?.id ?? '');
  const [resolution, setResolution] = useState('2k');
  const [referenceText, setReferenceText] = useState('');
  const [activeDatasetId, setActiveDatasetId] = useState(defaultDatasetId);

  const activeDataset =
    comicDatasets.find((dataset) => dataset.id === activeDatasetId) ?? comicDatasets[0];

  useEffect(() => {
    if (!activeDataset) {
      return;
    }

    if (activePage > activeDataset.pages.length) {
      setActivePage(1);
    }
  }, [activeDataset, activePage]);

  if (!activeDataset) {
    return <div className="app-container">No local comic datasets found in `src/tests`.</div>;
  }

  const handleCreatePreset = (presetInput) => {
    const nextPreset = {
      id: createPresetId(presetInput.title),
      ...presetInput,
    };

    setPresets((currentPresets) => [...currentPresets, nextPreset]);
    setActivePreset(nextPreset.id);
  };

  const handleUpdatePreset = (presetId, presetInput) => {
    setPresets((currentPresets) =>
      currentPresets.map((preset) =>
        preset.id === presetId ? { ...preset, ...presetInput } : preset
      )
    );
  };

  const handleGenerate = () => {
    const selectedPreset = presets.find((preset) => preset.id === activePreset) ?? null;

    console.info('Generate request', {
      preset: selectedPreset,
      resolution,
      referenceText,
      referenceImage: activeDataset.coverImage,
    });
  };

  return (
    <div className="app-container">
      <main className="main-layout">
        <StylePanel
          presets={presets}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
          onCreatePreset={handleCreatePreset}
          onUpdatePreset={handleUpdatePreset}
          resolution={resolution}
          setResolution={setResolution}
          referenceText={referenceText}
          setReferenceText={setReferenceText}
          onGenerate={handleGenerate}
          activeDataset={activeDataset}
        />
        <ComicViewer
          activePage={activePage}
          setActivePage={setActivePage}
          activeDataset={activeDataset}
          datasets={comicDatasets}
          setActiveDatasetId={setActiveDatasetId}
        />
        <ChatPanel activeDataset={activeDataset} activePage={activePage} />
      </main>
    </div>
  );
}

export default App;
