import React, { useState, useEffect } from "react";
import axios from "axios";
import './Search.css'
const Search = ({ onSelectCustomer }) => {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Debounce functionality
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        handleSearch();
      } else {
        setCustomers([]); // Clear results if query is empty
      }
    }, 1000); // Wait for 1 second

    return () => clearTimeout(delayDebounceFn); // Cleanup on component unmount or when query changes
  }, [query]); // Run effect whenever query changes

  const handleSearch = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await axios.post("http://localhost:4000/api/search", {
        query,
        email
      });
      setCustomers(response.data.invoices || []); // Adjusted to match the API response structure
      // console.log(response);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleRowClick = (customer) => {
    onSelectCustomer(customer); // Pass selected customer data to the parent
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search by name, phone, invoice ID"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSearchPerformed(false);
        }}
        className="search-input"
      />
      <div className="results-container">
        {customers.length > 0 ? (
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Invoice ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={index} onClick={() => handleRowClick(customer)}> {/* Handle row click */}
                  <td>{customer.to}</td> {/* Changed to 'to' to match API response */}
                  <td>{customer.phone}</td>
                  <td>{customer.address}</td>
                  <td>{customer.invoiceId}</td>
                  <td>{new Date(customer.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          searchPerformed && <p>No customers found</p>
        )}
      </div>
    </div>
  );
};

export default Search;
