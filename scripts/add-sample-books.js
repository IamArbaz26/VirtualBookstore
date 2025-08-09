import { db } from '../firebase.js';
import { collection, addDoc } from 'firebase/firestore';

const sampleBooks = [
  {
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    category: "Classic Fiction",
    rating: 4.8,
    price: 299,
    cover: "/images/A Tale of Two Cities by charles dickens.jpg",
    description: "A classic novel set in London and Paris during the French Revolution",
    trending: true,
    authorId: "sample-author-1"
  },
  {
    title: "Bagh o Bahar",
    author: "Amir Khusro",
    category: "Classic Literature",
    rating: 4.6,
    price: 350,
    cover: "/images/baagh o bahar by amir khusro.jpg",
    description: "A classic tale of adventure and romance",
    trending: false,
    authorId: "sample-author-2"
  },
  {
    title: "Dracula",
    author: "Bram Stoker",
    category: "Horror Fiction",
    rating: 4.9,
    price: 250,
    cover: "/images/draculabybramstoker-ezgif.com-webp-to-jpg-converter.jpg",
    description: "The classic vampire novel that defined the genre",
    trending: true,
    authorId: "sample-author-3"
  },
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    category: "Fantasy",
    rating: 4.7,
    price: 400,
    cover: "/images/harry potter and the chamber of secrets by j.k. rowling.png",
    description: "The second book in the Harry Potter series",
    trending: false,
    authorId: "sample-author-4"
  },
  {
    title: "Jinnah - His Successes, Failures and Role in History",
    author: "Istiaq Ahmed",
    category: "Biography",
    rating: 4.5,
    price: 275,
    cover: "/images/Jinnah - His Successes, Failures and Role in History by istiaq ahmed.jpeg",
    description: "A comprehensive biography of Pakistan's founder",
    trending: false,
    authorId: "sample-author-5"
  },
  {
    title: "Peer e Kaamil",
    author: "Umera Ahmed",
    category: "Contemporary Fiction",
    rating: 4.8,
    price: 325,
    cover: "/images/peer e kaamil by umera ahmed.jpg",
    description: "A spiritual journey of self-discovery",
    trending: true,
    authorId: "sample-author-6"
  },
  {
    title: "Rajagidh",
    author: "Bano Qudsia",
    category: "Contemporary Fiction",
    rating: 4.7,
    price: 380,
    cover: "/images/rajagidhbybanoqudsia-ezgif.com-webp-to-jpg-converter.jpg",
    description: "A masterpiece of Urdu literature",
    trending: false,
    authorId: "sample-author-7"
  },
  {
    title: "Romeo and Juliet",
    author: "William Shakespeare",
    category: "Classic Literature",
    rating: 4.9,
    price: 200,
    cover: "/images/Romeo and Juliet - William Shakespeare.jpg",
    description: "The timeless tale of star-crossed lovers",
    trending: true,
    authorId: "sample-author-8"
  },
  {
    title: "Sherlock Holmes",
    author: "Arthur Conan Doyle",
    category: "Mystery",
    rating: 4.6,
    price: 320,
    cover: "/images/sherlock holmes by arthur conan doyle.jpg",
    description: "The adventures of the world's greatest detective",
    trending: false,
    authorId: "sample-author-9"
  },
  {
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    category: "Children's Literature",
    rating: 4.5,
    price: 180,
    cover: "/images/the secret garden by frances hodgson burnett.png",
    description: "A magical story of friendship and healing",
    trending: false,
    authorId: "sample-author-10"
  },
  {
    title: "The Wandering Falcon",
    author: "Jamil Ahmed",
    category: "Contemporary Fiction",
    rating: 4.4,
    price: 290,
    cover: "/images/the wandering falcon by jamil ahmed.png",
    description: "A novel about life in the tribal areas of Pakistan",
    trending: false,
    authorId: "sample-author-11"
  },
  {
    title: "The Only One Left",
    author: "Riley Sager",
    category: "Thriller",
    rating: 4.3,
    price: 350,
    cover: "/images/The_Only_One_Left by riley sager.jpg",
    description: "A gripping psychological thriller",
    trending: true,
    authorId: "sample-author-12"
  }
];

async function addSampleBooks() {
  try {
    console.log('Adding sample books to Firestore...');
    
    for (const book of sampleBooks) {
      await addDoc(collection(db, "books"), book);
      console.log(`Added book: ${book.title}`);
    }
    
    console.log('All sample books added successfully!');
  } catch (error) {
    console.error('Error adding sample books:', error);
  }
}

// Run the function
addSampleBooks(); 