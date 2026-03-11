import React, { useEffect, useState } from 'react';
import './StylePanel.css';

const resolutionOptions = ['1k', '2k', '4k'];

const emptyPresetDraft = {
  title: '',
  description: '',
  prompt: '',
};

const createEmptyPresetDraft = () => ({ ...emptyPresetDraft });

const StylePanel = ({
  presets,
  activePreset,
  setActivePreset,
  onCreatePreset,
  onUpdatePreset,
  resolution,
  setResolution,
  referenceText,
  setReferenceText,
  onGenerate,
  activeDataset,
}) => {
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetDraft, setPresetDraft] = useState(createEmptyPresetDraft);
  const [editingPresetId, setEditingPresetId] = useState(null);

  useEffect(() => {
    if (!isImagePreviewOpen && !isPresetModalOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsImagePreviewOpen(false);
        setIsPresetModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isImagePreviewOpen, isPresetModalOpen]);

  const selectedPreset = presets.find((preset) => preset.id === activePreset) ?? presets[0] ?? null;

  const openCreatePresetModal = () => {
    setEditingPresetId(null);
    setPresetDraft(createEmptyPresetDraft());
    setIsPresetModalOpen(true);
  };

  const openEditPresetModal = (preset) => {
    setEditingPresetId(preset.id);
    setPresetDraft({
      title: preset.title,
      description: preset.description,
      prompt: preset.prompt ?? '',
    });
    setIsPresetModalOpen(true);
  };

  const closePresetModal = () => {
    setIsPresetModalOpen(false);
    setEditingPresetId(null);
    setPresetDraft(createEmptyPresetDraft());
  };

  const handlePresetDraftChange = (field) => (event) => {
    setPresetDraft((currentDraft) => ({
      ...currentDraft,
      [field]: event.target.value,
    }));
  };

  const handlePresetSubmit = (event) => {
    event.preventDefault();

    const normalizedPreset = {
      title: presetDraft.title.trim(),
      description: presetDraft.description.trim(),
      prompt: presetDraft.prompt.trim(),
    };

    if (!normalizedPreset.title) {
      return;
    }

    if (editingPresetId) {
      onUpdatePreset(editingPresetId, normalizedPreset);
    } else {
      onCreatePreset(normalizedPreset);
    }

    closePresetModal();
  };

  return (
    <>
      <aside className="panel style-panel glass-panel">
        <div className="panel-header">
          <h2>Generate Settings</h2>
        </div>

        <div className="panel-content scrollable">
          <div className="config-section">
            <h3>Reference Image</h3>
            <button
              type="button"
              className="reference-image-button"
              onClick={() => setIsImagePreviewOpen(true)}
            >
              <img
                src={activeDataset.coverImage}
                alt={activeDataset.label}
                className="reference-image"
              />
            </button>
          </div>

          <div className="config-section">
            <div className="config-section-heading">
              <h3>Style Preset</h3>
              <button type="button" className="add-preset-btn" onClick={openCreatePresetModal}>
                Add New
              </button>
            </div>

            <div className="preset-list">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`preset-card ${activePreset === preset.id ? 'active' : ''}`}
                  onClick={() => setActivePreset(preset.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setActivePreset(preset.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="preset-copy">
                    <span className="preset-title">{preset.title}</span>
                    <p className="preset-description">{preset.description}</p>
                  </div>
                  <button
                    type="button"
                    className="preset-edit-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditPresetModal(preset);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3>Resolution</h3>
            <div className="resolution-grid">
              {resolutionOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`resolution-btn ${resolution === option ? 'active' : ''}`}
                  onClick={() => setResolution(option)}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3>Reference Text</h3>
            <textarea
              value={referenceText}
              onChange={(event) => setReferenceText(event.target.value)}
              className="reference-textarea"
              rows="6"
              placeholder={
                selectedPreset?.prompt || 'Add guidance for style, composition, or scene details.'
              }
            />
          </div>
        </div>

        <div className="generate-footer">
          <button type="button" className="generate-btn" onClick={onGenerate}>
            Generate
          </button>
        </div>
      </aside>

      {isImagePreviewOpen && (
        <div className="style-modal-overlay" onClick={() => setIsImagePreviewOpen(false)}>
          <div
            className="image-lightbox"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Reference image preview"
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsImagePreviewOpen(false)}
            >
              Close
            </button>
            <img src={activeDataset.coverImage} alt={activeDataset.label} className="lightbox-image" />
          </div>
        </div>
      )}

      {isPresetModalOpen && (
        <div className="style-modal-overlay" onClick={closePresetModal}>
          <div
            className="preset-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={editingPresetId ? 'Edit style preset' : 'Add style preset'}
          >
            <div className="preset-modal-header">
              <h3>{editingPresetId ? 'Edit Style Preset' : 'Add Style Preset'}</h3>
              <button type="button" className="modal-close-btn subtle" onClick={closePresetModal}>
                Close
              </button>
            </div>

            <form className="preset-form" onSubmit={handlePresetSubmit}>
              <label className="preset-field">
                <span>Title</span>
                <input
                  type="text"
                  value={presetDraft.title}
                  onChange={handlePresetDraftChange('title')}
                  placeholder="Preset title"
                  required
                />
              </label>

              <label className="preset-field">
                <span>Description</span>
                <textarea
                  value={presetDraft.description}
                  onChange={handlePresetDraftChange('description')}
                  rows="3"
                  placeholder="Short description"
                />
              </label>

              <label className="preset-field">
                <span>Prompt Notes</span>
                <textarea
                  value={presetDraft.prompt}
                  onChange={handlePresetDraftChange('prompt')}
                  rows="4"
                  placeholder="Optional generation notes"
                />
              </label>

              <div className="preset-form-actions">
                <button type="button" className="secondary-btn" onClick={closePresetModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  {editingPresetId ? 'Save Changes' : 'Create Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StylePanel;
