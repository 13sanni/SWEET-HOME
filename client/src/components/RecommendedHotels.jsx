import React, { useMemo } from 'react';
import HotelCard from './HotelCard';
import Title from './Title';
import { useAppContext } from '../context/AppContext.jsx';

const RecommendedHotels = () => {
  const { rooms, searchedCities } = useAppContext();

  const recommended = useMemo(
    () => rooms.filter((room) => room.hotel && searchedCities.includes(room.hotel.city)),
    [rooms, searchedCities]
  );

  return (
    recommended.length > 0 && (
      <div className='relative flex flex-col items-center px-6 md:px-16 lg:px-24 py-20 overflow-hidden'>
        <div className='absolute -top-20 -left-14 h-52 w-52 rounded-full bg-primary/15 blur-3xl' />
        <div className='absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-secondary/20 blur-3xl' />
        <Title
          title='Recommended Hotels'
          subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences.'
        />
        <div className='relative z-10 flex flex-wrap items-center justify-center gap-6 mt-20'>
          {recommended.slice(0, 4).map((room, index) => (
            <HotelCard key={room._id} room={room} index={index} />
          ))}
        </div>
      </div>
    )
  );
};

export default RecommendedHotels;
