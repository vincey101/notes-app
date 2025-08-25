import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';

function Create() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isContentEmpty = !content.trim();

  const handleSummarize = async () => {
    if (isContentEmpty) {
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

      setSummary(data.summary);
      toast.success('Content summarized successfully! You can edit the summary if needed.');
    } catch (error: any) {
      console.error('Summarization error:', error);
      toast.error(error.message || 'Failed to summarize content');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/api/create-note', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: summary.trim() || content.trim() // Use summary if available, otherwise use original content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create note');
      }

      toast.success('Note created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to create note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create New Note</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Note Form */}
              <div className="flex flex-col space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8981D7] focus:border-transparent"
                    placeholder="Enter note title"
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-[350px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8981D7] focus:border-transparent resize-none"
                    placeholder="Enter note content"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isContentEmpty || isSaving}
                    className="flex-1 px-4 py-3 bg-[#8981D7] text-white rounded-lg hover:bg-[#241e5a] transition-colors disabled:bg-[#8981D7] disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Original Note'}
                  </button>
                  <button
                    onClick={handleSummarize}
                    disabled={isContentEmpty || isSummarizing}
                    className="flex-1 px-4 py-3 bg-[#8981D7] text-white rounded-lg hover:bg-[#241e5a] transition-colors disabled:bg-[#8981D7] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="text-yellow-300" size={20} />
                    {isSummarizing ? 'Summarizing...' : 'Summarize Note'}
                  </button>
                </div>
              </div>

              {/* Summary Section */}
              <div className="flex flex-col space-y-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-medium text-gray-800">Summary</h2>
                    <div title="You can edit the summary before saving">
                      <Info size={16} className="text-gray-500 cursor-help" />
                    </div>
                  </div>
                  <div className="w-full h-[400px] bg-white rounded-lg p-6 border">
                    {isSummarizing ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ) : (
                      <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Click 'Generate Summary' to create a summary of your content. You can edit the summary here before saving."
                        className="w-full h-full resize-none border-none focus:ring-0 text-gray-600 placeholder-gray-500"
                      />
                    )}
                  </div>
                </div>

                {summary && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-[#8981D7] text-white rounded-lg hover:bg-[#241e5a] transition-colors disabled:bg-[#8981D7] disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Summarized Note'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create; 