import React from 'react';
import DoctorCard from './DoctorCard';
import profile1 from './assets/profile-1.jpg';
import profile2 from './assets/profile-2.jpg';
import profile3 from './assets/profile-3.jpg';
import profile4 from './assets/profile-4.jpg';
import './style/Doctors.css'; // Assuming you have a CSS file for styling

function Doctors() {
  return (
    <div className="doctor-section" id="doctors">
      <div className="dt-title-content">
        <h3 className="dt-title">
          <span>Meet Our Doctors</span>
        </h3>
        <p className="dt-description">
          Meet our exceptional team of specialist doctors, dedicated to
          providing top-notch healthcare services at Health Plus. Trust in their
          knowledge and experience to lead you towards a healthier and happier
          life.
        </p>
      </div>

      <div className="dt-cards-content">
        <DoctorCard
          img={profile1}
          name="Dr. Kathryn Murphy"
          title="General Surgeon"
          stars={4.9}
          reviews={1800}
        />
        <DoctorCard
          img={profile2}
          name="Dr. Jacob Jones"
          title="Hematologist"
          stars={4.8}
          reviews={700}
        />
        <DoctorCard
          img={profile3}
          name="Dr. Jenny Wilson"
          title="Endocrinologist"
          stars={4.7}
          reviews={450}
        />
        <DoctorCard
          img={profile4}
          name="Dr. Albert Flores"
          title="Hematologist"
          stars={4.8}
          reviews={500}
        />
      </div>
    </div>
  );
}

export default Doctors;