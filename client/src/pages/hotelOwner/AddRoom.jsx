import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddRoom = () => {
  const { axios, getToken, ownerHotels, fetchOwnerHotels } = useAppContext();

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [inputs, setInputs] = useState({
    hotelId: "",
    roomType: "",
    price: 0,
    totalRooms: 1,
    amenities: {
      "Free Wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOwnerHotels();
  }, []);

  useEffect(() => {
    if (ownerHotels.length > 0 && !inputs.hotelId) {
      setInputs((prev) => ({ ...prev, hotelId: ownerHotels[0]._id }));
    }
  }, [ownerHotels]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!inputs.hotelId || !inputs.roomType || !inputs.price || !inputs.totalRooms || !Object.values(images).some((image) => image)) {
      toast.error("Please fill all required room details");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hotelId", inputs.hotelId);
      formData.append("roomType", inputs.roomType);
      formData.append("price", inputs.price);
      formData.append("totalRooms", inputs.totalRooms);

      const amenities = Object.keys(inputs.amenities).filter((key) => inputs.amenities[key]);
      formData.append("amenities", JSON.stringify(amenities));

      Object.keys(images).forEach((key) => {
        if (images[key]) {
          formData.append("images", images[key]);
        }
      });

      const { data } = await axios.post("/api/rooms", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message || "Room added");
        setInputs({
          hotelId: ownerHotels[0]?._id || "",
          roomType: "",
          price: 0,
          totalRooms: 1,
          amenities: {
            "Free Wifi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
          },
        });
        setImages({
          1: null,
          2: null,
          3: null,
          4: null,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="soft-card rounded-2xl p-6">
      <Title
        align="left"
        font="Outfit"
        title="Add Room"
        subTitle="Select hotel, room type, price, quantity and images."
      />

      <p className="text-gray-800 mt-8">Hotel</p>
      <select
        className="border border-slate-300 mt-1 rounded-xl p-2.5 w-full max-w-sm bg-white"
        value={inputs.hotelId}
        onChange={(e) => setInputs({ ...inputs, hotelId: e.target.value })}
        required
      >
        <option value="">Select Hotel</option>
        {ownerHotels.map((hotel) => (
          <option key={hotel._id} value={hotel._id}>
            {hotel.name} ({hotel.city})
          </option>
        ))}
      </select>

      <p className="text-gray-800 mt-6">Images (max 4)</p>
      <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            <img
              className="max-h-16 w-20 rounded-xl border border-slate-200 cursor-pointer object-cover opacity-90"
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
              alt="upload-preview"
            />
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              className="hidden"
              onChange={(e) => setImages({ ...images, [key]: e.target.files?.[0] || null })}
            />
          </label>
        ))}
      </div>

      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Room Type</p>
          <input
            type="text"
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border border-slate-300 mt-1 rounded-xl p-2.5 w-full bg-white"
            placeholder="Single / Double / Deluxe"
            required
          />
        </div>
        <div>
          <p className="mt-4 text-gray-800">Price / night</p>
          <input
            type="number"
            min="0"
            placeholder="0"
            className="border border-slate-300 mt-1 rounded-xl p-2.5 w-28 bg-white"
            value={inputs.price}
            onChange={(e) => setInputs({ ...inputs, price: e.target.value })}
            required
          />
        </div>
        <div>
          <p className="mt-4 text-gray-800">Total Rooms</p>
          <input
            type="number"
            min="1"
            className="border border-slate-300 mt-1 rounded-xl p-2.5 w-28 bg-white"
            value={inputs.totalRooms}
            onChange={(e) => setInputs({ ...inputs, totalRooms: e.target.value })}
            required
          />
        </div>
      </div>

      <p className="text-gray-800 mt-4">Amenities (optional)</p>
      <div className="flex flex-col flex-wrap mt-1 text-gray-500 max-w-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index} className="py-0.5">
            <input
              type="checkbox"
              id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] },
                })
              }
            />
            <label htmlFor={`amenities${index + 1}`}> {amenity}</label>
          </div>
        ))}
      </div>

      <button className="bg-primary text-white px-8 py-2.5 rounded-xl mt-8 cursor-pointer hover:bg-primary/90" disabled={loading}>
        {loading ? "Adding..." : "Add Room"}
      </button>
    </form>
  );
};

export default AddRoom;
