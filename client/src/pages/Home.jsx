import Hero from "../components/home/Hero";
import Info from "../components/home/Info";
import About from "../components/home/About";
// import BookAppointment from "../../component/home/BookAppointment";
import Reviews from "../components/home/Reviews";
import Doctors from "../components/home/Doctors";
import Footer from "../components/home/Footer";
import Navbar from "../components/Navbar";
// import HomeCircles from "../components/HomeCircles";
import Contact from "../components/Contact";
const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
    
      <Info />
       <About />
      {/* <HomeCircles /> */}
      <Doctors />
      <Reviews />
      
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
