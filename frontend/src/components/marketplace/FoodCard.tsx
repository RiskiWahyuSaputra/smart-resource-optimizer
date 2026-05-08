import React from 'react';
import { Clock, MapPin, Package } from 'lucide-react';

interface FoodCardProps {
  food: {
    id: number;
    title: string;
    restaurantName: string;
    quantity: string;
    location: string;
    expiryTime: string;
    image: string;
    description?: string;
  };
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  actionLabel = 'Lihat Detail',
  onAction,
  actionDisabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-48 w-full bg-slate-100">
        <div
          className="h-full w-full bg-cover bg-center"
          aria-label={food.title}
          role="img"
          style={{
            backgroundImage: `url(${food.image || '/api/placeholder/400/300'})`,
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-emerald-600 shadow-sm border border-emerald-100">
          Tersedia
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{food.title}</h3>
        </div>
        
        <p className="text-sm text-slate-600 mb-3 font-medium">{food.restaurantName}</p>

        {food.description && (
          <p className="mb-3 text-sm leading-6 text-slate-500 line-clamp-2">{food.description}</p>
        )}
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-slate-500 text-sm">
            <Package className="w-4 h-4 mr-2 text-emerald-500" />
            <span>{food.quantity} tersedia</span>
          </div>

          <div className="flex items-center text-slate-500 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-sky-500" />
            <span className="line-clamp-1">{food.location}</span>
          </div>
          
          <div className="flex items-center text-slate-500 text-sm">
            <Clock className="w-4 h-4 mr-2 text-amber-500" />
            <span>Berakhir dalam: <span className="font-semibold text-amber-600">{food.expiryTime}</span></span>
          </div>
        </div>
        
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-sm shadow-emerald-100"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
