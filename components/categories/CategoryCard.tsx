import React from 'react';

const CategoryCard = ({ category }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {category.imageBlob ? (
        <img src={category.imageBlob} alt="Category" className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4" />
      ) : (
        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">Afbeelding niet beschikbaar</div>
      )}
      <p className="text-gray-500 mb-4">{category.description}</p>
      <div className="flex space-x-2">
        <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Bewerken</button>
        <button className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors">Verwijderen</button>
      </div>
    </div>
  );
};

export default CategoryCard; 