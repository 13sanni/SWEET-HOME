import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const HotelCard = ({ room, index }) => {
  return (
    <Link
      to={`./rooms/${room._id}`}
      onClick={() => scrollTo(0, 0)}
      key={room._id}
      className="group relative max-w-72 w-full rounded-2xl overflow-hidden soft-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className="relative">
        <img
          src={room.images[0]}
          alt=""
          className="h-54 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
        {index % 2 === 0 && (
          <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-slate-800 font-semibold rounded-full">
            Editor's Pick
          </p>
        )}
      </div>

      <div className="p-4 pt-5">
        <div className="flex items-center justify-between">
          <p className="font-playfair text-xl font-semibold text-slate-800">{room.hotel.name}</p>
          <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
            <img src={assets.starIconFilled} alt="star-icon" /> 4.8
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.hotel.address}</span>
        </div>
        <div className="flex items-center justify-between mt-5">
          <p className="text-slate-600">
            <span className="text-lg text-slate-900 font-semibold">${room.price}</span>/night
          </p>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-primary transition-all cursor-pointer">
            View
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
