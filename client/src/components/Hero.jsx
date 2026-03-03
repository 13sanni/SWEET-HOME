import React, { useEffect } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import heroImage from "../assets/heroimg3.jpg";

const Hero = () => {
  const { user, getToken, axios, setSearchedCities } = useAppContext();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const destination = searchParams.get("destination") || "";
  const checkInDate = searchParams.get("checkInDate") || "";
  const checkOutDate = searchParams.get("checkOutDate") || "";
  const roomsRequested = searchParams.get("roomsRequested") || 1;

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  const onSearch = async (e) => {
    e.preventDefault();

    if (!destination || !checkInDate || !checkOutDate || new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error("Please fill all fields correctly.");
      return;
    }

    navigate(
      `/rooms?destination=${destination}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomsRequested=${roomsRequested}`
    );

    if (user) {
      try {
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchedCity: destination },
          { headers: { Authorization: `Bearer ${await getToken()}` } }
        );

        setSearchedCities((prev) => {
          const updated = [...prev, destination];
          if (updated.length > 3) updated.shift();
          return updated;
        });
      } catch {
        toast.error("Search saved locally, but failed to sync recent searches.");
      }
    }
  };

  useEffect(() => {
    setSearchParams({});
    scrollTo(0, 0);
  }, [setSearchParams]);

  return (
    <section className="relative min-h-screen flex items-center px-6 md:px-16 lg:px-24 xl:px-32 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/55 to-slate-800/20" />
      </div>

      <div className="relative w-full max-w-6xl pt-24 md:pt-28">
        <p className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white px-4 py-1.5 rounded-full text-sm tracking-wide">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Curated Stays Worldwide
        </p>
        <h1 className="font-playfair text-4xl sm:text-5xl lg:text-7xl leading-tight text-white max-w-3xl mt-5">
          Book Signature Hotels With Smart Room Inventory.
        </h1>
        <p className="max-w-2xl mt-4 text-sm md:text-base text-slate-100/90">
          Find high-quality properties, compare room categories, and reserve the exact number of rooms you need.
        </p>

        <form onSubmit={onSearch} className="glass-panel rounded-2xl p-4 md:p-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label htmlFor="destinationInput" className="text-sm text-slate-700">
                Destination
              </label>
              <div className="mt-1.5 relative">
                <img src={assets.locationIcon} alt="" className="h-4 absolute left-3 top-3.5 opacity-70" />
                <input
                  onChange={(e) => updateParam("destination", e.target.value)}
                  value={destination}
                  list="destinations"
                  id="destinationInput"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-white/90 pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Type city"
                  required
                />
              </div>
              <datalist id="destinations">
                {cities.map((city, i) => (
                  <option key={i} value={city} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="checkInDate" className="text-sm text-slate-700">
                Check in
              </label>
              <input
                id="checkInDate"
                value={checkInDate}
                onChange={(e) => updateParam("checkInDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                type="date"
                required
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 mt-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label htmlFor="checkOutDate" className="text-sm text-slate-700">
                Check out
              </label>
              <input
                id="checkOutDate"
                value={checkOutDate}
                onChange={(e) => updateParam("checkOutDate", e.target.value)}
                min={checkInDate}
                disabled={!checkInDate}
                type="date"
                required
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 mt-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="roomsRequested" className="text-sm text-slate-700">
                Rooms
              </label>
              <input
                name="roomsRequested"
                value={roomsRequested}
                onChange={(e) => updateParam("roomsRequested", e.target.value)}
                type="number"
                min="1"
                required
                id="roomsRequested"
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 mt-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <button className="mt-4 w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-6 text-white cursor-pointer hover:bg-slate-700 transition-all">
            <img src={assets.searchIcon} alt="searchIcon" className="h-5 invert" />
            <span>Search Rooms</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default Hero;
