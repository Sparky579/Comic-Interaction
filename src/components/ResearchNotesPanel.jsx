import React, { useState } from 'react';
import './ResearchNotesPanel.css';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ResearchNotesPanel = ({ activePage, notes, onAddNote, onDeleteNote, onUpdateNote }) => {
  const [expandedImage, setExpandedImage] = useState('');

  const handleImageUpload = async (noteId, file) => {
    if (!file) {
      return;
    }

    const imageUrl = await readFileAsDataUrl(file);
    onUpdateNote(noteId, { imageUrl });
  };

  return (
    <>
      <aside className="research-notes-panel">
        <div className="research-notes-header">
          <p className="research-notes-label">Research notes</p>
          <button type="button" className="note-add-btn" onClick={onAddNote}>
            Add entry
          </button>
        </div>

        <div className="research-notes-list">
          {notes.length === 0 ? (
            <div className="research-notes-empty">
              <p>No notes on this page yet.</p>
              <span>Add a concise observation or attach a visual example.</span>
            </div>
          ) : (
            notes.map((note, index) => (
              <article key={note.id} className="note-card">
                <div className="note-card-header">
                  <span className="note-card-index">{index + 1}</span>
                  <button
                    type="button"
                    className="note-delete-btn"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    Delete
                  </button>
                </div>

                <textarea
                  className="note-body-input"
                  rows="2"
                  value={note.body}
                  onChange={(e) => onUpdateNote(note.id, { body: e.target.value })}
                  placeholder="Write a short observation..."
                />

                <div className="note-image-actions">
                  <label className="note-upload-btn">
                    Add image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(note.id, e.target.files?.[0])}
                    />
                  </label>
                  {note.imageUrl && (
                    <button
                      type="button"
                      className="note-clear-btn"
                      onClick={() => onUpdateNote(note.id, { imageUrl: '' })}
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    className="notes-confirm-btn"
                    onClick={() => { /* confirm handler */ }}
                  >
                    Confirm
                  </button>
                </div>

                {note.imageUrl ? (
                  <button
                    type="button"
                    className="note-image-thumb"
                    onClick={() => setExpandedImage(note.imageUrl)}
                  >
                    <img src={note.imageUrl} alt={`Page ${activePage} note ${index + 1}`} />
                  </button>
                ) : null}
              </article>
            ))
          )}

        </div>
      </aside>

      {expandedImage ? (
        <button
          type="button"
          className="note-lightbox"
          onClick={() => setExpandedImage('')}
          aria-label="Close image preview"
        >
          <img src={expandedImage} alt="Expanded note preview" className="note-lightbox-image" />
        </button>
      ) : null}
    </>
  );
};

export default ResearchNotesPanel;
