import React, { useRef, useEffect } from 'react'
import Hero from '../components/Hero'
import FeaturedDestination from '../components/FeaturedDestination'
import ExclusiveOffer from '../components/ExclusiveOffer'
import Testimonial from '../components/Testimonial'
import NewsLetter from '../components/NewsLetter'
import RecommendedHotels from '../components/RecommendedHotels'
import { useLocation } from 'react-router-dom'

const Home = () => {
  const testimonialRef = useRef(null);
  const newsletterRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#testimonials' && testimonialRef.current) {
      testimonialRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (location.hash === '#newsletter' && newsletterRef.current) {
      newsletterRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <Hero />
      <RecommendedHotels />
      <FeaturedDestination />
      <ExclusiveOffer />
      
      {/* Testimonials Section */}
      <div ref={testimonialRef} id="testimonials">
        <Testimonial />
      </div>

      {/* Newsletter Section */}
      <div ref={newsletterRef} id="newsletter">
        <NewsLetter />
      </div>
    </>
  )
}

export default Home
