"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { MessageCircle, Heart, Plus, User, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { db } from "../../firebase"
import { collection, addDoc, serverTimestamp, doc, onSnapshot, query, orderBy, getDocs, updateDoc, increment, deleteDoc } from "firebase/firestore"

// Mock community posts
const mockPosts = [
  {
    id: 1,
    author: "Fatima Khan",
    authorType: "user",
    timestamp: "2 hours ago",
    content:
      "Just finished reading 'Umrao Jan Ada' and I'm absolutely mesmerized! The way Mirza Hadi Ruswa portrays the complexity of human emotions is incredible. What are your thoughts on this masterpiece?",
    likes: 24,
    comments: 8,
    liked: false,
  },
  {
    id: 2,
    author: "Ahmed Ali",
    authorType: "author",
    timestamp: "5 hours ago",
    content:
      "Working on my new novel about modern Pakistan. It's challenging to balance traditional values with contemporary issues. Any fellow writers here who've faced similar challenges?",
    likes: 18,
    comments: 12,
    liked: true,
  },
  {
    id: 3,
    author: "Zara Ahmed",
    authorType: "user",
    timestamp: "1 day ago",
    content:
      "Looking for recommendations for books similar to Saadat Hasan Manto's work. I love his raw, honest portrayal of society. Any suggestions?",
    likes: 31,
    comments: 15,
    liked: false,
  },
  {
    id: 4,
    author: "Dr. Hassan Mahmood",
    authorType: "author",
    timestamp: "2 days ago",
    content:
      "Excited to announce that my latest book 'Shadows of History' is now available on Bookish! It explores the untold stories of partition through the eyes of common people.",
    likes: 45,
    comments: 22,
    liked: true,
  },
]

const mockComments = {
  1: [
    {
      id: 1,
      author: "Ali Raza",
      content: "Completely agree! The character development is phenomenal.",
      timestamp: "1 hour ago",
      replies: [
        {
          id: 11,
          author: "Fatima Khan",
          content: "Thanks Ali! Which character did you find most compelling?",
          timestamp: "45 minutes ago",
          replyTo: "Ali Raza",
        },
      ],
    },
    {
      id: 2,
      author: "Sana Malik",
      content: "This book changed my perspective on classical Urdu literature.",
      timestamp: "30 minutes ago",
      replies: [],
    },
  ],
  2: [
    {
      id: 3,
      author: "Nadia Sheikh",
      content: "I faced the same challenge in my debut novel. Happy to discuss!",
      timestamp: "3 hours ago",
      replies: [],
    },
  ],
}

// Add this helper function
function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach(comment => {
    map[comment.id] = { ...comment, replies: [] };
  });
  comments.forEach(comment => {
    if (comment.parentCommentId) {
      map[comment.parentCommentId]?.replies.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });
  return roots;
}

