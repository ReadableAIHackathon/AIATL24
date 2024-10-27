'use client'

import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/globals.css';
import { useRouter } from 'next/navigation';
import { useSession, signIn, getProviders, SessionProvider } from 'next-auth/react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const Home = () => {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [pandaSize, setPandaSize] = useState(150);
  const [isFeeding, setIsFeeding] = useState(false);
  const [providers, setProviders] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (session?.user?.pandaSize && !isInitialized) {
      setPandaSize(session.user.pandaSize);
      setIsInitialized(true);
    }
  }, [session, isInitialized]);


  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: 'ease-in-out',
      once: false,
    });

    const setUpProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };
    setUpProviders();
  }, []);

  const handleFeedPanda = async () => {
    if (session?.user && session.user.bamboo > 0 && !isFeeding) {
      console.log('Current bamboo:', session.user.bamboo);
      setIsFeeding(true);
      const newSize = pandaSize + 5;
      const previousSize =  pandaSize;
      setPandaSize(newSize);
      console.log(session.user.bamboo);
      try {
        const response = await fetch('/api/updateBamboo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newPandaSize: newSize,
            currentBamboo: Math.max(0, (session.user.bamboo - 1)),  // Add this line
            userEmail: session.user.email        // Add this line
          })
        });
  
        const data = await response.json();
        console.log('Response from API:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update panda');
        }
  
        if (data.bamboo !== undefined) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              bamboo: data.bamboo,
              pandaSize: data.pandaSize || newSize
            }
          });
        } else {
          throw new Error('Invalid server response');
        }
  
      } catch (error) {
        console.error('Error feeding panda:', error);
        alert('Failed to feed the panda. Please try again.');
        setPandaSize(previousSize);
      } finally {
        setIsFeeding(false);
      }
      console.log("api" + session.user.bamboo);
    }
  };

  const handleStartReading = () => {
    router.push('/library');
  };

  return (
    <SessionProvider>
    <section className="w-full flex flex-col items-center justify-center text-center">
      <h1 className="head_text text-center bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 bg-clip-text text-transparent" data-aos="fade-in">
        Readable
        <br className="max-md:hidden" />
      </h1>

      <div data-aos="fade-up">
        <span className="head_text purple_gradient block">
          AI-Powered Book Companion
        </span>
      </div>

      <p className="desc text-center w-full mt-4 text-white flex justify-center items-center" data-aos="fade-up" data-aos-delay="200" style={{ fontSize: '1.5rem', padding: '0 20px', whiteSpace: 'nowrap', textAlign: 'center', color: '#ffffff' }}>
  An actionable tool that helps <i>&nbsp;ANYONE&nbsp;</i> increase their reading comprehension through gradual progression.
</p>

      <div className="start-reading-button-container mt-20 mb-7" data-aos="zoom-in" data-aos-delay="300">
        <button
          className="start-reading-button"
          onClick={handleStartReading}
        >
          Start Reading To Get More Bamboo!
        </button>
      </div>

      <section className="w-full mt-10 flex flex-col items-center text-center panda-section" data-aos="fade-up">
      <h2 className="head_text purple_gradient bg-clip-text text-transparent " style={{ fontSize: '4rem' }}>
        Challenge Yourself To Grow Your Panda!
      </h2>

        <p className="desc mt-4 text-white" style={{ fontSize: '1.5rem', color: '#ffffff' }}>Use your bamboo to feed the panda and watch it grow!</p>

        <div className="panda-container">
          <div
            className="panda-image"
            style={{ width: `${pandaSize}px`, height: `${pandaSize}px` }}
          >
            <img
              src="/assets/images/panda.svg"
              alt="Cute Panda"
              className="object-contain w-full h-full"
            />
          </div>

          {session?.user ? (
            <button
              className="feed-button"
              onClick={handleFeedPanda}
              disabled={!session.user.bamboo || session.user.bamboo <= 0 || isFeeding}
            >
              {isFeeding ? 'Feeding...' : `Feed Bamboo (You have ${session.user.bamboo} left)`}
            </button>
          ) : (
            <>
              {providers &&
                Object.values(providers).map((provider) => (
                  <button
                    key={provider.name}
                    className="feed-button"
                    onClick={() => signIn(provider.id)}
                  >
                    Log in to feed the Panda!
                  </button>
                ))}
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .start-reading-button-container {
          display: flex;
          justify-content: center;
        }
        .start-reading-button {
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          color: white;
          padding: 1rem 3rem;
          font-size: 1.5rem;
          font-weight: bold;
          border-radius: 12px;
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .start-reading-button:hover {
          transform: scale(1.5);
          box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.4);
        }
        .start-reading-button:active {
          transform: scale(1.7);
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
        }

        .panda-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .panda-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          height: 500px;
          width: 100%;
          padding-bottom: 80px;
          justify-content: flex-end;
        }

        .panda-image {
          transition: width 0.3s ease, height 0.3s ease;
          margin-bottom: 20px;
        }

        .feed-button {
          position: fixed;
          bottom: 20px;
          background-color: #FFB74D;
          color: #fff;
          padding: 0.75rem 2rem;
          font-size: 1.2rem;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .feed-button:hover:not(:disabled) {
          transform: scale(1.5);
          background-color: #FF9800;
          transform: scale(1.05);
        }

        .feed-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </section>
    </SessionProvider>
  );
}

export default Home;