import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaUserAlt,
  FaCog,
  FaFileInvoiceDollar,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaMoneyCheckAlt,
  FaUsers,
  FaComments,
} from "react-icons/fa";
import { RiUserAddFill,RiTeamLine ,RiAdminFill} from "react-icons/ri";

import { RiLogoutBoxRLine } from "react-icons/ri";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import './Navbar.css';

const Navbar = ({ children, setToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const toggle = () => setIsOpen(!isOpen);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const menuItem = [
    { path: "/", name: "Home", icon: <FaHome /> },
    { path: "/about", name: "About", icon: <FaInfoCircle /> },
    { path: "/contact", name: "Contact", icon: <FaEnvelope /> },
    { path: "/invoices", name: "Invoices", icon: <FaFileInvoiceDollar /> },
    { path: "/new-invoice", name: "New Invoice", icon: <FaFileInvoiceDollar /> },
    { path: "/users", name: "Users", icon: <FaUsers /> },
    { path: "/payment-details", name: "Payments", icon: <FaMoneyCheckAlt /> },
    { path: "/admins", name: "Admins", icon: <RiAdminFill/> },
    { path: "/adduser", name: "Add User", icon: <RiUserAddFill /> },
    { path: "/profile", name: "Settings", icon: <FaCog /> },
    { path: "/message", name: "Message", icon: <FaComments /> },
    { path: "/team", name: "My Team", icon: <RiTeamLine /> },
    { path: "/login", name: "Login", icon: <FaUserAlt /> },
  ];

  const logOut = () => {
    localStorage.clear();
    toast.success("Logout successful", { position: "top-center" });
    navigate("/");
    setToken(null);
  };

  const fetchUserData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(
        "http://localhost:4000/api/user", { headers }
      );
      if (response.status === 404) {
        localStorage.clear();
        navigate('/login');
      }

      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const filteredMenu = menuItem.filter(item => {
    if (!token) {
      return !["/dashboard", "/invoices", "/new-invoice", "/profile", "/message", "/payment-details", "/users", "/admins","/adduser"].includes(item.path);
    }
    if (user?.role === "root") {
      return !["/contact", "/login", "/new-invoice"].includes(item.path);
    }
    if (user?.role === "admin") {
      return !["/contact", "/login", "/new-invoice","/adduser"].includes(item.path);
    }
    if (user?.role === "user") {
      return !["/users", "/admins", "/login", "/contact","/adduser"].includes(item.path);
    }
    return item.path !== "/login";
  });

  return (
    <div className="navbar">
      <div style={{ width: isOpen ? "200px" : "50px" }} className="sidebar">
        <div className="top_section">
          <div style={{ marginLeft: isOpen ? "0px" : "0px" }} className="bars">
            <FaBars onClick={toggle} />
          </div>
        </div>
        {isOpen && token && (
          <div className="userContainer">
            <img src={user.image} alt="User" />
            <span>{user.role}</span>
            <p>{user.name}</p>
          </div>
        )}
        {filteredMenu.map((item, index) => (
          <NavLink to={item.path} key={index} className="link" activeclassname="active">
            <div className="icon">{item.icon}</div>
            <div style={{ display: isOpen ? "block" : "none" }} className="link_text">{item.name}</div>
          </NavLink>
        ))}
        {token && (
          <div className="logout-main">
            <div className="logout-icon" onClick={logOut}><RiLogoutBoxRLine /></div>
            <div style={{ display: isOpen ? "block" : "none" }}>
              <button onClick={logOut} className="logout">Logout</button>
            </div>
          </div>
        )}
      </div>
      <main style={{ width: isOpen ? "calc(100% - 150px)" : "calc(100% - 50px)", transition: "width 1s ease-in-out" }}>
        {children}
      </main>
    </div>
  );
};

export default Navbar;
