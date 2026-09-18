import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parser } from './utils/parser';

const STORAGE_KEY = 'markdown-notes-app';
const STORAGE_KEY_ACTIVE = 'markdown-notes-app-active';
const DEBOUNCE_MS = 500;

const defaultNotes = {
  "Início": "# Nota Inicial\n\nBem-vindo ao **PEVANOTA V2**!\n\nEste é um belo bloco de notas que conta com as funcionalidades essenciais, somente.\n\n### Recursos\n\n- Markdown\n- Wikilinks\n- Armazenamento Local\n\n*Em constante desenvolvimento por [pevaio](https://pevaio.neocities.org/)*",
  "Guia": "# Guia de Markdown\n### Ênfase\n**Negrito**, *itálico* ou ***ambos***\n### Listas\n- Primeiro item,\n- Segundo item\n  - Subitem\n\n1. Primeiro item\n2. Segundo item\n\t1. Subitem\n### Código\n`codigo`\n### Linha Horizontal\n***\n### Link\n[Markdown](https://daringfireball.net/projects/markdown/)",
};

export default function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultNotes;
    } catch (err) {
      console.error('Erro ao carregar notas do localStorage:', err);
      return defaultNotes;
    }
  });

  const [activeNoteTitle, setActiveNoteTitle] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsedNotes = saved ? JSON.parse(saved) : null;
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE);
      return (savedActive && parsedNotes?.[savedActive]) ? savedActive : "Início";
    } catch {
      return "Início";
    }
  });

  const debounceTimer = useRef(null);

  // Salva com debounce
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch (err) {
        console.error('Erro ao salvar notas no localStorage:', err);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer.current);
  }, [notes]);

  // Salva a nota ativa
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeNoteTitle);
    } catch (err) {
      console.error('Erro ao salvar nota ativa:', err);
    }
  }, [activeNoteTitle]);

  const existingNotesTitles = Object.keys(notes);
  const currentContent = notes[activeNoteTitle] || "";

  const handleTextChange = (e) => {
    setNotes(prev => ({ ...prev, [activeNoteTitle]: e.target.value }));
  };

  const handleLinkClick = (title) => {
    if (!notes[title]) {
      setNotes(prev => ({
        ...prev,
        [title]: `# ${title}\n\nEscreva sua nova nota aqui... \n\nVoltar para o [[Início]]`
      }));
    }
    setActiveNoteTitle(title);
  };

  const handleReset = () => {
    if (!confirm("Isso vai excluir todas as notas salvas e restaurar ao padrão. Continuar?")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    setNotes(defaultNotes);
    setActiveNoteTitle("Início");
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Geist Variable, sans-serif', backgroundColor: '#0b0b0b', color: '#fff' }}>

      {/* SIDEBAR */}
      <aside style={{ width: '260px', borderRight: '1px solid #3b3b3b', padding: '20px', boxSizing: 'border-box', backgroundColor: '#0b0b0b', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#fff', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Pevanota</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
          {existingNotesTitles.map(title => (
            <li
              key={title}
              onClick={() => setActiveNoteTitle(title)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                backgroundColor: activeNoteTitle === title ? '#008700' : 'transparent',
                color: activeNoteTitle === title ? '#fff' : '#d1d5db',
                marginBottom: '6px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              [N] {title}
            </li>
          ))}
        </ul>
        <button
          onClick={() => {
            const name = prompt("Nome da nova nota:");
            if (name) handleLinkClick(name);
          }}
          style={{ width: '100%', padding: '10px', cursor: 'pointer', marginTop: '15px', backgroundColor: '#008700', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600' }}
        >
          + Nova Nota
        </button>
        <button
          onClick={handleReset}
          style={{ width: '100%', padding: '10px', cursor: 'pointer', marginTop: '8px', backgroundColor: 'transparent', color: '#f87171', border: '1px solid #3b3b3b', borderRadius: '6px', fontWeight: '600' }}
        >
          Resetar Dados
        </button>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '15px 25px', borderBottom: '1px solid #3b3b3b', backgroundColor: '#0b0b0b' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}><span>{activeNoteTitle}</span></h2>
        </header>

        <div style={{ flex: 1, display: 'flex' }}>
          {/* EDITOR */}
          <textarea
            value={currentContent}
            onChange={handleTextChange}
            placeholder="Digite em Markdown aqui..."
            style={{
              flex: 1,
              padding: '25px',
              fontSize: '16px',
              backgroundColor: '#0b0b0b',
              color: '#fff',
              border: 'none',
              resize: 'none',
              outline: 'none',
              fontFamily: 'Fira Code, monospace',
              borderRight: '1px solid #3b3b3b',
              lineHeight: '1.5'
            }}
          />

          {/* PREVIEW */}
          <div className="markdown-preview" style={{ flex: 1, padding: '25px', overflowY: 'auto', lineHeight: '1.6', textAlign: 'start' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                text: ({ node, children }) => parser(children, existingNotesTitles, handleLinkClick)
              }}
            >
              {currentContent}
            </ReactMarkdown>
          </div>
        </div>
      </main>

    </div>
  );
}
