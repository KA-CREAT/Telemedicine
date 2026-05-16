import React, { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import Navbar from "../components/Navbar";
import "../styles/doctors.css";
import fetchData from "../helper/apiCall";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/reducers/rootSlice";
import Empty from "../components/Empty";
import DoctorSearchPage from "../components/DoctorSearch"; // ✅ Import search component

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null); // ✅ For search errors
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const fetchAllDocs = async () => {
    dispatch(setLoading(true));
    const data = await fetchData(`/doctor/getalldoctors`);
    setDoctors(data);
    dispatch(setLoading(false));
  };

  useEffect(() => {
    fetchAllDocs();
  }, []);

  return (
    <>
      <Navbar />
      {loading && <Loading />}
      {!loading && (
        <section className="container doctors">
          {/* ✅ Include search bar */}
          <DoctorSearchPage
            setDoctors={setDoctors}
            setLoading={(val) => dispatch(setLoading(val))}
            setError={setError}
          />

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}

          {doctors.length > 0 ? (
            <div className="doctors-card-container">
              {doctors.map((ele) => (
                <DoctorCard ele={ele} key={ele._id} />
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
    </>
  );
};

export default Doctors;
