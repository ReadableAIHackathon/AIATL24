'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut, getProviders } from 'next-auth/react';

const Nav = () => {
  const { data: session } = useSession();
  const [providers, setProviders] = useState(null);
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const [bamboo, setBamboo] = useState(session?.user?.bamboo || 0);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders();
      setProviders(response);
    };
    setUpProviders();
  }, []);

  useEffect(() => {
    const checkBambooUpdate = () => {
      const newBambooValue = session?.user?.bamboo;
      if (newBambooValue > bamboo) {
        setIsIncreasing(true);
        setBamboo(newBambooValue);

        // Play the happy sound
        const happySound = new Audio('Frontend/readable/public/assets/music/happy_chime.mp3'); // Replace with actual path
        happySound.play();

        // Remove the vibration effect after 1 second
        setTimeout(() => setIsIncreasing(false), 1000);
      } else {
        setBamboo(newBambooValue);
      }
    };

    checkBambooUpdate();
  }, [session?.user?.bamboo]);

  return (
    <nav className="flex items-center justify-between w-full mb-16 pt-3">
      <Link href="/" className="flex gap-2 flex-center">
        <Image
          src="/assets/images/logo.svg"
          alt="EyeReplace Logo"
          width={50}
          height={50}
          className="object-contain"
        />
        <p className="logo_text">Readable</p>
      </Link>

      {session?.user && (
        <div className="bamboo-center flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
          <span className="bamboo-label">Bamboo:</span>
          <span className="bamboo-count" key={session.user.bamboo}>
          {session.user.bamboo}
        </span>
      </div>
      )}

      <div className="sm:flex hidden">
        {session?.user ? (
          <div className="flex gap-3 md:gap-5">
            <Link href={"/library"} className="black_btn">
              Library
            </Link>

            <button type="button" onClick={() => signOut()} className="outline_btn">
              Sign Out
            </button>

            <Image
              src={session?.user.image}
              width={37}
              height={37}
              className="rounded-full"
              alt="profile"
            />
          </div>
        ) : (
          <>
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  type="button"
                  key={provider.name}
                  onClick={() => signIn(provider.id)}
                  className="black_btn"
                >
                  Sign In
                </button>
              ))}
          </>
        )}
      </div>

      <div className="sm:hidden flex relative">
        {session?.user ? (
          <div className="flex">
            <Image
              src={session?.user.image}
              width={37}
              height={37}
              className="rounded-full"
              alt="profile"
              onClick={() => {
                setToggleDropdown((prev) => !prev);
              }}
            />
            {toggleDropdown && (
              <div className="dropdown">
                <Link
                  href="/profile"
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/create-prompt"
                  className="dropdown_link"
                  onClick={() => setToggleDropdown(false)}
                >
                  Create Prompt
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="mt-5 w-full black_btn"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  type="button"
                  key={provider.name}
                  onClick={() => signIn(provider.id)}
                  className="black_btn"
                >
                  Sign in
                </button>
              ))}
          </>
        )}
      </div>

      <style jsx>{`
        .bamboo-center {
          background: linear-gradient(90deg, #4caf50, #8bc34a);
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
          font-size: 1.25rem;
          text-align: center;
        }
        .bamboo-label {
          font-weight: bold;
          color: #ffffff;
          margin-right: 8px;
        }
        .bamboo-count {
          font-weight: bold;
          color: #ffffff;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }
        .vibrate {
          animation: vibrate 0.3s ease-in-out;
          animation-iteration-count: 3;
        }
        @keyframes vibrate {
          0% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, 2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </nav>
  );
};

export default Nav;