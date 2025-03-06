import React, { useState, useRef, useEffect } from "react";
import defaultProfile from "../asset/logo.png"; // Replace with your default profile image path
import axios from "axios";
import ImageCompressor from "image-compressor.js"; // For image compression
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Spinner from "../Component/Spinner.jsx";
import "./AddUser.css";

const statesOfIndia = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const AddAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shopname: "",
    email: "",
    phone: "",
    password: "",
    image: "",
    address: {
      localArea: "",
      city: "",
      state: "",
      country: "",
      pin: "",
    },
    role: "user",
  });

  const navigate = useNavigate();
  const imageRef = useRef();

  // Handle input changes and image compression
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      new ImageCompressor(files[0], {
        quality: 0.6,
        success: (compressedResult) => {
          const fileReader = new FileReader();
          fileReader.onloadend = () => {
            setFormData({ ...formData, image: fileReader.result });
          };
          fileReader.readAsDataURL(compressedResult);
        },
        error(e) {
          console.log(e.message);
        },
      });
    } else if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      shopname: formData.shopname || "AIMPS",
      address: {
        localArea: formData.address.localArea || "",
        city: formData.address.city || "",
        state: formData.address.state || "",
        country: formData.address.country || "",
        pin: formData.address.pin || "",
      },
    };
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const email = formData.email;
    axios
      .post("https://aimps-server.vercel.app/api/user/add/sendOtp", { email }, {headers})
      .then((res) => {
        toast.success("OTP sent successfully", { position: "top-center" });
        navigate("/user/add/otp-verification", { state: {payload} , replace: true });
      })
      .catch(() => {
        toast.error("Email allready exist", { position: "top-center" });
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setLoading(false);
        // resetForm();
      });
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: "",
      shopname: "",
      email: "",
      phone: "",
      password: "",
      image: "",
      address: {
        localArea: "",
        city: "",
        state: "",
        country: "",
        pin: "",
      },
      role: "user",
    });
  };

  const triggerImageUpload = () => {
    imageRef.current.click();
  };

  // Redirect to home on back navigation
  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="auth-container">
        <h2 className="modern-title">Add User</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <p className="form-label center-text">Profile Image</p>
            <div className="profile-image" onClick={triggerImageUpload}>
              <img
                src={formData.image || defaultProfile}
                alt="Profile"
                className="profile-pic"
              />
            </div>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleChange}
              ref={imageRef}
              style={{ display: "none" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setFormData({ ...formData, name: inputValue });
              }}
              required
              minLength={3}
              maxLength={50}
              autoComplete="on"
              placeholder="Enter your name"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Mobile No.
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^0-9]/g, "");
                if (inputValue.length <= 10) {
                  setFormData({ ...formData, phone: inputValue });
                }
              }}
              required
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              autoComplete="tel"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={20}
              autoComplete="current-password"
              placeholder="Enter a strong password"
              className="modern-input"
            />
          </div>

          {formData.role === "user" && (
            <div className="form-group">
              <label htmlFor="shopname" className="form-label">
                Shop Name
              </label>
              <input
                type="text"
                name="shopname"
                id="shopname"
                value={formData.shopname}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setFormData({ ...formData, shopname: inputValue });
                }}
                required
                minLength={3}
                maxLength={50}
                autoComplete="organization"
                className="modern-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="localArea" className="form-label">
              Local Area
            </label>
            <input
              type="text"
              name="address.localArea"
              id="localArea"
              value={formData.address.localArea}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setFormData({
                  ...formData,
                  address: { ...formData.address, localArea: inputValue },
                });
              }}
              required
              autoComplete="street-address"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City
            </label>
            <input
              type="text"
              name="address.city"
              id="city"
              value={formData.address.city}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: inputValue },
                });
              }}
              required
              autoComplete="address-level2"
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.state" className="form-label">
              State
            </label>
            <select
              name="address.state"
              id="state"
              value={formData.address.state}
              onChange={handleChange}
              required
              className="modern-input"
            >
              <option value="">Select State</option>
              {statesOfIndia.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="country" className="form-label">
              Country
            </label>
            <select
              name="address.country"
              id="country"
              value={formData.address.country}
              onChange={handleChange}
              required
              autoComplete="country"
              className="modern-input"
            >
              <option value="">Select Country</option>
              <option value="India">India</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pin" className="form-label">
              PIN
            </label>
            <input
              type="text"
              name="address.pin"
              id="pin"
              value={formData.address.pin}
              required
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^0-9]/g, "");
                if (inputValue.length <= 6) {
                  setFormData({
                    ...formData,
                    address: { ...formData.address, pin: inputValue },
                  });
                }
              }}
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="postal-code"
              className="modern-input"
            />
          </div>

          <div className="form-group center-text">
            <button type="submit" className="modern-btn">
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
