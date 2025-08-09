import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeBookForCart(book: any, quantity: number = 1): any {
  let type = 'physical';
  if (book.type && typeof book.type === 'string' && book.type.toLowerCase() === 'ebook') {
    type = 'ebook';
  }
  return {
    id: String(book.id),
    title: book.title,
    author: book.author,
    price: book.price,
    type,
    cover: book.cover || book.image || '/placeholder.svg',
    quantity: quantity > 0 ? quantity : 1,
  };
}
