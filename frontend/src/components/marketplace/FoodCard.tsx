import React from 'react';
import { MapPin, Clock, Package } from 'lucide-react';

interface FoodCardProps {
  food: {
    id: number;
    title: string;
    restaurantName: string;
    quantity: string;
    distance: string;
    expiryTime: string;
    image: string;
  };
}

const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-48 w-full bg-slate-100">
        <img
          src={food.image || '/api/placeholder/400/300'}
          alt={food.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-emerald-600 shadow-sm border border-emerald-100">
          {food.distance}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{food.title}</h3>
        </div>
        
        <p className="text-sm text-slate-600 mb-3 font-medium">{food.restaurantName}</p>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-slate-500 text-sm">
            <Package className="w-4 h-4 mr-2 text-emerald-500" />
            <span>{food.quantity} tersedia</span>
          </div>
          
          <div className="flex items-center text-slate-500 text-sm">
            <Clock className="w-4 h-4 mr-2 text-amber-500" />
            <span>Berakhir dalam: <span className="font-semibold text-amber-600">{food.expiryTime}</span></span>
          </div>
        </div>
        
        <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-sm shadow-emerald-100">
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
