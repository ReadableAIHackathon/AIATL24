# Readable
An AI-powered platform that enhances reading comprehension by simplifying complex texts to match diverse reading levels. Readable gamifies the reading experience, making literature accessible and engaging for all.

# Introduction
Readable is designed to improve reading skills by making complex texts accessible to a wider audience. Inspired by the desire to help children with intellectual disabilities engage with literature, Readable uses AI to simplify texts, allowing users to adjust the reading difficulty and enhance their comprehension.

# Features
- Adjustable Reading Difficulty: Users can select a reading level from 1 to 5, where level 5 is the original text and level 1 is the simplest version.
- Voiceover and Reading Assessment: Read aloud with our voiceover feature, which assesses reading proficiency using a sophisticated similarity algorithm.
- Gamification: Earn "bamboo" points by consistently reading and challenging yourself. Higher difficulty levels earn more bamboo.
- Paul the Panda: Use bamboo to feed and grow your virtual mascot, Paul the Panda, adding a fun, interactive element to the reading experience.
- User Progress Tracking: Save and track your reading progress, bamboo points, and Paul's growth over time.

# Watch the Demo Video
[Demo Video](https://youtu.be/eUSX7yzEHME)

# Installation
**Note:** Installation instructions will be provided once the repository is made public.

## Clone the repository:
```bash
git clone https://github.com/yourusername/readable.git
```

## Install dependencies:
```bash
cd readable
npm install
```

## Set up environment variables:
Configure your .env file with the required API keys and database URIs.
Run the application:
```bash
npm run dev
```

# Usage
- Sign In: Use Google OAuth to sign in securely.
- Select a Book: Browse the library and choose from classic literature.
- Adjust Difficulty: Use the slider to set your preferred reading level.
- Read Aloud: Utilize the voiceover feature to read aloud and receive proficiency assessments.
- Earn Bamboo: Gain bamboo points by reading and challenging yourself with higher difficulty levels.
- Feed Paul the Panda: Use your bamboo to feed and grow your virtual mascot.

# Technologies Used
- Front-end: Next.js, React
- Authentication: NextAuth.js, Google OAuth
- Back-end: Python, Node.js
- Database: MongoDB Atlas
- AI Services: Anthropic API
- Algorithms: Scikit-Learn for reading assessment
- APIs and Middleware: Custom APIs for communication between front-end and back-end

# How We Built It
- Front-end: Built with Next.js, integrating NextAuth and Google OAuth for user authentication.
- Back-end: Developed using Python scripts and Node.js to handle data processing and AI text simplification.
- Database: Implemented complex schemas in MongoDB to store user data, book details, reading progress, bamboo points, and Paul the Panda's growth.
- Adjustable Text Complexity: The slider activates a robust back-end workflow that adjusts text complexity using the Anthropic API and custom prompts.
- Voiceover Feature: Created a custom algorithm using Scikit-Learn to assess reading proficiency based on user voice input.

# Challenges
- API Integration: Coordinating requests between the front-end, database, and back-end scripts was more complex than anticipated.
- System Stability: Faced critical system failures that required extensive troubleshooting and resilience.
- Reading Assessment Algorithm: Developing an accurate script to assess user transcription quality required custom solutions and extensive testing.
- Prompt Engineering: Refined prompts for the Anthropic API to generate precise outputs for text simplification.

# Accomplishments
- Functional Product: Built a fully functional platform within a 36-hour timeframe.
- Teamwork: Strengthened our collaboration skills, supporting each other through challenges.
- Technical Breakthroughs: Developed a robust reading assessment algorithm and overcame significant technical hurdles.
- Community Building: Grew as a team, enhancing our skills and friendships.

# What We Learned
- Technical Skills: Improved proficiency in API integration, MongoDB, Scikit-Learn, and prompt engineering.
- Problem-Solving: Enhanced our ability to tackle complex challenges creatively and collaboratively.
- Team Dynamics: Recognized the importance of leveraging team members' diverse strengths.
- Resilience: Learned the value of perseverance in the face of obstacles.

# What's Next for Readable
- Paul the Panda Customization: Allow users to personalize Paul with accessories and clothing purchased using bamboo.
- In-House AI Models: Develop our own machine learning models for text simplification to improve accuracy.
- Bamboo Rewards System: Expand bamboo into a universal rewards currency, redeemable for gift cards and travel miles.
- Mobile App Development: Create a mobile app to increase accessibility and user engagement.
- Expanded Content: Enable users to upload various texts, including articles and research papers, for simplification.
