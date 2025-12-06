// src/api/notes.ts
import api from './index';

interface Note {
  id: number;
  type: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
  isPinned: boolean;
  tags: Array<{ id: number; name: string; color: string }>;
  created_at: string;
  updated_at: string;
}

interface NoteCreateData {
  title?: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'doing' | 'done';
  tags?: number[];
  isPinned?: boolean;
}

interface NoteUpdateData {
  title?: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'doing' | 'done';
  tags?: number[];
  isPinned?: boolean;
}

const notesApi = {
  // 获取所有笔记
  getAllNotes: (params?: {
    search?: string;
    tags?: number[];
    pinned?: boolean;
    sort_by?: string;
    order?: string;
  }): Promise<Note[]> => {
    return api.get('/notes/', { params });
  },

  // 获取单个笔记
  getNoteById: (id: number): Promise<Note> => {
    return api.get(`/notes/${id}`);
  },

  // 创建笔记
  createNote: (data: NoteCreateData): Promise<Note> => {
    return api.post('/notes/', data);
  },

  // 更新笔记
  updateNote: (id: number, data: NoteUpdateData): Promise<Note> => {
    return api.put(`/notes/${id}`, data);
  },

  // 删除笔记
  deleteNote: (id: number): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/notes/${id}`);
  },

  // 搜索笔记
  searchNotes: (params: { q?: string; tag?: number }): Promise<Note[]> => {
    return api.get('/notes/search/', { params });
  },

  // 切换置顶状态
  togglePinNote: (id: number): Promise<Note> => {
    return api.patch(`/notes/${id}/toggle-pin`);
  },

  // 更新笔记标签
  updateNoteTags: (id: number, tags: number[]): Promise<Note> => {
    return api.patch(`/notes/${id}/tags`, { tags });
  },

  // 批量删除
  batchDeleteNotes: (
    noteIds: number[]
  ): Promise<{
    success: boolean;
    message: string;
    deleted_count: number;
    total_requested: number;
  }> => {
    return api.post('/notes/batch/delete', { note_ids: noteIds });
  },
};

export default notesApi;
