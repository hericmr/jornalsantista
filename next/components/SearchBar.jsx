import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar notícias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-dark" type="submit">
          Buscar
        </button>
      </div>
    </form>
  );
};

export default SearchBar; 