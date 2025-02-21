import React, { useState, useRef } from "react";
import defaultProfile from "../asset/logo.png"; // Replace with the path to your default profile image
import axios from "axios";
import ImageCompressor from "image-compressor.js"; // For image compression
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Spinner from "../Component/Spinner.jsx";
import "../Component/AuthForm.css";

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

const roles = ["user", "admin", "root"];

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
      country: "", // Fixed to India
      pin: "",
    },
    role: "",
  });

  const navigate = useNavigate();
  const imageRef = useRef();

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
    console.log(formData);

    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      shopname: formData.shopname || "AIMPS",
      address: {
        ...formData.address,
        localArea: formData.address.localArea,
        city: formData.address.city,
        state: formData.address.state,
        country: formData.address.country,
        pin: formData.address.pin,
      },
    };
    console.log(payload);

    try {
      const url = "http://localhost:4000/api/register";
      await axios.post(url, payload);
      toast.success("Admin Added Successfully", { position: "top-center" });
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
        role: "",
      });
      navigate("/admins");
    } catch (error) {
      toast.error(error.response?.data?.msg || "An error occurred", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerImageUpload = () => {
    imageRef.current.click();
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="auth-container">
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Add User </h2>
        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="on"
              placeholder="Enter your name"
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
              autoComplete="email"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              placeholder="Enter your email"
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
              autoComplete="tel"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
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
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              title="Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
              placeholder="Enter a strong password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {formData.role === "user" && (
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
                autoComplete="organization"
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
              autoComplete="street-address"
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
              autoComplete="address-level2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <select
              name="state"
              id="state"
              value={formData.address.state}
              onChange={handleChange}
              required
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
            <label htmlFor="country">Country</label>
            <select
              name="address.country"
              id="country"
              value={formData.address.country}
              onChange={handleChange}
              required
              autoComplete="country"
            >
              <option value="India">India</option>
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
          <div className="form-group" style={{display:'flex',flexDirection:'column', alignItems:'center'}}>
          <button type="submit" className="addAdmin">
            Add User
          </button>
        </div>
        </form>
        
      </div>
    </div>
  );
};

export default AddAdmin;
