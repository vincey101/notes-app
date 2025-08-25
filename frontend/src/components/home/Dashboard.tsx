import React, { useEffect, useState, useMemo } from 'react';
import { PlusCircle, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';
import NoteCard from './NoteCard';
import { useNavigate } from 'react-router-dom';
import { useSearch } from './Header';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface EditModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function EditModal({ note, isOpen, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(title, content);
    setIsSaving(false);
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast.error('Please add some content to summarize');
      return;
    }

    if (content.trim().length < 100) {
      toast.error('Please add at least 100 characters for meaningful summarization');
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to summarize content');
      }

      setContent(data.summary);
      toast.success('Content summarized successfully! You can edit it further if needed.');
    } catch (error: any) {
      console.error('Summarization error:', error);
      toast.error(error.message || 'Failed to summarize content');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Note</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8981D7] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8981D7] focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-red-500 hover:bg-red-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="px-4 py-2 bg-[#8981D7] text-white rounded-lg hover:bg-[#241e5a] transition-colors disabled:bg-[#8981D7] disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="text-yellow-300" size={16} />
              {isSummarizing ? 'Summarizing...' : 'Summarize Note'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-[#8981D7] text-white rounded-lg hover:bg-[#241e5a] transition-colors disabled:bg-[#8981D7] disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <h2 className="text-lg font-semibold mb-2">Delete Note</h2>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this note? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/get-notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data.notes);
    } catch (err) {
      setError('Failed to load notes');
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (title: string, content: string) => {
    if (!editingNote) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/update-note/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const data = await response.json();
      setNotes(notes.map(note => 
        note.id === editingNote.id ? { ...note, ...data.note } : note
      ));
      setEditingNote(null);
      toast.success('Note updated successfully');
    } catch (err) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (!deletingNoteId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/delete-note/${deletingNoteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(notes.filter(note => note.id !== deletingNoteId));
      setDeletingNoteId(null);
      toast.success('Note deleted successfully');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase().trim();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <button className="px-4 py-2 bg-[#8981D7] text-white rounded-lg hover:bg-[#6B63B7] transition-colors">
                All Notes
              </button>
              <button 
                onClick={() => navigate('/create')}
                className="flex items-center gap-2 px-4 py-2 text-[#3d2dcf] hover:text-[#6B63B7] transition-colors"
              >
                <PlusCircle size={20} />
                Create Note
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-px bg-gray-200 my-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">
                  {searchQuery.trim() 
                    ? 'No notes found matching your search.'
                    : 'No notes yet. Click "Create Note" to get started!'}
                </p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  content={note.content}
                  createdAt={note.created_at}
                  onEdit={(id) => setEditingNote(notes.find(n => n.id === id) || null)}
                  onDelete={(id) => setDeletingNoteId(id)}
                />
              ))
            )}
          </div>
        </main>
      </div>

      <EditModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEdit}
      />

      <DeleteModal
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Dashboard; 