import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgetPassword.css";
import axios from 'axios';
import toast from 'react-hot-toast'
const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit  =() => {
    if (!email) {
      setError("Email is required!");
    } else if (!validateEmail(email)) {
      setError("Enter a valid email address!");
    } else {
      setError("");
      const newUser=false;
      axios.post('https://aimps-server.vercel.app/api/send-otp',{email,newUser})
      .then(()=>{
        toast.success("OTP sent successfully",{position:'top-center'});
        const data=email;
        navigate("/otp-verification", { state: { data }, replace: true });
      })
      .catch((err)=>{
        toast.error("Email does not exist!",{position:'top-center'});
        navigate('/register',{replace:true})

      })
    }
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-box">
        <h2>Reset Password</h2>
        <p>Enter your email address to receive an OTP</p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={error ? "error-input" : ""}
        />
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleSubmit}>Send OTP</button>
      </div>
    </div>
  );
};

export default ForgetPassword;
