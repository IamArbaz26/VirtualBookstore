import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const PaymentForm = () => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to make a payment.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "payments"), {
        userId: user.uid,
        amount: parseFloat(amount),
        method,
        note,
        timestamp: serverTimestamp(),
      });
      setAmount("");
      setMethod("");
      setNote("");
      alert("Payment data stored successfully!");
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
      <select value={method} onChange={e => setMethod(e.target.value)} required>
        <option value="">Select Payment Method</option>
        <option value="credit_card">Credit Card</option>
        <option value="bank_transfer">Bank Transfer</option>
        <option value="cash">Cash</option>
        <option value="other">Other</option>
      </select>
      <textarea
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Submit Payment"}
      </button>
    </form>
  );
};

export default PaymentForm; 