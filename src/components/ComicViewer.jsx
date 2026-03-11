import React, { useEffect, useRef, useState } from 'react';
import DrawingCanvas from './DrawingCanvas';
import ResearchNotesPanel from './ResearchNotesPanel';
import './ComicViewer.css';

const presetColors = ['#2057a6', '#d97b27', '#2e7d68', '#7b5ea7', '#ffffff', '#1f2933'];

const createNote = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  body: '',
  imageUrl: '',
});

const isTypingTarget = (target) => {
  const tagName = target?.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target?.isContentEditable;
};

const ComicViewer = ({
  activePage,
  setActivePage,
  activeDataset,
  datasets,
  setActiveDatasetId,
}) => {
  const [notesByPage, setNotesByPage] = useState({});
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#2057a6');
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [drawingTool, setDrawingTool] = useState('pen');
  const [viewMode, setViewMode] = useState('manga');
  const [pageTurnDirection, setPageTurnDirection] = useState('next');
  const canvasRef = useRef(null);

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const activePageData =
    activeDataset.pages.find((page) => page.page_number === activePage) ?? activeDataset.pages[0];

  const notesKey = `${activeDataset.id}-${activePage}`;
  const currentNotes = notesByPage[notesKey] ?? [];
  const sourceTextSections = activeDataset.sourceText
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

  const updateCurrentNotes = (updater) => {
    setNotesByPage((prev) => {
      const existingNotes = prev[notesKey] ?? [];
      return {
        ...prev,
        [notesKey]: updater(existingNotes),
      };
    });
  };

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > activeDataset.pages.length || pageNumber === activePage) {
      return;
    }

    setPageTurnDirection(pageNumber > activePage ? 'next' : 'prev');
    setActivePage(pageNumber);
  };

  const handlePreviousPage = () => {
    goToPage(activePage - 1);
  };

  const handleNextPage = () => {
    goToPage(activePage + 1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePreviousPage();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePage, activeDataset.pages.length]);

  const handleDatasetChange = (datasetId) => {
    setActiveDatasetId(datasetId);
    setPageTurnDirection('next');
    setActivePage(1);
  };

  const handleAddNote = () => {
    updateCurrentNotes((notes) => [...notes, createNote()]);
  };

  const handleDeleteNote = (noteId) => {
    updateCurrentNotes((notes) => notes.filter((note) => note.id !== noteId));
  };

  const handleUpdateNote = (noteId, patch) => {
    updateCurrentNotes((notes) =>
      notes.map((note) => (note.id === noteId ? { ...note, ...patch } : note))
    );
  };

  const renderMangaView = () => (
    <>
      <div className="canvas-header">
        <p className="viewer-kicker">Page {activePageData.page_number}</p>
        <div className="canvas-toolbar-inline">
          <div className="canvas-toolbar-group">
            <button
              className={`ct-btn ${isDrawingMode && drawingTool === 'pen' ? 'active' : ''}`}
              onClick={() => {
                setIsDrawingMode(true);
                setIsEraser(false);
                setDrawingTool('pen');
              }}
              title="Pen"
              type="button"
            >
              ✏️
            </button>
            <button
              className={`ct-btn ${isDrawingMode && drawingTool === 'eraser' ? 'active' : ''}`}
              onClick={() => {
                setIsDrawingMode(true);
                setIsEraser(true);
                setDrawingTool('eraser');
              }}
              title="Eraser"
              type="button"
            >
              🧽
            </button>
            <button
              className={`ct-btn ${isDrawingMode && drawingTool === 'rect' ? 'active' : ''}`}
              onClick={() => {
                setIsDrawingMode(true);
                setIsEraser(false);
                setDrawingTool('rect');
              }}
              title="Rectangle"
              type="button"
            >
              ▭
            </button>
            <button
              className={`ct-btn ${isDrawingMode && drawingTool === 'circle' ? 'active' : ''}`}
              onClick={() => {
                setIsDrawingMode(true);
                setIsEraser(false);
                setDrawingTool('circle');
              }}
              title="Circle"
              type="button"
            >
              ○
            </button>
            <button
              className={`ct-btn ${isDrawingMode && drawingTool === 'text' ? 'active' : ''}`}
              onClick={() => {
                setIsDrawingMode(true);
                setIsEraser(false);
                setDrawingTool('text');
              }}
              title="Text"
              type="button"
            >
              T
            </button>
            <button
              className={`ct-btn ${!isDrawingMode ? 'active subtle' : 'subtle'}`}
              onClick={() => setIsDrawingMode(false)}
              title="View only"
              type="button"
            >
              👁️
            </button>
          </div>
          <div className="toolbar-divider" />
          <div className="canvas-toolbar-group colors">
            {presetColors.map((swatch) => (
              <button
                key={swatch}
                className={`ct-color ${drawColor === swatch && !isEraser ? 'active' : ''}`}
                style={{ backgroundColor: swatch }}
                onClick={() => {
                  setDrawColor(swatch);
                  setIsDrawingMode(true);
                  setIsEraser(false);
                }}
                type="button"
                title={swatch}
              />
            ))}
          </div>
          <div className="toolbar-divider" />
          <div className="canvas-toolbar-group brush-size">
            <span>Brush</span>
            <input
              type="range"
              min="2"
              max="18"
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
            />
          </div>
          <div className="toolbar-divider" />
          <button className="ct-clear-btn" onClick={handleClearCanvas} title="Clear all" type="button">
            Clear
          </button>
        </div>
      </div>

      <div className="canvas-stage stage-with-nav">
        <button
          type="button"
          className="page-nav-btn prev"
          onClick={handlePreviousPage}
          disabled={activePage <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        <div
          key={`manga-${activePageData.id}`}
          className={`page-frame ${pageTurnDirection === 'next' ? 'turn-next' : 'turn-prev'}`}
        >
          <DrawingCanvas
            pageId={activePageData.id}
            imageUrl={activePageData.imageUrl}
            alt={`Page ${activePageData.page_number}`}
            isDrawingMode={isDrawingMode}
            isEraser={isEraser}
            color={drawColor}
            brushSize={brushSize}
            drawingTool={drawingTool}
            canvasRef={canvasRef}
          />
        </div>

        <button
          type="button"
          className="page-nav-btn next"
          onClick={handleNextPage}
          disabled={activePage >= activeDataset.pages.length}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </>
  );

  const renderSourceView = () => (
    <>
      <div className="source-header">
        <div>
          <p className="viewer-kicker">Source Text</p>
          <h3 className="source-title">{activeDataset.label}</h3>
        </div>
        <div className="source-page-chip">Page {activePageData.page_number}</div>
      </div>

      <div className="canvas-stage stage-with-nav">
        <button
          type="button"
          className="page-nav-btn prev"
          onClick={handlePreviousPage}
          disabled={activePage <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        <div
          key={`source-${activePageData.id}`}
          className={`page-frame source-frame ${pageTurnDirection === 'next' ? 'turn-next' : 'turn-prev'}`}
        >
          <section className="source-view-panel">
            <div className="source-summary-grid">
              <article className="source-summary-card">
                <span className="source-summary-label">Current page</span>
                <h4>{activePageData.title}</h4>
                <p>{activePageData.description}</p>
              </article>
              <article className="source-summary-card">
                <span className="source-summary-label">Dataset context</span>
                <h4>{activeDataset.summary}</h4>
                <p>{activeDataset.notes}</p>
              </article>
            </div>

            <div className="source-text-panel">
              {sourceTextSections.map((section, index) => (
                <article
                  key={`${activeDataset.id}-source-${index}`}
                  className={`source-text-block ${section.includes('|') ? 'tabular' : ''}`}
                >
                  <pre>{section}</pre>
                </article>
              ))}
            </div>
          </section>
        </div>

        <button
          type="button"
          className="page-nav-btn next"
          onClick={handleNextPage}
          disabled={activePage >= activeDataset.pages.length}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </>
  );

  const footerDescription =
    viewMode === 'manga'
      ? activePageData.description
      : `${activeDataset.summary} ${activeDataset.notes}`;

  return (
    <section className="panel comic-viewer">
      <div className="gallery-strip glass-panel">
        <div className="gallery-heading">
          <p className="gallery-label">Current dataset</p>
          <div className="dataset-switcher">
            <select
              value={activeDataset.id}
              onChange={(event) => handleDatasetChange(event.target.value)}
              className="dataset-select"
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.label}
                </option>
              ))}
            </select>
            <span className="dataset-page-count">{activeDataset.pageCount} pages</span>
          </div>
        </div>

        <div className="thumbnails-container">
          {activeDataset.pages.map((page) => (
            <button
              key={page.id}
              className={`thumbnail-wrapper ${activePage === page.page_number ? 'active' : ''}`}
              onClick={() => goToPage(page.page_number)}
              type="button"
            >
              <img src={page.imageUrl} alt={`Page ${page.page_number}`} className="thumbnail-img" />
              <span className="thumbnail-index">{page.page_number}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="main-comic-display glass-panel">
        <div className="workspace-topbar">
          <div className="view-switcher">
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'manga' ? 'active' : ''}`}
              onClick={() => setViewMode('manga')}
            >
              Manga
            </button>
            <button
              type="button"
              className={`view-switch-btn ${viewMode === 'source' ? 'active' : ''}`}
              onClick={() => setViewMode('source')}
            >
              Source Text
            </button>
          </div>

          <div className="page-flip-toolbar">
            <button
              type="button"
              className="page-flip-btn"
              onClick={handlePreviousPage}
              disabled={activePage <= 1}
            >
              ← Prev
            </button>
            <span className="page-counter">
              Page {activePage} / {activeDataset.pageCount}
            </span>
            <button
              type="button"
              className="page-flip-btn"
              onClick={handleNextPage}
              disabled={activePage >= activeDataset.pageCount}
            >
              Next →
            </button>
          </div>
        </div>

        <div className="main-workspace">
          <div className="canvas-column">
            {viewMode === 'manga' ? renderMangaView() : renderSourceView()}
          </div>

          <ResearchNotesPanel
            activePage={activePageData.page_number}
            notes={currentNotes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onUpdateNote={handleUpdateNote}
          />
        </div>
      </div>

      <div className="description-area glass-panel">
        <p className="description-text">{footerDescription}</p>
      </div>
    </section>
  );
};

export default ComicViewer;
