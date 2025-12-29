import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

function Home() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const properties = [
    {
      city: "Bengaluru",
      type: "2BHK",
      price: "₹18,000",
      features: "No brokerage"
    },
    {
      city: "Coimbatore", 
      type: "3BHK",
      price: "₹12,000",
      features: "Semi furnished"
    },
    {
      city: "Indore",
      type: "1BHK", 
      price: "₹8,000",
      features: "Near metro"
    },
    {
      city: "Nagpur",
      type: "2BHK",
      price: "₹10,000", 
      features: "Parking available"
    },
    {
      city: "Trivandrum",
      type: "3BHK",
      price: "₹15,000",
      features: "Sea view"
    },
    {
      city: "Jaipur",
      type: "1BHK",
      price: "₹9,000",
      features: "Gated community"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollCarousel = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % properties.length
      : (currentIndex - 1 + properties.length) % properties.length;
    setCurrentIndex(newIndex);
    updateCarouselPosition(newIndex);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    updateCarouselPosition(index);
  };

  const updateCarouselPosition = (index) => {
    if (carouselRef.current) {
      const carousel = carouselRef.current.querySelector('.flex');
      carousel.style.transform = `translateX(-${index * 100}%)`;
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      scrollCarousel('next');
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        {/* Left Content */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Rent smart, Live better with 
          </h1>

          <p className="mt-5 text-gray-600 text-lg">
            Find verified rentals with{" "}
            <span className="font-medium text-black">
              zero hidden charges
            </span>
            , transparent pricing, and instant booking.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 border border-black rounded-lg hover:bg-black hover:text-white transition"
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Visual - Carousel */}
        <div className="hidden md:flex justify-center">
          <div className="relative w-80">
            <div ref={carouselRef} className="overflow-hidden rounded-2xl">
              <div className="flex transition-transform duration-500 ease-in-out">
                {properties.map((property, index) => (
                  <div key={index} className="min-w-full">
                    <div className="bg-black rounded-2xl shadow-xl p-6 w-80">
                      <div className="h-40 bg-gray-800 rounded-lg mb-4" />
                      <h3 className="font-semibold text-lg text-white">{property.type} • {property.city}</h3>
                      <p className="text-gray-300 text-sm mt-1">
                        {property.price} / month • {property.features}
                      </p>
                      <button className="mt-4 w-full bg-[#26f50c] text-black py-2 rounded-lg font-semibold hover:bg-[#26f50c]/90 transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Controls */}
            <button 
              onClick={() => scrollCarousel('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 text-white p-2 rounded-full hover:bg-black transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scrollCarousel('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 text-white p-2 rounded-full hover:bg-black transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {properties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentIndex ? 'bg-[#26f50c]' : 'bg-gray-400 hover:bg-[#26f50c]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
