import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { currency, user, getToken, axios, ownerHotels, fetchOwnerHotels, setShowHotelReg } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/api/bookings/hotel", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const updateHotel = async (hotel) => {
    const name = window.prompt("Hotel name", hotel.name);
    if (!name) return;
    const address = window.prompt("Address", hotel.address);
    if (!address) return;
    const contact = window.prompt("Contact", hotel.contact);
    if (!contact) return;
    const city = window.prompt("City", hotel.city);
    if (!city) return;

    try {
      const { data } = await axios.put(
        `/api/hotels/${hotel._id}`,
        { name, address, contact, city },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchOwnerHotels();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteHotel = async (hotelId) => {
    if (!window.confirm("Delete this hotel and all its rooms/bookings?")) return;

    try {
      const { data } = await axios.delete(`/api/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerHotels();
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchOwnerHotels();
    }
  }, [user]);

  return (
    <div>
      <Title
        align="left"
        font="Outfit"
        title="Dashboard"
        subTitle="Manage hotels, monitor bookings and track revenue."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <div className="soft-card rounded-2xl flex p-4 pr-8">
          <img src={assets.totalBookingIcon} alt="" className="max-sm:hidden h-10" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-primary text-lg">Total Bookings</p>
            <p className="text-slate-500 text-base">{dashboardData.totalBookings}</p>
          </div>
        </div>

        <div className="soft-card rounded-2xl flex p-4 pr-8">
          <img src={assets.totalRevenueIcon} alt="" className="max-sm:hidden h-10" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-primary text-lg">Total Revenue</p>
            <p className="text-slate-500 text-base">
              {currency} {dashboardData.totalRevenue}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl text-slate-900 font-medium">My Hotels</h2>
          <button
            onClick={() => setShowHotelReg(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-primary/90 transition-all"
          >
            Add Hotel
          </button>
        </div>

        <div className="w-full max-w-4xl text-left soft-card rounded-2xl overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-gray-800 font-medium">Name</th>
                <th className="py-3 px-4 text-gray-800 font-medium">City</th>
                <th className="py-3 px-4 text-gray-800 font-medium">Contact</th>
                <th className="py-3 px-4 text-gray-800 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {ownerHotels.map((hotel) => (
                <tr key={hotel._id}>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{hotel.name}</td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{hotel.city}</td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{hotel.contact}</td>
                  <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center">
                    <button
                      onClick={() => updateHotel(hotel)}
                      className="px-3 py-1 rounded-lg bg-sky-100 text-sky-700 mr-2 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteHotel(hotel._id)}
                      className="px-3 py-1 rounded bg-red-100 text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {ownerHotels.length === 0 && (
                <tr>
                  <td className="py-4 px-4 text-gray-500" colSpan={4}>
                    No hotels added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-xl text-slate-900 font-medium mb-5">Recent Bookings</h2>
      <div className="w-full max-w-4xl text-left soft-card rounded-2xl max-h-80 overflow-y-scroll">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">User Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Hotel</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Room</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Qty</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {dashboardData.bookings.map((item) => (
              <tr key={item._id}>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.user?.username || "-"}</td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.hotel?.name || "-"}</td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.room?.roomType || "-"}</td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">{item.roomsBooked}</td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 text-center">
                  {currency} {item.totalPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
