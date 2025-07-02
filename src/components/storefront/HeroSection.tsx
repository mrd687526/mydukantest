import React from "react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg overflow-hidden mb-10">
      <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Welcome to My Dukan!</h1>
          <p className="text-lg md:text-xl mb-6">Discover the best deals, new arrivals, and trending products. Shop now and enjoy exclusive offers!</p>
          <a href="#products" className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow hover:bg-blue-50 transition">Shop Now</a>
        </div>
        <div className="hidden md:block md:w-1/2">
          <img src="/hero-banner.png" alt="Featured Products" className="w-full h-auto object-cover rounded-lg shadow-lg" />
        </div>
      </div>
    </section>
  );
} 