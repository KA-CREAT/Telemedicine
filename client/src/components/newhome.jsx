// import React from "react";
import Hero from "../components/home/Hero";
import Info from "../component/home/Info";
import About from "../component/home/About";
// import BookAppointment from "../../component/home/BookAppointment";
import Reviews from "../../component/home/Reviews";
import Doctors from "../../component/home/Doctors";
import Footer from "../../component/home/Footer";

function Home() {
  return (
    <div className="home-section">
      <Hero />
      <Info />
      <About />
      {/* <BookAppointment /> */}
      <Reviews />
      <Doctors />
      <Footer />
    </div>
  );
}

export default Home;
