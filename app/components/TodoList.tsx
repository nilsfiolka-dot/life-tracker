'use client';

import { useMemo, useState } from 'react';
import type { TodoDomain, TodoItem, TodoPriority } from '../lib/todosClient';

interface TodoListProps {
  todos: TodoItem[];
  onAdd: (text: string, domain: TodoDomain, priority: TodoPriority) => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const DOMAIN_LABEL: Record<TodoDomain, string> = {
  sport: 'Sport',
  uni: 'Uni',
  sidehustle: 'Hustle',
  general: 'Allgemein',
};

const DOMAIN_DOT: Record<TodoDomain, string> = {
  sport: 'bg-orange-400',
  uni: 'bg-violet-400',
  sidehustle: 'bg-emerald-400',
  general: 'bg-slate-400',
};

const PRIORITY_LABEL: Record<TodoPriority, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
};

export default function TodoList({ todos, onAdd, onToggle, onEdit, onDelete }: TodoListProps) {
  const [text, setText] = useState('');
  const [domain, setDomain] = useState<TodoDomain>('general');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, domain, priority);
    setText('');
    setPriority('medium');
  };

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const commitEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (trimmed) onEdit(id, trimmed);
    setEditingId(null);
    setEditingText('');
  };

  const sorted = useMemo(() => {
    const rank: Record<TodoPriority, number> = { high: 0, medium: 1, low: 2 };
    return [...todos]
      .filter((t) => showCompleted || !t.completed)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.priority !== b.priority) return rank[a.priority] - rank[b.priority];
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [todos, showCompleted]);

  const openCount = todos.filter((t) => !t.completed).length;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">To-Dos</h3>
          <p className="text-xs text-slate-500">{openCount} offen</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCompleted((v) => !v)}
          className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 hover:border-slate-500 hover:text-slate-200"
        >
          {showCompleted ? 'Erledigte ausblenden' : 'Erledigte anzeigen'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Neues To-Do hinzufügen..."
          className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
        />
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value as TodoDomain)}
          className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
        >
          {(Object.keys(DOMAIN_LABEL) as TodoDomain[]).map((d) => (
            <option key={d} value={d}>{DOMAIN_LABEL[d]}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
        >
          {(Object.keys(PRIORITY_LABEL) as TodoPriority[]).map((p) => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-cyan-600 active:bg-cyan-700"
        >
          Hinzufügen
        </button>
      </form>

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">Keine To-Dos vorhanden.</p>
        ) : (
          sorted.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                todo.completed ? 'border-slate-800 bg-slate-950/50 opacity-60' : 'border-slate-800 bg-slate-950'
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => onToggle(todo.id, e.target.checked)}
                className="h-4 w-4 rounded accent-cyan-500"
              />
              <span className={`h-1.5 w-1.5 rounded-full ${DOMAIN_DOT[todo.domain]}`} />

              {editingId === todo.id ? (
                <input
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => commitEdit(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit(todo.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 focus:outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(todo)}
                  className={`flex-1 text-left text-sm ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                >
                  {todo.text}
                </button>
              )}

              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {PRIORITY_LABEL[todo.priority]}
              </span>

              <button
                type="button"
                onClick={() => onDelete(todo.id)}
                className="text-slate-500 hover:text-rose-400"
                aria-label="Löschen"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}