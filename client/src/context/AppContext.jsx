import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

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

  const fetchAllRooms = async()=>{
        try {
            const {data} = await axios.get('/api/rooms/all')  
            if(data.success){
                setRooms(data.rooms)
            }else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  const fetchRoomsByDateRange = async () => {
    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");

    if (!checkInDate || !checkOutDate) return;

    try {
      const { data } = await axios.get("/api/rooms", {
        params: { checkInDate, checkOutDate },
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setRoomsByDateRange(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setIsOwner(data.role === "HotelOwner");
        setSearchedCities(data.recentSearchedCities);
      } else {
        setTimeout(() => {
          fetchUser();
        }, 5000);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [user]);

  useEffect(()=>{
    fetchAllRooms();
  },[])

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
    setRoomsByDateRange
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
