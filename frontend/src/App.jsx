import React, { useEffect, useState} from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";

const Navbar = React.lazy(() => import("./Component/Navbar.jsx"));
const LandingPage = React.lazy(() => import("./Pages/LandingPage.jsx"));
const Contact = React.lazy(() => import("./Pages/Contact.jsx"));
const Invoices = React.lazy(() => import("./Pages/Invoices.jsx"));
const NewInvoices = React.lazy(() => import("./Pages/NewInvoices.jsx"));
const Profile = React.lazy(() => import("./Pages/Profile.jsx"));
const AuthForm = React.lazy(() => import("./Component/AuthForm.jsx"));
const Home = React.lazy(() => import("./Pages/Home.jsx"));
const InvoiceDetails = React.lazy(() => import("./Component/InvoiceDetails.jsx"));
const About = React.lazy(() => import("./Pages/About.jsx"));
const Footer = React.lazy(() => import("./Pages/Footer.jsx"));
const Payment = React.lazy(() => import("./Pages/Payment.jsx"));
const PaymentList = React.lazy(() => import("./Pages/PaymentList.jsx"));
const Message = React.lazy(() => import("./Pages/Message.jsx"));
const Users = React.lazy(() => import("./Pages/Users.jsx"));
const Admins = React.lazy(() => import("./Pages/Admins.jsx"));
const AddUser = React.lazy(() => import("./Pages/AddUser.jsx"));
const Team = React.lazy(() => import("./Pages/Team.jsx"));
const EditUser = React.lazy(() => import("./Pages/EditUser.jsx"));

const App = () => {

const [token, setToken] = useState(localStorage.getItem('token') || null);
const [userRole, setUserRole] = useState(null); // Store the actual role

useEffect(() => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    setToken(storedToken);

    axios.get("http://localhost:4000/api/user", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((response) => {
        const { user } = response.data;
        setUserRole(user.role); // Save the actual role (e.g., "admin" or "root")
      })
      .catch((error) => {
        console.error("Error fetching user role:", error);
        setUserRole(null); // Fallback to no role
      });
  }
}, []);

  
const PrivateRoute = ({ children, allowedRoles }) => {
  if (!token) {
    return <Navigate to="/" />;
  }
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  return children;
};

  return (
    <BrowserRouter>
        <Navbar setToken={setToken}>
          <Routes>
            <Route path="/" element={!token ? <LandingPage /> : <Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/login" element={<AuthForm setToken={setToken} />} />
            <Route path="/register" element={<AuthForm setToken={setToken} />} />
            <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/invoices" element={<PrivateRoute><Invoices /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute allowedRoles={["admin", "root"]}><Users /></PrivateRoute>} />
            <Route path="/admins" element={<PrivateRoute allowedRoles={["admin", "root"]}><Admins /></PrivateRoute>} />
            <Route path="/adduser" element={<PrivateRoute allowedRoles={["root"]}><AddUser/></PrivateRoute>} />
            <Route path="/admin/edit" element={<PrivateRoute allowedRoles={["root"]}><EditUser /></PrivateRoute>} />
            <Route path="/user/edit" element={<PrivateRoute allowedRoles={["admin", "root"]}><EditUser /></PrivateRoute>} />
            <Route path="/new-invoice" element={<PrivateRoute><NewInvoices /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/invoice-details" element={<PrivateRoute><InvoiceDetails /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><Payment /></PrivateRoute>} />
            <Route path="/payment-details" element={<PrivateRoute><PaymentList /></PrivateRoute>} />
            <Route path="/message" element={<PrivateRoute><Message /></PrivateRoute>} />
          </Routes>
        </Navbar>
        <Footer />
    </BrowserRouter>
  );
};

export default App;
