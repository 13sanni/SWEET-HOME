import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import StarRating from "../components/StarRating";
import { assets, facilityIcons } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
    <input type="checkbox" checked={selected} onChange={(e) => onChange(e.target.checked, label)} />
    <span className="font-light select-none">{label}</span>
  </label>
);

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
    <input type="radio" name="sortOption" checked={selected} onChange={() => onChange(label)} />
    <span className="font-light select-none">{label}</span>
  </label>
);

const AllRooms = () => {
  const [searchParams] = useSearchParams();
  const { roomsByDateRange, navigate, currency, rooms } = useAppContext();
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });

  const checkInDate = searchParams.get("checkInDate");
  const checkOutDate = searchParams.get("checkOutDate");
  const roomsRequested = searchParams.get("roomsRequested") || 1;
  const hasDateFilter = Boolean(checkInDate && checkOutDate);
  const [selectedSort, setSelectedSort] = useState("");

  const roomTypes = ["Single", "Double", "Deluxe", "Suite"];
  const priceRanges = ["0 to 500", "500 to 1000", "1000 to 2000", "2000 to 5000"];
  const sortOptions = ["Price: Low to High", "Price: High to Low", "Newest First"];

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type].push(value);
      } else {
        updatedFilters[type] = updatedFilters[type].filter((item) => item !== value);
      }
      return updatedFilters;
    });
  };

  const matchesRoomType = (room) =>
    selectedFilters.roomType.length === 0 ||
    selectedFilters.roomType.some((item) => room.roomType.toLowerCase().includes(item.toLowerCase()));

  const matchesPriceRange = (room) =>
    selectedFilters.priceRange.length === 0 ||
    selectedFilters.priceRange.some((range) => {
      const [min, max] = range.split(" to ").map(Number);
      return room.price >= min && room.price <= max;
    });

  const sortRooms = (a, b) => {
    if (selectedSort === "Price: Low to High") return a.price - b.price;
    if (selectedSort === "Price: High to Low") return b.price - a.price;
    if (selectedSort === "Newest First") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  };

  const filterDestination = (room) => {
    const destination = searchParams.get("destination");
    if (!destination) return true;
    return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
  };

  const sourceRooms = hasDateFilter ? roomsByDateRange : rooms;

  const filteredRooms = useMemo(
    () =>
      sourceRooms
        .filter((room) => matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room))
        .sort(sortRooms),
    [sourceRooms, selectedFilters, selectedSort, searchParams]
  );

  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
  };

  const navigateToRoomDetails = (roomId) => {
    if (!hasDateFilter) {
      navigate(`/rooms/${roomId}`);
      scrollTo(0, 0);
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      toast.error("Invalid check-in/check-out dates. Showing room details without date filter.");
      navigate(`/rooms/${roomId}`);
      scrollTo(0, 0);
      return;
    }

    navigate(
      `/rooms/${roomId}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomsRequested=${roomsRequested}`
    );
    scrollTo(0, 0);
  };

  return (
    <div className="pt-30 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32 pb-16">
      <div className="mb-8 flex flex-col items-start text-left">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Room Collection</p>
        <h1 className="font-playfair text-4xl md:text-5xl mt-2">Find Your Perfect Stay</h1>
        <p className="text-sm md:text-base text-slate-600 mt-2 max-w-3xl">
          Explore premium room categories with live room-count availability for your selected dates.
        </p>
      </div>

      <div className="flex flex-col-reverse lg:flex-row items-start justify-between gap-8">
        <div className="flex-1">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="soft-card rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start gap-5 mb-5"
            >
              <img
                onClick={() => navigateToRoomDetails(room._id)}
                src={room.images[0]}
                alt="hotel-img"
                title="View Room Details"
                className="h-60 md:h-64 md:w-[45%] rounded-2xl object-cover cursor-pointer"
              />
              <div className="md:w-[55%] flex flex-col gap-2">
                <p className="text-slate-500">{room.hotel.city}</p>
                <p
                  onClick={() => navigateToRoomDetails(room._id)}
                  className="text-slate-900 text-3xl font-playfair cursor-pointer"
                >
                  {room.hotel.name}
                </p>
                <div className="flex items-center">
                  <StarRating />
                  <p className="ml-2 text-sm text-slate-600">200+ reviews</p>
                </div>
                <div className="flex items-center gap-1 text-slate-500 mt-1 text-sm">
                  <img src={assets.locationIcon} alt="location-icon" />
                  <span>{room.hotel.address}</span>
                </div>

                <div className="flex flex-wrap items-center mt-3 mb-4 gap-2">
                  {(room.amenities || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
                      {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="w-4 h-4" />}
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-auto">
                  <p className="text-xl font-semibold text-slate-800">
                    {currency} {room.price} <span className="text-base font-normal text-slate-500">/night</span>
                  </p>
                  <p className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{room.roomType}</p>
                  {hasDateFilter && (
                    <p className="text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      {room.availableRooms} available
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="soft-card w-full lg:w-80 text-slate-700 rounded-2xl p-4 lg:sticky lg:top-28">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <p className="text-base font-semibold text-slate-900">Filters</p>
            <div className="text-xs cursor-pointer">
              <span onClick={() => setOpenFilters(!openFilters)} className="lg:hidden">
                {openFilters ? "HIDE" : "SHOW"}
              </span>
              <span className="hidden lg:block text-primary font-medium" onClick={clearFilters}>
                CLEAR
              </span>
            </div>
          </div>

          <div className={`${openFilters ? "h-auto" : "h-0 lg:h-auto"} overflow-hidden transition-all duration-500`}>
            <div className="pt-4">
              <p className="font-medium text-slate-800 pb-2">Room Type</p>
              {roomTypes.map((roomType, index) => (
                <CheckBox
                  key={index}
                  label={roomType}
                  selected={selectedFilters.roomType.includes(roomType)}
                  onChange={(checked) => handleFilterChange(checked, roomType, "roomType")}
                />
              ))}
            </div>

            <div className="pt-5">
              <p className="font-medium text-slate-800 pb-2">Price Range</p>
              {priceRanges.map((range, index) => (
                <CheckBox
                  key={index}
                  label={`${currency} ${range}`}
                  selected={selectedFilters.priceRange.includes(range)}
                  onChange={(checked) => handleFilterChange(checked, range, "priceRange")}
                />
              ))}
            </div>

            <div className="pt-5 pb-2">
              <p className="font-medium text-slate-800 pb-2">Sort By</p>
              {sortOptions.map((option, index) => (
                <RadioButton key={index} label={option} selected={selectedSort === option} onChange={setSelectedSort} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
