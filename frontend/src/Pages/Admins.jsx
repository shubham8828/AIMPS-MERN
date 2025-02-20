import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Admins.css";
import Spinner from "../Component/Spinner";

const Admins = () => {
  const [Users, setUsers] = useState([]); // Initialize with an empty array
  const [currUser, setCurrUser] = useState(null); // Current logged-in user (initialize with null)
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    fetchUsers();
  }, []); // Ensures fetchUsers runs only when the component mounts.

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersResponse = await axios.get("http://localhost:4000/api/users", {
        headers,
      });
      setUsers(usersResponse.data.users);
      setCurrUser(usersResponse.data.user);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Edit functionality
  const handleEdit = (admin) => {
    if (!currUser || currUser.role !== "root") {
      toast.error("Contact to Root Admin", { position: "top-center" });
      navigate("/message");
      return;
    }

    // Ensure admin data exists
    if (!admin) {
      console.error("Admin data is missing or undefined");
      return;
    }
    navigate("/admin/edit", { state: admin });
  };

  const handleDelete = async (admin) => {
    if (!currUser || currUser.role !== "root") {
      if (admin.role === "root") {
        toast.error("You Can't Root Admin");
        return;
      }

      toast.error("Contact to Root Admin", { position: "top-center" });
      navigate("/message");
      return;
    }
    if ((admin.role === "root" && currUser) || currUser.role === "root") {
      toast.error("You Can't Detele Your Self ");
      return;
    }

    console.log("Delete functionality not yet implemented.", index);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="main-container">
      <div className="admin-container">
        <div className="admin-search-bar-group">
          <h2 className="admin-header">Admins</h2>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Email</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Access</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Users.length > 0 ? (
                Users.filter(
                  (user) => user.role === "root" || user.role === "admin"
                ).map((admin, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td style={{ textTransform: "lowercase" }}>
                      {admin.email}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {admin.name}
                    </td>
                    <td>{admin.phone}</td>
                    <td>
                      {admin.role === "root" ? "Full Access" : "Users Access"}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {admin.role}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(admin)}
                        className="admin-edit-btn"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(admin)}
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admins;
