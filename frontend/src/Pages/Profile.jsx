import React, { useEffect, useState, useRef } from "react";
import {useNavigate} from 'react-router-dom'
import axios from "axios";
import ImageCompressor from "image-compressor.js"; // For image compression
import toast from "react-hot-toast";
import "./Profile.css";
import Spinner from "../Component/Spinner";

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

const Profile = () => {
  const [user, setUser] = useState(null); // Store user data
  const [formData, setFormData] = useState({}); // Store form data
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const imageRef = useRef();

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://aimps-server.vercel.app/api/user", {
        headers,
      });

      setUser(res.data.user);
      setFormData(res.data.user);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUserData();

    
    const handlePopState = () => {
      // When a popstate event occurs, redirect to /home
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

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
          console.error(e.message);
        },
      });
    } else {
      const keys = name.split(".");
      if (keys.length > 1) {
        setFormData({
          ...formData,
          [keys[0]]: { ...formData[keys[0]], [keys[1]]: value },
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put("https://aimps-server.vercel.app/api/update", formData, {
        headers,
      });
      toast.success("Profile updated successfully", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to update profile", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  if (!validateEmail(formData.email)) {
    toast.error("Invalid email address", { position: "top-center" });
    setLoading(false);
    return;
  }
  
  const triggerImageUpload = () => {
    imageRef.current.click();
  };

  if (!user) {
    return <Spinner />;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="profile-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}> Profile</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <p style={{ textAlign: "center" }}>Profile Image</p>
            <div className="profile-image">
              <img
                src={formData.image || defaultProfile}
                alt="Profile"
                className="profile-pic"
                onClick={triggerImageUpload}
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
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                setFormData({ ...formData, name: inputValue });
              }}
              required
              minLength={3}
              maxLength={50}
              autoComplete="name"
              placeholder="Enter your name"
              style={{textTransform:'capitalize'}}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="on"
              placeholder="Enter your email"
              readOnly

            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile No.</label>
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
              autoComplete="on"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input type="text" value={formData.role} readOnly 
              style={{textTransform:'capitalize'}} id="role" name="role"/>
          </div>
          {formData.user === "user" && (
            <div className="form-group">
              <label htmlFor="shopname">Shop Name</label>
              <input
                type="text"
                name="shopname"
                id="shopname"
                value={formData.shopname}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                  setFormData({ ...formData, shopname: inputValue });
                }}
                required
                minLength={3}
                maxLength={50}
                autoComplete="on"
              style={{textTransform:'capitalize'}}

              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="localArea">Local Area</label>
            <input
              type="text"
              name="address.localArea"
              id="localArea"
              value={formData.address.localArea}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                setFormData({
                  ...formData,
                  address: { ...formData.address, localArea: inputValue },
                });
              }}
              required
              style={{textTransform:'capitalize'}}
              autoComplete="on"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              name="address.city"
              id="city"
              value={formData.address.city}
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
                setFormData({
                  ...formData,
                  address: { ...formData.address, city: inputValue },
                });
              }}
              required
              style={{textTransform:'capitalize'}}
              autoComplete="on"
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <select
              name="address.state"
              id="state"
              value={formData.address.state}
              onChange={handleChange}
              required
            >
              <option value={formData ?formData.address.state :""}> {formData ?formData.address.state :"Select State"}</option>
              {statesOfIndia.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select
              name="address.country"
              id="country"
              value={formData.address.country}
              onChange={handleChange}
              required
              autoComplete="country"
            >
              <option value={formData ?formData.address.country :"India"}>{formData ?formData.address.country :"India"}</option>
              <option value={"India"}>{"India"}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              type="text"
              name="address.pin"
              id="pin"
              value={formData.address.pin}
              required
              onChange={(e) => {
                const inputValue = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                if (inputValue.length <= 6) {
                  // Limit input to 6 characters
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      pin: inputValue, // Update the pin field correctly
                    },
                  });
                }
              }}
              pattern="[0-9]{6}" // Ensure exactly 6 digits
              maxLength={6}
              autoComplete="postal-code" // Suggest browser autocomplete for postal codes
            />
          </div>

          <button type="submit" className="submit-btn">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
