import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const DonationForm = () => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to donate.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "donations"), {
        userId: user.uid,
        amount: parseFloat(amount),
        message,
        timestamp: serverTimestamp(),
      });
      setAmount("");
      setMessage("");
      alert("Thank you for your donation!");
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="1"
      />
      <textarea
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Donating..." : "Donate"}
      </button>
    </form>
  );
};

export default DonationForm; 