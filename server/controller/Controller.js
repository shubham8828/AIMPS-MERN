import Invoice from "../model/InvoiceSchema.js";
import User from "../model/User.js";
import Message from "../model/Message.js";
import bcrypt from "bcrypt"; // To hash the password
import cloudinary from "../cloudinary.js";
import Payment from "../model/payment.js";
import jwt from "jsonwebtoken";
import { validateUser ,updateUserValidater } from "../Middleware/UserValidater.js";



// ---------------------- Register API --------------------------

export const register = async (req, res) => {
  try {
    // Validate user input using Joi schema
    const { error, value } = validateUser(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        msg: "Validation error",
        details: error.details.map((e) => e.message),
      });
    }

    const { email, name, address, password, image, phone, shopname, role } = value;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    // Process address (ensure all address fields are present)
    const formattedAddress = {
      localArea: address.localArea.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      country: address.country.trim(),
      pin: address.pin.trim(),
    };

    // Optional image upload
    let imageUrl = "";
    if (image) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          upload_preset: "eeeghag0",
          public_id: `${email}_avatar`,
          allowed_formats: ["png", "jpg", "jpeg", "svg"],
        });
        imageUrl = uploadResult.secure_url || "";
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(500).json({
          msg: "Image upload failed. Please try again later.",
        });
      }
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance
    const newUser = new User({
      email,
      name,
      phone,
      address: formattedAddress,
      shopname,
      password: hashedPassword,
      image: imageUrl,
      role,
    });

    // Save the user in the database
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respond with success
    res.status(200).json({
      msg: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        shopname: newUser.shopname,
        role: newUser.role,
        address: newUser.address,
        image: newUser.image,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ msg: "Database validation error", details: err.errors });
    }

    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// -------------------- LOGIN API ----------------------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      image: user.image,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d", // Set the expiration time
    });

    // Return a success response with the token and user data
    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        image: user.image,
        role: user.role,
      }, // Only return necessary user fields
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Something went wrong. Please try again later." });
  }
};


// -------------------------------- Update API For User -----------------------------


export const update = async (req, res) => {
  try {
  
    const { email, name, address, image, phone, shopname,role} = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required to update user details" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (shopname) user.shopname = shopname;
    if (role) user.role = role;

    // Update address if provided
    if (address && typeof address === "object") {
      const { city, state, pin, localArea, country } = address;
      if (!user.address) user.address = {}; // Ensure the address object exists
      if (city) user.address.city = city;
      if (state) user.address.state = state;
      if (pin) user.address.pin = pin;
      if (country) user.address.country = country;
      if (localArea) user.address.localArea = localArea;
    }

    // Handle image upload/update
    if (image) {
      if (typeof image !== "string") {
        return res.status(400).json({ msg: "Invalid image format" });
      }

      const isAlreadyUploaded = image.startsWith("http");

      if (!isAlreadyUploaded) {
        try {
          const uploadResult = await cloudinary.uploader.upload(image, {
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "default_preset",
            public_id: `${email}_avatar`,
            overwrite: true,
            allowed_formats: ["png", "jpg", "jpeg", "svg"],
          });

          if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).json({ msg: "Image upload failed" });
          }

          user.image = uploadResult.secure_url;
        } catch (cloudError) {
          console.error("Cloudinary upload error:", cloudError);
          return res.status(500).json({ msg: "Error uploading image to Cloudinary" });
        }
      } else {
        user.image = image;
      }
    }

    // Save the updated user data
    await user.save();

    // Return success response
    return res.status(200).json({ msg: "User updated successfully", user });
  } catch (error) {
    console.error("Error in update API:", error.message);

    // Return a generic error response
    return res.status(500).json({ msg: "Internal Server Error. Please try again later." });
  }
};


// ---------------- Get Current User API ----------------------------

export const getUser = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ msg: "Invalid request: User information is missing" });
    }

    const email = req.user.email;

    // Find the user in the database
    const user = await User.findOne({ email });

    if (user) {
      // Respond with the user data, excluding sensitive fields like password
      return res.status(200).json({ 
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          image: user.image,
          role: user.role,
        },
      });
    } else {
      return res.status(404).json({ msg: "User not found" });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error in getUser API:", error.message);

    // Respond with a generic error message
    return res.status(500).json({ msg: "Internal Server Error. Please try again later." });
  }
};


// ------------------------ Get All Users API For Admin ----------------------

