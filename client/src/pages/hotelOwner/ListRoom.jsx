import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { axios, getToken, currency, user } = useAppContext();

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post(
        "/api/rooms/toggle-availability",
        { roomId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm("Delete this room type?")) return;
    try {
      const { data } = await axios.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message);
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  return (
    <div>
      <Title
        align="left"
        font="Outfit"
        title="Room Listings"
        subTitle="Manage room types, inventory and active status."
      />
      <p className="text-gray-500 mt-8">All Rooms</p>
      <div className="w-full max-w-5xl text-left border border-gray-300 rounded-lg max-h-100 overflow-y-scroll mt-3">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">Hotel</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Room Type</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Price / night</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Inventory</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rooms.map((item) => (
              <tr key={item._id}>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.hotel?.name || "-"}</td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.roomType}</td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {currency} {item.price}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {item.availableRooms}/{item.totalRooms}
                </td>
                <td className="py-3 px-4 border-t border-gray-300">
                  <div className="flex items-center justify-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-2">
                      <input
                        onChange={() => toggleAvailability(item._id)}
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.isActive}
                      />
                      <div className="w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200" />
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4" />
                    </label>
                    <button
                      onClick={() => deleteRoom(item._id)}
                      className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;
