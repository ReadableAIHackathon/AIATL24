'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LibraryContainer = styled.div`
  width: 1750px;
  height: 1000px;
  text-align: center;
  font-family: 'Georgia', serif;
  background: url('/assets/images/grid.svg');
  background-size: cover;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 5rem;
  margin-bottom: 100px;
  color: white;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const BookList = styled.div`
  display: flex;
  justify-content: center;
  gap: 75px;
`;

const BookItem = styled.div`
  width: 400px;
  height: 600px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 100px;
  position: relative;
  &:hover {
    transform: scale(1.15);
    box-shadow: 4px 6px 12px rgba(0, 0, 0, 0.3);
  }
`;

const BookCover = styled(Image)`
  width: 100%;
  height: auto;
`;

const BookLabel = styled.div`
  font-size: 1.5rem;
  color: white;
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
  position: absolute;
  bottom: 0;
  width: 100%;
  opacity: 1;
`;

const LoadingText = styled.p`
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 40px 0;
  animation: pulse 1.5s infinite;
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const NoBooksText = styled.p`
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 40px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(5px);
`;

const LibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fixed local book covers in the order they should appear
  const localBookCovers = [
    {
      coverPath: '/assets/images/Frankestein.svg',
      displayTitle: 'Frankenstein',
      matchTitle: 'frankenstein'  // Added for matching
    },
    {
      coverPath: '/assets/images/juliet.svg',
      displayTitle: 'Romeo and Juliet',
      matchTitle: 'romeo'  // Added for matching
    },
    {
      coverPath: '/assets/images/Tension3.svg',
      displayTitle: 'Tension',
      matchTitle: 'tension'  // Added for matching
    }
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        const data = await response.json();
        
        // Order books to match our localBookCovers order
        const orderedBooks = localBookCovers.map(coverBook => 
          data.find(apiBook => 
            apiBook.Title.toLowerCase().includes(coverBook.matchTitle)
          )
        ).filter(Boolean); // Remove any undefined matches
        
        setBooks(orderedBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <LibraryContainer>
      <Title>Your Library</Title>
      {loading ? (
        <LoadingText>Loading your collection...</LoadingText>
      ) : books?.length > 0 ? (
        <BookList>
          {localBookCovers.map((book, index) => (
            <BookItem 
              key={index}
              onClick={() => books[index] && router.push(`/read/${books[index].ContentID}`)}
            >
              <BookCover
                src={book.coverPath}
                alt={book.displayTitle}
                width={300}
                height={450}
              />
              <BookLabel>{book.displayTitle}</BookLabel>
            </BookItem>
          ))}
        </BookList>
      ) : (
        <NoBooksText>No books available in your library</NoBooksText>
      )}
    </LibraryContainer>
  );
};

export default LibraryPage;