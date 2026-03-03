import React from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useEffect } from 'react'

const Layout = () => {

  const { isOwner, navigate, user, ownerHotels, ownerDataLoaded } = useAppContext()
  useEffect(()=>{
    if(ownerDataLoaded && (!user || (!isOwner && ownerHotels.length === 0))){
      navigate('/')
    }
  },[isOwner, navigate, user, ownerHotels, ownerDataLoaded])
  
  return (
    <div className='flex flex-col min-h-screen bg-slate-50/60'>
        <Navbar />
        <div className='flex-1 p-4 pt-10 md:px-10 lg:px-14 overflow-y-auto'>
          <Outlet/>
        </div>
    </div>
  )
}

export default Layout
