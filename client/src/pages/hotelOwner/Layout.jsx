import React from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
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
    <div className='flex flex-col h-screen'>
        <Navbar />
        <div className='flex h-full'>
          <Sidebar/>
          <div className='flex-1 p-4 pt-10 md:px-16'>
            <Outlet/>
          </div>
        </div>
    </div>
  )
}

export default Layout
