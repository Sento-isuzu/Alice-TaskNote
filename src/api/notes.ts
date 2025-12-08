// src/api/notes.ts
import api from './index';

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

interface Note {
  id: number;
  type: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
  isPinned: boolean;
  tags: { id: number; name: string; color?: string }[];
  created_at: string;
  updated_at: string;
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
    console.log(`[API] 更新笔记标签: note_id=${id}, tags=`, tags);
    return api
      .patch(`/notes/${id}/tags`, { tags })
      .then((response) => {
        console.log(`[API] 更新笔记标签成功:`, response);
        return response.data;
      })
      .catch((error) => {
        console.error(`[API] 更新笔记标签失败:`, error);
        console.error(`[API] 错误详情:`, error.response?.data || error.message);
        throw error;
      });
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
