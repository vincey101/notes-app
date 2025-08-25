import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, X, LucideIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface NoteCardProps extends Omit<Note, 'created_at'> {
  createdAt: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

interface EditModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  color?: string;
  disabled?: boolean;
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

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
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
              {isSummarizing ? 'Summarizing...' : 'Summarize'}
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

function ViewModal({ isOpen, onClose, note }: ViewModalProps) {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(note.created_at)}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="prose max-w-none">
            <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
          </div>
        </div>
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-red-500 hover:bg-red-900 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  icon: Icon, 
  title, 
  color = "text-[#3d2dcf] hover:text-[#6B63B7]",
  disabled = false 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 ${color} rounded-full hover:bg-gray-100 transition-colors`}
    title={title}
  >
    <Icon size={16} />
  </button>
);

function NoteCard({ id, title, content, createdAt, onEdit, onDelete }: NoteCardProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullNote, setFullNote] = useState<Note | null>(null);

  const handleView = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/get-note/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch note details');
      }

      const data = await response.json();
      setFullNote(data.note);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('View note error:', error);
      toast.error('Failed to load note details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        {/* Date */}
        <div className="text-sm text-gray-500 mb-2">
          {formatDate(createdAt)}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-3"></div>

        {/* Title with dot */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>

        {/* Content */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{content}</p>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-auto">
          <ActionButton
            onClick={handleView}
            icon={Eye}
            title="View note"
            disabled={isLoading}
            color="text-[#008000] hover:text-[#008000]"
          />
          <ActionButton
            onClick={() => onEdit(id)}
            icon={Edit2}
            title="Edit note"
          />
          <ActionButton
            onClick={() => onDelete(id)}
            icon={Trash2}
            title="Delete note"
            color="text-red-500 hover:text-red-500"
          />
        </div>
      </div>

      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        note={fullNote}
      />
    </>
  );
}

export default NoteCard; 