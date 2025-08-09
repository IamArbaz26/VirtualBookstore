import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const CommunityPostList = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "community_posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleComment = async (postId, comment) => {
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    await addDoc(collection(db, "community_posts", postId, "comments"), {
      userId: user.uid,
      content: comment,
      timestamp: new Date(),
    });
  };

  return (
    <div>
      {posts.map(post => (
        <CommunityPost key={post.id} post={post} onComment={handleComment} />
      ))}
    </div>
  );
};

const CommunityPost = ({ post, onComment }) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "community_posts", post.id, "comments"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(post.id, comment);
      setComment("");
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
      <div><b>{post.userId}</b>: {post.content}</div>
      <div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button type="submit">Comment</button>
        </form>
        <div style={{ marginTop: 4 }}>
          {comments.map(c => (
            <div key={c.id}><i>{c.userId}</i>: {c.content}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPostList; 