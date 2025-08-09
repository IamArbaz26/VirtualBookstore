import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const CommunityPostForm = () => {
  const [content, setContent] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to post.");
      return;
    }
    await addDoc(collection(db, "community_posts"), {
      userId: user.uid,
      content,
      timestamp: serverTimestamp(),
    });
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea
        placeholder="Share something with the community..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default CommunityPostForm; 