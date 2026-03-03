import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

const normalizeBackendUrl = (url = "") => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "").replace(/\/api$/i, "");
};

const backendUrl = normalizeBackendUrl(import.meta.env.VITE_BACKEND_URL || "");
axios.defaults.baseURL = backendUrl;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [searchParams] = useSearchParams();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomsByDateRange, setRoomsByDateRange] = useState([]);
  const [ownerHotels, setOwnerHotels] = useState([]);
  const [ownerDataLoaded, setOwnerDataLoaded] = useState(false);

  useEffect(() => {
    if (!backendUrl) {
      console.error("VITE_BACKEND_URL is missing");
      toast.error("Backend URL is missing. Set VITE_BACKEND_URL.");
      return;
    }
    console.log("API Base URL:", backendUrl);
  }, []);

  const fetchAllRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/all");
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchRoomsByDateRange = async () => {
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");

    if (!checkInDate || !checkOutDate) return;

    try {
      const { data } = await axios.get("/api/rooms", {
        params: { checkInDate, checkOutDate },
      });
      if (data.success) {
        setRoomsByDateRange(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setIsOwner(data.role === "HotelOwner");
        setSearchedCities(data.recentSearchedCities || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchOwnerHotels = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get("/api/hotels/owner", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setOwnerHotels(data.hotels || []);
        if ((data.hotels || []).length > 0) {
          setIsOwner(true);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    let active = true;

    const bootstrapUserData = async () => {
      if (user) {
        setOwnerDataLoaded(false);
        await fetchUser();
        await fetchOwnerHotels();
        if (active) {
          setOwnerDataLoaded(true);
        }
      } else {
        setIsOwner(false);
        setOwnerHotels([]);
        setSearchedCities([]);
        setOwnerDataLoaded(true);
      }
    };

    bootstrapUserData();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    fetchAllRooms();
  }, []);

  useEffect(() => {
    fetchRoomsByDateRange();
  }, [searchParams]);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
    fetchRoomsByDateRange,
    fetchUser,
    roomsByDateRange,
    setRoomsByDateRange,
    ownerHotels,
    setOwnerHotels,
    fetchOwnerHotels,
    fetchAllRooms,
    ownerDataLoaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