export const getUsers = async (req, res) => {
  try {
    // Step 1: Ensure `req.user` is available and has the necessary role
    const user = req.user;
    if (!user) {
      return res.status(403).json({ message: "This endpoint is only for Admins" });
    }

    // Step 2: Fetch all users from the database
    const users = await User.find();

    // Step 3: Handle case where no users are found
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // Step 4: Send the list of users along with the requesting user's information
    return res.status(200).json({ users, user });
  } catch (error) {

    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// --------------------- Delete User API for Admin or Root -------------------------------

export const deleteUser = async (req, res) => {
  const { id } = req.params; // Extract user ID from URL parameters

  try {
    if (!id) {
      return res.status(400).json({ message: "Invalid request: User ID is required" });
    }

    // Step 1: Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const email = deletedUser.email; // Extract the email of the deleted user

    // Step 2: Find all invoices created by the deleted user's email
    const invoices = await Invoice.find({ email });
    const invoiceIds = invoices.map(invoice => invoice.invoiceId); // Collect all invoice IDs

    // Step 3: Delete all payments associated with the invoice IDs
    if (invoiceIds.length > 0) {
      await Payment.deleteMany({ invoiceId: { $in: invoiceIds } });
    }

    // Step 4: Delete the invoices
    if (invoices.length > 0) {
      await Invoice.deleteMany({ email });
    }

    // Step 5: Delete all messages associated with the user's email
    const messagesDeleted = await Message.deleteMany({ email });

    // Send a success response
    res.status(200).json({
      message: "User and associated data deleted successfully",
      details: {
        invoicesDeleted: invoices.length,
        paymentsDeleted: invoiceIds.length,
        messagesDeleted: messagesDeleted.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error deleting user and associated data:", error);

    // Handle unexpected errors gracefully
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};







// --------------------------- Create New Invoice or Bill -----------------------------------

export const newInvoive = async (req, res) => {
  try {
    const { to, phone, address, products, total} = req.body;
    const email=req.user.email;
    const newInvoice = new Invoice({
      to,
      phone,
      address,
      products, 
      total,
      email
    });
    await newInvoice.save();
    res
      .status(200)
      .json({ msg: "Invoice created successfully", invoice: newInvoice });

  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// ------------------------  Get All Invoice created by one user or All For user or admin ---------------------

export const invoices = async (req, res) => {
  try {
    // Validate the presence of required user details
    const user = req.user;
    if (!user || !user.email || !user.role) {
      return res.status(400).json({ msg: "Invalid request: Missing user information" });
    }

    const { email, role } = user;

    // Fetch invoices based on the user's role
    let invoices = [];
    if (role === "root" || role === "admin") {
      invoices = await Invoice.find(); // Fetch all invoices for admin/root
    } else {
      invoices = await Invoice.find({ email }); // Fetch user-specific invoices
    }

    // Check if invoices exist
    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ msg: "No invoices found" });
    }

    // Send successful response
    res.status(200).json({ invoices, user });
  } catch (error) {
    console.error("Error fetching invoices:", error);

    // Send error response
    res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

// ---------------------- Invoice Delete API for user or Admin -----------------------------

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params; // Extract the invoice ID from URL parameters

    // Validate the presence of the ID
    if (!id) {
      return res.status(400).json({ message: "Invalid request: Invoice ID is required" });
    }

    // Step 1: Find and delete the invoice by ID
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Step 2: Find and delete the associated payment by invoice ID
    const deletedPayment = await Payment.findOneAndDelete({ invoiceId: deletedInvoice.invoiceId });
   

    // Return success response
    return res.status(200).json({
      msg: "Invoice and associated payment deleted successfully",
      deletedInvoice,
      deletedPayment,
    });
  } catch (error) {

    // Return a detailed error response
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// Update the invoice

export const updateInvoice = async (req, res) => {
  const { id, ...updatedInvoiceData } = req.body;

  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      updatedInvoiceData, 
      { new: true } 
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res
      .status(200)
      .json({
        message: "Invoice updated successfully",
        invoice: updatedInvoice,
      });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




// ---------------------------------- Search Customer By Name --------------------------------------


export const searchCustomer = async (req, res) => {
  try {
    const { query, email } = req.body;

    // Step 1: Validate required fields
    if (!email) {
      return res.status(400).json({ msg: "Missing user email" });
    }

    // Step 2: Fetch invoices based on email
    const invoices = await Invoice.find({ email });

    if (!invoices.length) {
      return res.status(200).json({ invoices: [] }); // No invoices found for the user
    }

    // Step 3: If no query is provided, return all invoices with selected fields
    if (!query) {
      const selectedFields = invoices.map((invoice) => ({
        invoiceId: invoice.invoiceId,
        to: invoice.to,
        phone: invoice.phone,
        email: invoice.email, // Include email in the response
        address: invoice.address, // Include address in the response
        total: invoice.total,
        date: invoice.date,
      }));
      return res.status(200).json({ invoices: selectedFields });
    }

    // Step 4: Perform a search with the query
    const searchRegex = new RegExp(query, "i");

    const filteredInvoices = invoices
      .filter((invoice) => {
        return (
          (invoice.to && searchRegex.test(invoice.to)) || // Match 'to' field
          (invoice.phone && searchRegex.test(invoice.phone)) || // Match 'phone' field
          (invoice.invoiceId && searchRegex.test(invoice.invoiceId)) || // Match 'invoiceId' field
          (invoice.email && searchRegex.test(invoice.email)) || // Match 'email' field
          (invoice.address && searchRegex.test(invoice.address)) // Match 'address' field
        );
      })
      .map((invoice) => ({
        invoiceId: invoice.invoiceId,
        to: invoice.to,
        phone: invoice.phone,
        email: invoice.email, // Include email in the response
        address: invoice.address, // Include address in the response
        total: invoice.total,
        date: invoice.date,
      }));

    // Step 5: Return the filtered results
    return res.status(200).json({ invoices: filteredInvoices });
  } catch (error) {
    console.error("Error in searchCustomer API:", error);

    // Return a detailed error response
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};



//------------------------------- Save Payment Data API ------------------------------

export const makePayment = async (req, res) => {
  try {
    const {
      paymentId,
      customerName,
      amount,
      currency,
      paymentStatus,
      paymentDate,
      paymentMethod,
      invoiceId,
      remarks,
      cardDetails,
    } = req.body.transactionData;

    // Validate required fields
    if (
      !paymentId ||
      !customerName ||
      !amount ||
      !currency ||
      !paymentStatus ||
      !paymentDate ||
      !paymentMethod ||
      !invoiceId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Construct the payment object
    const paymentData = {
      paymentId,
      customerName,
      amount,
      currency,
      paymentStatus,
      paymentDate,
      paymentMethod,
      invoiceId,
      remarks,
    };

    // Add card details only if the payment method is 'Card'
    if (paymentMethod === "Card") {
      if (
        !cardDetails ||
        !cardDetails.cardNumber ||
        !cardDetails.expiry ||
        !cardDetails.cvv
      ) {
        return res
          .status(400)
          .json({ error: "Missing card details for Card payment method" });
      }
      paymentData.cardDetails = {
        cardNumber: cardDetails.cardNumber,
        expiryDate: cardDetails.expiry,
        cvv: cardDetails.cvv,
      };
    }

    // Save the payment record to the database
    const paymentRecord = new Payment(paymentData);
    await paymentRecord.save();

    // Respond to the client
    res.status(201).json({
      message: "Payment processed successfully",
      data: paymentRecord,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to process payment" });
  }
};

// ----------------------- Return Payment Data Or List ------------------------------------

export const getUserPayments = async (req, res) => {
  const { email, role } = req.user; // Extract email and role from the user object.

  try {
    let combinedData = [];
    let payments = [];
    let invoices = [];

    if (role === "root" || role === "admin") {
      invoices = await Invoice.find(); 
    } else if (role === "user") {
      invoices = await Invoice.find({ email }); 
    }

    if (invoices.length === 0) {
      return res
        .status(404)
        .json({ message: "No invoices found. " });
    }

    // Fetch all payments matching the user's invoice IDs.
    const invoiceIds = invoices.map((invoice) => invoice.invoiceId);
    payments = await Payment.find({ invoiceId: { $in: invoiceIds } });

    const paymentMap = new Map(payments.map((payment) => [payment.invoiceId, payment]));

    // Combine invoice and payment data for both users (admin/root or user).
    combinedData = invoices.map((invoice) => {
      const payment = paymentMap.get(invoice.invoiceId);
      if (payment) {
        // If a payment exists for this invoice, use the payment data and add phone number.
        return {
          ...payment._doc, // Ensure you get the plain document
          customerPhone: invoice.phone || "N/A",
        };
      } else {
        // If no payment exists, create a "pending" payment object with invoice details.
        return {
          invoiceId: invoice.invoiceId,
          paymentId: "N/A",
          customerName: invoice.to || "N/A",
          customerPhone: invoice.phone || "N/A",
          amount: invoice.total || "N/A",
          currency: "INR",
          paymentStatus: "Pending",
          paymentDate: "N/A",
          paymentMethod: "N/A",
          cardDetails: "N/A",
        };
      }
    });

    // Return the combined data
    res.status(200).json({
      message: "Payments fetched successfully.",
      data: combinedData,
    });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({
      message: "An error occurred while fetching user payments.",
      error: error.message, // Provide error message for better debugging
    });
  }
};



// ------------------ Find Invoice By Invoice ID ----------------
export const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.body; 

    if (!invoiceId) {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    const invoice = await Invoice.findOne({invoiceId });
    const user=await User.findOne({email:invoice.email})
    const payment=await Payment.findOne({invoiceId:invoice.invoiceId})

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    return res.status(200).json({ invoice,user,payment });
  } catch (error) {

    return res.status(500).json({
      message: "Server error",
      error: error.message || "Unknown error",
    });
  }
};

// ------------------ Find Payment Data By Invoice ID ----------------

export const getPaymentData = async (req, res) => {
  const { invoiceId } = req.body; // Extract invoiceId from the request body

  // Check if the invoiceId is provided in the request body
  if (!invoiceId) {
    return res.status(400).json({ message: "Invoice ID is required" });
  }

  try {
    // Find the payment data using the invoiceId
    const payment = await Payment.findOne({ invoiceId });

    // If no payment is found, return 404 status with a message
    if (!payment) {
      return res.status(404).json({ message: "Payment data not found for the provided invoice ID" });
    }

    // Return the found payment data
    return res.status(200).json(payment);
  } catch (error) {
    // Log the error and return a 500 status if the database query fails
    console.error("Error fetching payment data:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the payment data.",
      error: error.message || "Unknown error",
    });
  }
};


// --------------------------- Get all messages of one conversation---------------------

export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    // Check if any required field is missing
    if (!sender || !receiver) {
      return res.status(400).json({ error: "Missing Sender or Receiver" });
    }

    // Find an existing conversation between sender and receiver
    let conversation = await Message.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender },
      ],
    });

    if (conversation) {
      // Return the existing conversation
      return res.status(200).json({ conversation });
    } else {
      // Find the root admin user
      const root = await User.findOne({ role: "root" });

      // Logic for creating a new conversation
      let newConversation;

      if (root && root.email === receiver) {
        // Create a conversation with a welcome message for root admin
        newConversation = {
          sender: sender,
          receiver: receiver,
          message: [
            {
              sender: root.email,
              msg: "Welcome to AIMPS!",
              createdAt: new Date(),
            },
          ],
        };
      } else {
        // Create an empty conversation if not root admin
        newConversation = {
          sender: sender,
          receiver: receiver,
          message: [],
        };
      }

      // Save the new conversation in the database
      conversation = new Message(newConversation);
      await conversation.save();

      return res.status(201).json({ conversation });
    }
  } catch (error) {
    console.error("Error fetching or creating conversation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// -------------------- Customer Support API -------------------------

export const newMessages = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    console.log(message)
    // Check if any required field is missing
    if (!sender || !receiver ) {
      return res.status(400).json({ error: "Missing Sender, Receiver, or Message" });
    }

    // Find an existing conversation between sender and receiver
    let conversation = await Message.findOne({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender }
      ]
    });


    // If conversation exists, add the new message to the conversation's message array
    if (conversation) {
      const currentTime = new Date(); // Create a valid Date object

      // Add each message to the conversation
      if(message.length === 0 ){
          return res.status(500).json({error:" Message Cant Empty"})
      }else{

      
      message.forEach(msg => {
        conversation.message.push({
          msg: msg.msg,
          createdAt: currentTime, // Store a Date object
          sender: msg.sender
        });
      });
    }

      // Save the updated conversation
      await conversation.save();
      return res.status(200).json({ message: 'Message(s) added to existing conversation' });
    } else {
      // If no conversation exists, create a new conversation
      const currentTime = new Date(); // Create a valid Date object

      const newConversation = new Message({
        sender,
        receiver,
        message: message.map(msg => ({
          msg: msg.msg,
          createdAt: currentTime, // Store a Date object
          sender: msg.sender
        }))
      });

      // Save the new conversation
      await newConversation.save();
      return res.status(201).json({ message: 'New conversation created and message(s) added' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error adding message', details: error.message });
  }
};



