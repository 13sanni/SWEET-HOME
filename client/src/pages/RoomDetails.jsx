import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getToken, axios, currency } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState({
    availableRooms: null,
    canBook: false,
  });

  const [formCheckInDate, setFormCheckInDate] = useState(searchParams.get("checkInDate") || "");
  const [formCheckOutDate, setFormCheckOutDate] = useState(searchParams.get("checkOutDate") || "");
  const [formRoomsRequested, setFormRoomsRequested] = useState(searchParams.get("roomsRequested") || 1);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0] || null);
      } else {
        toast.error("Failed to load room");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching room details");
    }
  };

  const checkAvailability = async (checkInDate, checkOutDate, roomsRequested) => {
    try {
      setCheckingAvailability(true);
      const { data } = await axios.get(`/api/rooms/${id}/availability`, {
        params: { checkInDate, checkOutDate, roomsRequested },
      });
      if (data.success) {
        setAvailability({
          availableRooms: data.availableRooms,
          canBook: data.canBook,
        });
        return data.canBook;
      }
      toast.error(data.message);
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const checkIn = new Date(formCheckInDate);
    const checkOut = new Date(formCheckOutDate);
    const roomsRequested = Number(formRoomsRequested);

    if (!formCheckInDate || !formCheckOutDate || Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      toast.error("Missing or invalid dates");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    if (!Number.isFinite(roomsRequested) || roomsRequested <= 0) {
      toast.error("Enter a valid room quantity");
      return;
    }

    setSearchParams({
      checkInDate: formCheckInDate,
      checkOutDate: formCheckOutDate,
      roomsRequested: String(roomsRequested),
    });

    const canBook = await checkAvailability(formCheckInDate, formCheckOutDate, roomsRequested);
    if (!canBook) {
      toast.error("Not enough rooms available for selected dates.");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/bookings",
        {
          roomId: id,
          checkIn: formCheckInDate,
          checkOut: formCheckOutDate,
          roomsRequested,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
        scrollTo(0, 0);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <h1 className="text-3xl md:text-5xl font-playfair text-slate-900">
            {room.hotel?.name} <span className="text-sm text-slate-500">{room.roomType}</span>
          </h1>
          <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Verified Stay</span>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <StarRating />
          <p className="ml-2">200+ Reviews</p>
        </div>

        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-1/2 w-full">
            <img src={mainImage} alt="Room-Image" className="w-full rounded-xl shadow-lg object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {(room.images || []).length > 1 &&
              room.images.map((image, index) => (
                <img
                  onClick={() => setMainImage(image)}
                  key={index}
                  src={image}
                  alt={`Room-Image-${index}`}
                  className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                    mainImage === image && "outline-3 outline-orange-500"
                  }`}
                />
              ))}
          </div>
        </div>

        <form
          onSubmit={onSubmitHandler}
          className="soft-card mt-10 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-end gap-4 justify-between"
        >
          <div className="flex flex-col">
            <label className="text-sm">Check-in</label>
            <input
              type="date"
              required
              value={formCheckInDate}
              onChange={(e) => {
                setFormCheckInDate(e.target.value);
                updateParam("checkInDate", e.target.value);
              }}
              className="border border-slate-200 rounded-xl px-3 py-2 mt-1 bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Check-out</label>
            <input
              type="date"
              required
              min={formCheckInDate}
              value={formCheckOutDate}
              onChange={(e) => {
                setFormCheckOutDate(e.target.value);
                updateParam("checkOutDate", e.target.value);
              }}
              className="border border-slate-200 rounded-xl px-3 py-2 mt-1 bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm">Rooms</label>
            <input
              type="number"
              min="1"
              required
              value={formRoomsRequested}
              onChange={(e) => {
                setFormRoomsRequested(e.target.value);
                updateParam("roomsRequested", e.target.value);
              }}
              className="border border-slate-200 rounded-xl px-3 py-2 mt-1 bg-white"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={checkingAvailability}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl disabled:opacity-60"
            >
              {checkingAvailability ? "Checking..." : "Book Now"}
            </button>
            <p className="text-xl mt-2 font-medium text-gray-800">
              {currency} {room.price} / night
            </p>
            {availability.availableRooms !== null && (
              <p className={`text-sm ${availability.canBook ? "text-green-700" : "text-red-600"}`}>
                Available: {availability.availableRooms}
              </p>
            )}
          </div>
        </form>

        {!!room.amenities?.length && (
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {room.amenities.map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />}
                <p className="text-xs">{item}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 space-y-4">
          {roomCommonData.map((spec, index) => (
            <div key={index} className="flex items-center gap-2">
              <img src={spec.icon} alt={`${spec.title}-icon`} className="w-6.5" />
              <div>
                <p className="text-base">{spec.title}</p>
                <p className="text-gray-500">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
            Inventory is managed per room type and by date range. Availability updates automatically after checkout.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <img
              src={room.hotel?.owner?.image}
              alt="Host"
              className="h-14 w-14 mid:h-18 md:w-18 rounded-full"
            />
            <div>
              <p className="text-lg md:text-xl">Hosted by {room.hotel?.name}</p>
              <div className="flex items-center mt-1">
                <StarRating />
                <p className="ml-2">200+ Reviews</p>
              </div>
            </div>
            <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer">
              Contact Now
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