// Recursive comment node component
const CommentNode = ({ comment, postId, handleAddComment, replyingTo, setReplyingTo, newComment, setNewComment, user, openAuthModal }) => {
  return (
    <div className="space-y-3 ml-0" style={{ marginLeft: comment.parentCommentId ? 32 : 0 }}>
      {/* Main Comment */}
      <div className="flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-base font-bold text-white">{comment.author?.charAt(0).toUpperCase() || "U"}</span>
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-gray-900">{comment.author}</span>
              <span className="text-xs text-gray-500">
                {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : ""}
              </span>
            </div>
            {comment.replyTo && (
              <p className="text-xs text-teal-600 mb-1">Replying to @{comment.replyTo}</p>
            )}
            <p className="text-sm text-gray-800">{comment.content}</p>
          </div>
          <button
            onClick={() => setReplyingTo((prev) => ({ ...prev, [`${postId}-${comment.id}`]: !prev[`${postId}-${comment.id}`] }))}
            className="text-xs text-teal-600 hover:text-teal-700 mt-1 ml-3"
          >
            Reply
          </button>
        </div>
      </div>
      {/* Reply Input */}
      {replyingTo[`${postId}-${comment.id}`] && (
        <div className="flex space-x-3 ml-8">
          <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment[`${postId}-${comment.id}`] || ""}
                onChange={(e) =>
                  setNewComment((prev) => ({
                    ...prev,
                    [`${postId}-${comment.id}`]: e.target.value,
                  }))
                }
                placeholder={`Reply to ${comment.author}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={() => handleAddComment(postId, comment.id, comment.author)}
                disabled={!newComment[`${postId}-${comment.id}`]?.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Render Replies */}
      {comment.replies && comment.replies.map(reply => (
        <CommentNode
          key={reply.id}
          comment={reply}
          postId={postId}
          handleAddComment={handleAddComment}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          newComment={newComment}
          setNewComment={setNewComment}
          user={user}
          openAuthModal={openAuthModal}
        />
      ))}
    </div>
  );
};

export default function Community() {
  const [posts, setPosts] = useState(mockPosts)
  const [newPost, setNewPost] = useState("")
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState({})
  const [replyingTo, setReplyingTo] = useState({})
  const { user, openAuthModal } = useAuth()

  // Fetch posts from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const post = { id: docSnap.id, ...docSnap.data() };
        // Fetch comments for each post
        const commentsSnapshot = await getDocs(collection(db, "community_posts", docSnap.id, "comments"));
        post.commentsList = commentsSnapshot.docs.map(c => ({ id: c.id, ...c.data() }));
        return post;
      }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!user) {
      openAuthModal("signin")
      return
    }

    if (newPost.trim()) {
      const post = {
        author: user.name,
        authorEmail: user.email,
        authorType: user.type ? (user.type === "reader" ? "user" : user.type) : "user",
        content: newPost,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        liked: false,
      }
      // Save to Firestore
      const docRef = await addDoc(collection(db, "community_posts"), post);
      setPosts([{ ...post, id: docRef.id, timestamp: "Just now" }, ...posts])
      setNewPost("")
    }
  }

  const handleLike = async (postId) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    const postRef = doc(db, "community_posts", postId);
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    // Toggle like (for demo, just increment/decrement likes)
    await updateDoc(postRef, {
      likes: post.liked ? increment(-1) : increment(1),
              liked: !post.liked,
    });
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleAddComment = async (postId, parentCommentId = null, replyToAuthor = null) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    const commentText = newComment[`${postId}-${parentCommentId || "main"}`];
    if (commentText && commentText.trim()) {
      const newCommentObj = {
        author: user.name,
        authorEmail: user.email,
        content: commentText,
        createdAt: serverTimestamp(),
        replyTo: replyToAuthor,
        parentCommentId: parentCommentId || null,
      };
      await addDoc(collection(db, "community_posts", postId.toString(), "comments"), newCommentObj);
      // Increment comments count in post
      await updateDoc(doc(db, "community_posts", postId.toString()), { comments: increment(1) });
      setNewComment((prev) => ({ ...prev, [`${postId}-${parentCommentId || "main"}`]: "" }));
      setReplyingTo((prev) => ({ ...prev, [`${postId}-${parentCommentId}`]: false }));
    }
  };

  const toggleReply = (postId, commentId) => {
    setReplyingTo((prev) => ({
      ...prev,
      [`${postId}-${commentId}`]: !prev[`${postId}-${commentId}`],
    }))
  }

  // Add delete comment function
  const handleDeleteComment = async (postId, commentId, commentAuthor) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    if (user.name !== commentAuthor && user.email !== commentAuthor) {
      alert("You can only delete your own comments.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    await deleteDoc(doc(db, "community_posts", postId.toString(), "comments", commentId));
    await updateDoc(doc(db, "community_posts", postId.toString()), { comments: increment(-1) });
  };

  const handleEditComment = async (postId, commentId, newContent) => {
    if (!user) {
      openAuthModal("signin");
      return;
    }
    await updateDoc(doc(db, "community_posts", postId.toString(), "comments", commentId), {
      content: newContent,
      editedAt: serverTimestamp(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with fellow book lovers, share your thoughts, and discover new perspectives on Pakistani literature
            and beyond.
          </p>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={
                  user
                    ? "Share your thoughts about books, authors, or literature..."
                    : "Sign in to share your thoughts..."
                }
                disabled={!user}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows="3"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                  {user
                    ? `Posting as ${user.name} (${user.type === "reader" ? "user" : user.type})`
                    : "Please sign in to post"}
                </span>
                <button
                  onClick={handleCreatePost}
                  disabled={!user || !newPost.trim()}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{post.author?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : post.timestamp || ""}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      post.liked ? "text-red-600" : "text-gray-500 hover:text-red-600"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${post.liked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-teal-600 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                    {showComments[post.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Comments Container with Fixed Height */}
                  <div className="max-h-96 overflow-y-auto mb-4 space-y-3">
                    {post.commentsList && buildCommentTree(post.commentsList).map((comment) => (
                      <CommentNode
                        key={comment.id}
                        comment={comment}
                        postId={post.id}
                        handleAddComment={handleAddComment}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        user={user}
                        openAuthModal={openAuthModal}
                      />
                      ))}
                  </div>

                  {/* Add Main Comment */}
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newComment[`${post.id}-main`] || ""}
                          onChange={(e) => setNewComment((prev) => ({ ...prev, [`${post.id}-main`]: e.target.value }))}
                          placeholder={user ? "Write a comment..." : "Sign in to comment"}
                          disabled={!user}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!user || !newComment[`${post.id}-main`]?.trim()}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  )
}
