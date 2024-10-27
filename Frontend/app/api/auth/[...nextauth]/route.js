import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider.default({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async session({ session }) {
      try {
        console.log(session)
        const response = await fetch(`https://readablemongo.teje.sh/user/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': process.env.NEXT_PUBLIC_DB_API
          },
          body: JSON.stringify({
            UserEmail: session.user.email,
            Name: session.user.name,
            ProfilePicture: session.user.image
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data from API');
        }

        const userData = await response.json();

        session.user.bamboo = userData.Bamboo || 0;
        session.user.pandaSize = userData.PandaSize || 150;
        session.user.readingLevel = userData.Preferences?.ReadingLevel || 5;

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
    async signIn({ profile, account }) {
      try {
        // Send new user data to your API endpoint
        const response = await fetch(`https://readablemongo.teje.sh/user/get`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': process.env.NEXT_PUBLIC_DB_API
          },
          body: JSON.stringify({
            UserEmail: profile.email,
            Name: profile.name,
            ProfilePicture: profile.picture || profile.image
          })
        });

        // console.log(session)
        if (!response.ok) {
          throw new Error('Failed to create/update user in API');
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  }
}

const handler = NextAuth.default(authOptions);

export { handler as GET, handler as POST };
