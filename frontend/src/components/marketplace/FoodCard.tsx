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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-32 sm:h-48 w-full bg-slate-100">
        <div
          className="h-full w-full bg-cover bg-center"
          aria-label={food.title}
          role="img"
          style={{
            backgroundImage: `url(${food.image || '/api/placeholder/400/300'})`,
          }}
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold text-emerald-600 shadow-sm border border-emerald-100">
          Tersedia
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-1">{food.title}</h3>
        </div>
        
        <p className="text-[11px] sm:text-sm text-slate-600 mb-2 sm:mb-3 font-medium line-clamp-1">{food.restaurantName}</p>

        {food.description && (
          <p className="hidden sm:block mb-3 text-sm leading-6 text-slate-500 line-clamp-2">{food.description}</p>
        )}
        
        <div className="flex flex-col gap-1.5 sm:gap-2 mt-auto">
          <div className="flex items-center text-slate-500 text-[10px] sm:text-sm">
            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-emerald-500" />
            <span className="line-clamp-1">{food.quantity}</span>
          </div>

          <div className="flex items-center text-slate-500 text-[10px] sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-sky-500" />
            <span className="line-clamp-1">{food.location}</span>
          </div>
          
          <div className="flex items-center text-slate-500 text-[10px] sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-amber-500" />
            <span className="line-clamp-1">Sisa: <span className="font-semibold text-amber-600">{food.expiryTime}</span></span>
          </div>
        </div>
        
        <button
          onClick={onAction}
          disabled={actionDisabled}
          className="w-full mt-3 sm:mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 shadow-sm shadow-emerald-100"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
