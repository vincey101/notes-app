import React, { useState, useContext } from 'react';
import { Search } from 'lucide-react';

// Search context for search functionality
export const SearchContext = React.createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export const useSearch = () => useContext(SearchContext);

function Header() {
  const { searchQuery, setSearchQuery } = useSearch();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = user.name ? user.name[0].toUpperCase() : '?';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by note title..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8981D7] focus:border-transparent"
          />
        </div>
      </div>

      {/* User avatar and greeting */}
      <div className="ml-4 flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full bg-[#8981D7] text-white flex items-center justify-center font-semibold text-lg"
          title={user.name}
        >
          {userInitial}
        </div>
        <span className="text-gray-700">Hello, {user.name || 'User'}!</span>
      </div>
    </div>
  );
}

export default Header; 