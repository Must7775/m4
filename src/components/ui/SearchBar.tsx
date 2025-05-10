
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  initialValue = "" 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  
  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-500" />
      </div>
      <Input
        type="text"
        className="pl-10 pr-4 py-2 w-full bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md transition-all"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearch}
      />
    </div>
  );
}
