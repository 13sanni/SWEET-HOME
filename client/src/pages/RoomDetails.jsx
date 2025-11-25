import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getToken, axios } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const [formCheckInDate, setFormCheckInDate] = useState(searchParams.get('checkInDate') || '');
  const [formCheckOutDate, setFormCheckOutDate] = useState(searchParams.get('checkOutDate') || '');
  const [formGuests, setFormGuests] = useState(searchParams.get('guests') || 1);

  // Update URL when form values change
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  // Fetch room details on mount
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get(`/api/rooms/${id}`);
        if (data.success) {
          setRoom(data.room);
          setMainImage(data.room.images[0]);
        } else {
          toast.error('Failed to load room');
        }
      } catch (error) {
        toast.error('Error fetching room details');
      }
    };
    fetchRoom();
  }, [id]);

  const guestCapacityMap = {
    "Single Bed": 1,
    "Double Bed": 2,
    "Luxury Room": 2,
    "Family Suite": 4
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const checkIn = new Date(formCheckInDate);
    const checkOut = new Date(formCheckOutDate);
    const guestsNum = Number(formGuests);
    const maxAllowedGuests = guestCapacityMap[room.roomType] || 1;

    if (!formCheckInDate || !formCheckOutDate || isNaN(checkIn) || isNaN(checkOut)) {
      toast.error("Missing or invalid dates");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    if (guestsNum > maxAllowedGuests) {
      toast.error(`Only ${maxAllowedGuests} guest${maxAllowedGuests > 1 ? 's' : ''} allowed for a ${room.roomType}.`);
      return;
    }

    // ✅ Update URL
    setSearchParams({
      checkInDate: formCheckInDate,
      checkOutDate: formCheckOutDate,
      guests: formGuests
    });

    try {
      const { data: availabilityData } = await axios.post(
        '/api/rooms/byDate',
        {
          roomId: id,
          checkInDate: formCheckInDate,
          checkOutDate: formCheckOutDate,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (!availabilityData.success || !availabilityData.isAvailable) {
        toast.error("Room is not available for the selected dates.");
        return;
      }

      const { data } = await axios.post(
        '/api/bookings/book',
        {
          room: id,
          checkInDate: formCheckInDate,
          checkOutDate: formCheckOutDate,
          guests: formGuests,
          paymentMethod: 'Pay At Hotel',
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/my-bookings');
        scrollTo(0, 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return room && (
    <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
        <h1 className='text-3xl md:text-4xl font-playfair'>
          {room.hotel.name} <span className='font-inter text-sm'>{room.roomType}</span>
        </h1>
        <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% OFF</p>
      </div>

      <div className='flex items-center gap-1 mt-2'>
        <StarRating />
        <p className='ml-2'>200+ Reviews</p>
      </div>

      <div className='flex flex-col lg:flex-row mt-6 gap-6'>
        <div className='lg:w-1/2 w-full'>
          <img src={mainImage} alt="Room-Image" className='w-full rounded-xl shadow-lg object-cover' />
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {room.images.length > 1 && room.images.map((image, index) => (
            <img onClick={() => setMainImage(image)} key={index} src={image} alt={`Room-Image-${index}`} className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image && 'outline-3 outline-orange-500'}`} />
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={onSubmitHandler} className='bg-white border mt-10 p-5 rounded-xl shadow flex flex-col md:flex-row items-start md:items-end gap-4 justify-between'>
        <div className='flex flex-col'>
          <label className='text-sm'>Check-in</label>
          <input
            type="date"
            required
            value={formCheckInDate}
            onChange={(e) => {
              setFormCheckInDate(e.target.value);
              updateParam('checkInDate', e.target.value);
            }}
            className='border rounded px-3 py-2 mt-1'
          />
        </div>

        <div className='flex flex-col'>
          <label className='text-sm'>Check-out</label>
          <input
            type="date"
            required
            min={formCheckInDate}
            value={formCheckOutDate}
            onChange={(e) => {
              setFormCheckOutDate(e.target.value);
              updateParam('checkOutDate', e.target.value);
            }}
            className='border rounded px-3 py-2 mt-1'
          />
        </div>

        <div className='flex flex-col'>
          <label className='text-sm'>Guests</label>
          <input
            type="number"
            min="1"
            required
            value={formGuests}
            onChange={(e) => {
              setFormGuests(e.target.value);
              updateParam('guests', e.target.value);
            }}
            className='border rounded px-3 py-2 mt-1'
          />
        </div>

        <div className='flex flex-col justify-end'>
          <button type="submit" className='bg-primary hover:bg-primary-dull text-white px-6 py-3 rounded-md'>
            Book Now
          </button>
          <p className='text-xl mt-2 font-medium text-gray-800'>${room.pricePerNight} / night</p>
        </div>
      </form>

      {/* Amenities */}
      <div className='mt-10 flex flex-wrap items-center gap-6'>
        {room.amenities.map((item, index) => (
          <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
            <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />
            <p className='text-xs'>{item}</p>
          </div>
        ))}
      </div>

      {/* Specs */}
      <div className='mt-12 space-y-4'>
        {roomCommonData.map((spec, index) => (
          <div key={index} className='flex items-center gap-2'>
            <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5' />
            <div>
              <p className='text-base'>{spec.title}</p>
              <p className='text-gray-500'>{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Host Section */}
      <div>
        <p className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
          You get a comfortable two-bedroom apartment with a true city feeling. Guests will be allocated on the ground floor according to availability. The price quoted is for two guests — please mark the number of guests to get the correct quote.
        </p>
      </div>

      <div className='flex flex-col items-start gap-4'>
        <div className='flex gap-4'>
          <img src={room.hotel.owner.image} alt="Host" className='h-14 w-14 mid:h-18 md:w-18 rounded-full' />
          <div>
            <p className='text-lg md:text-xl'>Hosted by {room.hotel.name}</p>
            <div className='flex items-center mt-1'>
              <StarRating />
              <p className='ml-2'>200+ Reviews</p>
            </div>
          </div>
          <button className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'>Contact Now</button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
