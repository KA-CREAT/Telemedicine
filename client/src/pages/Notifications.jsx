import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import "../styles/notification.css";
import "../styles/user.css";

import Empty from "../components/Empty";
// import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";

import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";

const SOCKET_SERVER_URL = "http://localhost:5015";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 8;

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const socket = useRef(null);
  const navigate = useNavigate();

  const getAllNotif = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(
        `/notification/getallnotifs?page=${currentPage - 1}&limit=${notificationsPerPage}`
      );
      dispatch(setLoading(false));
      setNotifications(temp);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllNotif();
  }, [currentPage]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    socket.current = io(SOCKET_SERVER_URL);

    socket.current.emit("join-user-room", userId);

    socket.current.on("incoming-call", ({ roomId }) => {
      const newCallNotification = {
        _id: `incoming-call-${Date.now()}`,
        content:
          "📞 Your doctor is calling. Click 'Accept Call' to join the consultation.",
        updatedAt: new Date().toISOString(),
        isIncomingCall: true,
        roomId,
      };

      setNotifications((prev) => [newCallNotification, ...prev]);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const handleAcceptCall = (roomId) => {
    navigate(`/consultation/${roomId}`);
  };

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={i === currentPage ? "active" : ""}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Notifications</h2>

          {notifications.length > 0 ? (
            <div className="notifications">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Content</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotifications.map((ele, i) => (
                    <tr key={ele._id}>
                      <td>{(currentPage - 1) * notificationsPerPage + i + 1}</td>
                      <td>
                        {ele.roomId ? (
                          <a
                            href="#"
                            className="notif-link"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/consultation/${ele.roomId}`);
                            }}
                            title="Click to join consultation"
                          >
                            {ele.content}
                          </a>
                        ) : (
                          ele.content
                        )}
                      </td>
                      <td>{ele.updatedAt?.split("T")[0]}</td>
                      <td>{ele.updatedAt?.split("T")[1]?.split(".")[0]}</td>
                      <td>
                        {ele.isIncomingCall && (
                          <button
                            className="accept-btn"
                            onClick={() => handleAcceptCall(ele.roomId)}
                          >
                            ✅ Accept Call
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">{renderPagination()}</div>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      {/* <Footer /> */}
    </>
  );
};

export default Notifications;
