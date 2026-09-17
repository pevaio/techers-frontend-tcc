import React from 'react';

export function parser(text, existingNotes, onLinkClick) {
  if (typeof text !== 'string') return text;

  const regex = /\[\[(.*?)\]\]/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const noteTitle = match[1].trim();
    if (matchIndex > lastIndex) {
      elements.push(text.substring(lastIndex, matchIndex));
    }

    const exists = existingNotes.includes(noteTitle);

    elements.push(
      <span
        key={matchIndex}
        onClick={() => onLinkClick(noteTitle)}
        style={{
          color: exists ? '#60a5fa' : '#f87171', // Azul claro se existe, Vermelho claro se for fantasma
          textDecoration: 'underline',
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        {noteTitle}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}
