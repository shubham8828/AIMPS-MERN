import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Users.css"; // External CSS
import Spinner from "../Component/Spinner";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get("http://localhost:4000/api/users", {
        headers,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    finally{
      setLoading(false)
    }
  };


  const handleEdit = (user) => {
    navigate("/user/edit", { state: user });
  };

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.delete(`http://localhost:4000/api/deleteuser/${id}`, {
        headers,
      });

      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    finally{
      setLoading(false)
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

  if(loading)
  {
    return <Spinner />
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
            id='search'
            onChange={(e) => setSearchQuery(e.target.value)}
            className="users-search-bar"
          />
        </div>
        {filteredUsers.length === 0 && (
          <div className="no-users">No users available</div>
        )}
        {filteredUsers.length > 0 && (
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
                    <td style={{textTransform:'capitalize'}}>{user.name}</td>
                    <td style={{textTransform:'lowercase'}}>{user.email}</td>
                    <td style={{textTransform:'capitalize'}}>{user.address?.city || "N/A"}</td>
                    <td style={{textTransform:'capitalize'}}>{user.address?.state || "N/A"}</td>
                    <td style={{textTransform:'capitalize'}}>{user.address?.country || "N/A"}</td>
                    <td style={{textTransform:'capitalize'}}>{user.address?.localArea || "N/A"}</td>
                    <td>{user.address?.pin || "N/A"}</td>
                    <td>
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
    </div>
  );
};

export default Users;
