import React, { useState } from "react";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import Search from "../Component/Search.jsx";
import Spinner from "../Component/Spinner.jsx";
import './NewInvoices.css'

const NewInvoices = () => {
  const [to, setTo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(0);
  const [productList, setProductList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addProduct = () => {
    // Validate product fields
    if (!name.trim()) {
      toast.error("Product name cannot be empty.", { position: "top-center" });
      return;
    }
  
    if (!price || price <= 0) {
      toast.error("Price must be a positive number.", { position: "top-center" });
      return;
    }
  
    if (!quantity || quantity <= 0) {
      toast.error("Quantity must be a positive number.", { position: "top-center" });
      return;
    }
  
    if (discount < 0) {
      toast.error("Discount cannot be negative.", { position: "top-center" });
      return;
    }
  
    if (gst < 0) {
      toast.error("GST cannot be negative.", { position: "top-center" });
      return;
    }
  
    // Calculate discount and GST
    const discountedPrice = price - (price * (discount / 100));
    const gstAmount = discountedPrice * (gst / 100);
    const totalPrice = (discountedPrice + gstAmount) * quantity;
  
    const newProduct = {
      id: productList.length + 1,
      name,
      price,
      quantity,
      discount,
      gst,
      totalPrice,
    };
  
    const updatedProductList = [...productList, newProduct];
    setProductList(updatedProductList);
  
    // Update the total invoice amount
    const newTotal = updatedProductList.reduce((acc, item) => acc + item.totalPrice, 0);
    setTotal(newTotal);
  
    // Clear product input fields
    setName("");
    setPrice("");
    setQuantity(1);
    setDiscount(0);
    setGst(0);
  };
  
  const handleSaveData = async () => {
    // Validate required fields
    if (!to.trim()) {
      toast.error("Recipient name cannot be empty.", { position: "top-center" });
      return;
    }
  
    if (!phone || phone.trim().length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.", { position: "top-center" });
      return;
    }
  
    if (!address.trim()) {
      toast.error("Address cannot be empty.", { position: "top-center" });
      return;
    }
  
    // Check if at least one product is added
    if (productList.length === 0) {
      toast.error("Please add at least one product to the invoice.", { position: "top-center" });
      return;
    }
  
    const formData = {
      to,
      phone,
      address,
      products: productList,
      total,
    };
  
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      setLoading(true);
      const response = await axios.post('http://localhost:4000/api/create', formData, { headers });
      toast.success(response.data.msg, { position: 'top-center' });
  
      // Clear the form after successful submission
      setTo("");
      setPhone("");
      setAddress("");
      setProductList([]);
      setTotal(0);
      setName("");
      setPrice(0);
      setQuantity(1);
      setDiscount(0);
      setGst(0);
      setLoading(false);
  
      navigate("/payments", { state: response.data.invoice });
    } catch (error) {
      setLoading(false);
      toast.error("There was an error saving the invoice.", { position: "top-center" });
    }
  };
  
  const handleSelectCustomer = (customer) => {
    setTo(customer.to);
    setPhone(customer.phone);
    setAddress(customer.address);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <Search onSelectCustomer={handleSelectCustomer} />

      <div className="new-invoice-container">
        <div className="header-row">
          <p className="new-invoice-heading">New Invoice</p>
          <button type="button" onClick={handleSaveData} className="add-btn">
            Save Data
          </button>
        </div>

        <form className="new-invoice-form">
          <div className="first-row">
            <input
              placeholder="To"
              onChange={(e) => setTo(e.target.value)}
              value={to}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^\d{0,10}$/.test(inputValue)) {
                  setPhone(inputValue);
                }
              }}
              value={phone}
              required
              maxLength={10}
              pattern="\d{10}"
              title="Please enter a valid 10-digit phone number"
            />
            <input
              placeholder="Address"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              required
            />
          </div>

          <div className="first-row">
            <input
              placeholder="Product Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              title="Product Name"
              required
            />
            <input
              placeholder="Price"
              type="number"
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              value={price}
              required
              min="0"
              title="Price"
            />
            <input
              type="number"
              placeholder="Quantity"
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              value={quantity}
              required
              min="1"
              title="Quantity"

            />
          </div>
          <div className="first-row">
            <input
              placeholder="Discount (%)"
              type="number"
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              value={discount}
              required
              title="Discount (%)"

              min="0"
            />
            <input
              type="number"
              placeholder="GST (%)"
              onChange={(e) => setGst(parseFloat(e.target.value))}
              value={gst}
              required
              title="GST (%)"

              min="0"
            />
          </div>

          <button type="button" onClick={addProduct} className="add-btn">
            Add Product
          </button>
        </form>

        {productList.length > 0 && (
          <div className="product-wrapper">
            <div className="product-list">
              <p>Sr No.</p>
              <p>Product Name</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Discount (%)</p>
              <p>GST (%)</p>
              <p>Total Price</p>
            </div>

            {productList.map((product, index) => (
              <div key={index} className="product-list">
                <p>{index + 1}</p>
                <p>{product.name}</p>
                <p>{product.price}</p>
                <p>{product.quantity}</p>
                <p>{product.discount}</p>
                <p>{product.gst}</p>
                <p>{product.totalPrice.toFixed(2)}</p>
              </div>
            ))}

            <div className="total-wrapper">
              <p>Total: Rs. {total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewInvoices;
