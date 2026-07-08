import { supabase, isSupabaseConfigured } from './supabaseClient';

export type TodoDomain = 'sport' | 'uni' | 'sidehustle' | 'general';
export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  text: string;
  domain: TodoDomain;
  priority: TodoPriority;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
}

const LOCAL_STORAGE_KEY = 'life-tracker-local-todos';

const readLocalTodos = (): TodoItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]') as TodoItem[];
  } catch {
    return [];
  }
};

const writeLocalTodos = (todos: TodoItem[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
};

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `todo_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const fetchTodos = async (): Promise<TodoItem[]> => {
  if (!isSupabaseConfigured) {
    return readLocalTodos().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    text: row.text,
    domain: row.domain,
    priority: row.priority,
    completed: row.completed,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }));
};

export const createTodo = async (
  text: string,
  domain: TodoDomain = 'general',
  priority: TodoPriority = 'medium',
): Promise<{ todo: TodoItem | null; error: Error | null }> => {
  const todo: TodoItem = {
    id: makeId(),
    text,
    domain,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  if (!isSupabaseConfigured) {
    const todos = readLocalTodos();
    todos.push(todo);
    writeLocalTodos(todos);
    return { todo, error: null };
  }

  const { error } = await supabase.from('todos').insert({
    id: todo.id,
    text: todo.text,
    domain: todo.domain,
    priority: todo.priority,
    completed: todo.completed,
    created_at: todo.createdAt,
    completed_at: todo.completedAt,
  });

  return { todo: error ? null : todo, error: error ?? null };
};

export const updateTodo = async (
  id: string,
  updates: Partial<Pick<TodoItem, 'text' | 'domain' | 'priority' | 'completed'>>,
): Promise<{ error: Error | null }> => {
  const completedAt =
    updates.completed === true ? new Date().toISOString() : updates.completed === false ? null : undefined;

  if (!isSupabaseConfigured) {
    const todos = readLocalTodos();
    const next = todos.map((t) =>
      t.id === id ? { ...t, ...updates, completedAt: completedAt !== undefined ? completedAt : t.completedAt } : t,
    );
    writeLocalTodos(next);
    return { error: null };
  }

  const payload: Record<string, unknown> = { ...updates };
  if (completedAt !== undefined) payload.completed_at = completedAt;

  const { error } = await supabase.from('todos').update(payload).eq('id', id);
  return { error: error ?? null };
};

export const deleteTodo = async (id: string): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured) {
    writeLocalTodos(readLocalTodos().filter((t) => t.id !== id));
    return { error: null };
  }
  const { error } = await supabase.from('todos').delete().eq('id', id);
  return { error: error ?? null };
};