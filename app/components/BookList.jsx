import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ShoppingCart, Download, Star, Share2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "../../hooks/use-toast";
import { normalizeBookForCart } from '../../lib/utils';

const BookList = ({ books: booksProp }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({}); // { bookId: avgRating }
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const { user, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (booksProp) {
      setBooks(booksProp);
      setLoading(false);
    } else {
      const fetchBooks = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "books"));
          const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Only show books with cover in /images/ and not faisal.jpg or arbaz.jpg
          const filteredBooks = booksData.filter(book => {
            const hasValidCover = book.cover && book.cover.startsWith("/images/") &&
              !book.cover.includes("faisal.jpg") &&
              !book.cover.includes("arbaz.jpg");
            return hasValidCover;
          });
          setBooks(filteredBooks);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching books:", error);
          setLoading(false);
        }
      };
      fetchBooks();
    }
  }, [booksProp]);

  useEffect(() => {
    const fetchRatings = async () => {
      setRatingsLoading(true);
      const ratingsObj = {};
      await Promise.all(
        books.map(async (book) => {
          const reviewsSnap = await getDocs(collection(db, "books", book.id, "reviews"));
          const reviews = reviewsSnap.docs.map(doc => doc.data());
          const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) : 0;
          ratingsObj[book.id] = avg;
        })
      );
      setRatings(ratingsObj);
      setRatingsLoading(false);
    };
    if (books.length > 0) fetchRatings();
  }, [books]);

  const handleShare = (bookId) => {
    const url = `${window.location.origin}/book/${bookId}?action=add-to-cart`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out this book!',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Shareable link copied!', description: 'You can send this link to others.' });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
      <span className="text-gray-500 text-lg">Loading books...</span>
    </div>
  );

  return (
    <section className="py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">All Books</h2>
          <span className="text-gray-600">{books.length} books found</span>
        </div>
        <div className="grid gap-4 justify-center" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
        }}>
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full min-w-0 mx-auto"
              style={{ minHeight: 320, maxWidth: 320 }}
            >
              <Link href={`/book/${book.id}`} className="flex-1 flex flex-col h-full cursor-pointer">
                <div className="relative overflow-hidden aspect-[2/3] bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=300&width=200";
                    }}
                  />
                  {book.trending && (
                    <div className="absolute top-2 right-2 bg-teal-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Trending
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors text-base">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-3 w-fit">
                    {book.category}
                  </span>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      {ratingsLoading ? (
                        <span className="text-sm text-gray-400 ml-1">...</span>
                      ) : (
                        <span className="text-sm text-gray-600 ml-1">{ratings[book.id]?.toFixed(1) || "0.0"}</span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-teal-600">PKR {book.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{book.description}</p>
                </div>
              </Link>
              <div className="flex w-full p-5 pt-0 mt-auto gap-2">
                <button
                  className="w-1/2 flex items-center justify-center px-3 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm font-medium"
                  onClick={() => {
                    const normalizedBook = normalizeBookForCart(book, 1);
                    const result = addToCart(normalizedBook);
                    if (result === 'increased') {
                      toast({ title: 'Quantity increased', description: 'Book quantity increased in cart.' });
                    } else if (result === 'added') {
                      toast({ title: 'Added to cart', description: 'Book added to cart.' });
                    }
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </button>
                <button
                  className="w-1/2 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  onClick={() => handleShare(book.id)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
        {books.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adding some books to the database.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookList; 