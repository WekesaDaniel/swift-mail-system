import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-bar">
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search emails..."
      />
      <button className="p-1 rounded hover:bg-muted transition-colors">
        <Filter className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
