"use client";

import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

interface Location {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface LocationData {
  location: string;
  latitude: number;
  longitude: number;
}

interface LocationInputProps {
  value: string;
  onChange: (data: LocationData) => void;
  className?: string;
}

export default function LocationInput({ value, onChange, className = '' }: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced function to fetch location suggestions
  const fetchSuggestions = debounce(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  }, 300);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    fetchSuggestions(newValue);
    onChange({ location: newValue, latitude: 0, longitude: 0 });
  };

  const handleSelectLocation = (location: Location) => {
    const locationName = location.state 
      ? `${location.name}, ${location.state}`
      : location.name;
      
    setInputValue(locationName);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange({
      location: locationName,
      latitude: location.lat,
      longitude: location.lon
    });
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
        className={className}
        placeholder="Søk etter sted..."
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${index}`}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleSelectLocation(suggestion)}
            >
              {suggestion.state 
                ? `${suggestion.name}, ${suggestion.state}`
                : suggestion.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
