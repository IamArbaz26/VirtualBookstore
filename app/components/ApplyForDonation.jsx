import React from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ApplyForDonation = ({ book }) => {
  const { user } = useAuth();

  const handleApply = async () => {
    if (!user) {
      alert("Please log in to apply for a donated book.");
      return;
    }
    await addDoc(collection(db, "donation_applications"), {
      userId: user.uid,
      userEmail: user.email,
      bookId: book.id,
      bookTitle: book.title,
      appliedAt: serverTimestamp(),
    });
    alert("Your application for this donated book has been submitted!");
  };

  return (
    <button onClick={handleApply} style={{ padding: 8, background: "#0070f3", color: "#fff", border: "none", borderRadius: 4 }}>
      Apply for Donation
    </button>
  );
};

export default ApplyForDonation;