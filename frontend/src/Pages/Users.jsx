import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaCloudDownloadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Users.css"; // External CSS
import Spinner from "../Component/Spinner";
import * as XLSX from "xlsx";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get("https://aimps-server.vercel.app/api/users", {
        headers,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    navigate("/user/edit", { state: user });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`https://aimps-server.vercel.app/api/deleteuser/${id}`, {
        headers,
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      user.role === "user" &&
      (user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.address?.city?.toLowerCase().includes(query) ||
        user.address?.state?.toLowerCase().includes(query) ||
        user.address?.country?.toLowerCase().includes(query) ||
        user.address?.localArea?.toLowerCase().includes(query) ||
        user.address?.pin?.toString().includes(query) ||
        (users.indexOf(user) + 1).toString().includes(query))
    );
  });

  const downloadUserData = (users) => {
    if (!Array.isArray(users) || users.length === 0) {
      console.error("No users found.");
      return;
    }

    setLoading(true);

    const customerData = users.map((user) => ({
      "User ID": user._id?.$oid || "N/A",
      Name: user.name || "N/A",
      Email: user.email || "N/A",
      Phone: user.phone || "N/A",
      "Local Area": user.address?.localArea || "N/A",
      City: user.address?.city || "N/A",
      State: user.address?.state || "N/A",
      Country: user.address?.country || "N/A",
      Pin: user.address?.pin || "N/A",
      Role: user.role || "N/A",
      "Created At": new Date(user.createdAt).toLocaleDateString() || "N/A",
    }));

    const wb = XLSX.utils.book_new();
    const customerSheet = XLSX.utils.json_to_sheet(customerData);
    XLSX.utils.book_append_sheet(wb, customerSheet, "User Data");
    XLSX.writeFile(wb, `User-Data.xlsx`);

    setLoading(false);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="user-container">
        <div className="users-search-bar-group">
          <h1 className="users-table-header">Users</h1>
          <input
            type="text"
            placeholder="Search by Name, Email, City, State, etc."
            value={searchQuery}
            id="search"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="users-search-bar"
          />
        </div>
        {filteredUsers.length === 0 ? (
          <div className="no-users">No users available</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Local Area</th>
                  <th>Pin Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td style={{ textTransform: "capitalize" }}>{user.name}</td>
                    <td style={{ textTransform: "lowercase" }}>{user.email}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {user.address?.city || "N/A"}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {user.address?.state || "N/A"}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {user.address?.country || "N/A"}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {user.address?.localArea || "N/A"}
                    </td>
                    <td>{user.address?.pin || "N/A"}</td>
                    <td style={{ display: "flex" }}>
                      <button
                        className="users-edit-btn"
                        onClick={() => handleEdit(user)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="users-delete-btn"
                        onClick={() => handleDelete(user._id)}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button
        className="download-btn"
        title="Click to download user data"
        onClick={() => downloadUserData(users)}
      >
        <FaCloudDownloadAlt />
      </button>
    </div>
  );
};

export default Users;
