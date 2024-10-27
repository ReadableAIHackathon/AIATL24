'use client';
import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaArrowRight, FaPlus, FaMinus, FaMicrophone } from 'react-icons/fa';

const Book = () => {
  const params = useParams();
  const [content, setContent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sliderValue, setSliderValue] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [recordingStartTime, setRecordingStartTime] = useState(null); // New state for recording start time
  const [recordingDuration, setRecordingDuration] = useState(0); // New state for recording duration
  const recognitionRef = useRef(null);
  const cumulativeTranscriptRef = useRef(''); // Add this at the top of your component
  useEffect(() => {
    const fetchInitialMetadata = async () => {
      try {
        const response = await fetch('https://readablemongo.teje.sh/content/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': process.env.NEXT_PUBLIC_DB_API
          },
          body: JSON.stringify({ ContentID: params.id })
        });

        const data = await response.json();
        console.log("Initial Metadata:", data);

        if (!response.ok) throw new Error('Failed to fetch initial metadata');

        setMetadata({
          Title: data.Title || 'Untitled',
          Author: data.Author,
          PublishedDate: data.Metadata?.PublishedDate,
        });

        setTotalPages(data.TotalSections || 1);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial metadata:', error);
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchInitialMetadata();
    }
  }, [params.id, pageIndex, sliderValue]);

  const fetchPage = async (sectionNumber, levelValue = sliderValue) => {
    try {
      setIsLoading(true);
      const response = await fetch('https://readablemongo.teje.sh/content/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.NEXT_PUBLIC_DB_API
        },
        body: JSON.stringify({ ContentID: params.id, SectionNumber: sectionNumber, Level: levelValue })
      });

      const data = await response.json();
      console.log("Page Data:", data);

      if (response.ok) {
        setContent({
          Section: data.Section,
          SubLevel: data.SubLevel,
        });
        setPageIndex(sectionNumber);
      } else {
        throw new Error('Failed to fetch page');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextPage = async () => {
    if (pageIndex < totalPages) {
      const nextIndex = pageIndex + 1;
      await fetchPage(nextIndex);
      setPageIndex(nextIndex);
    }
  };

  const goToPrevPage = async () => {
    if (pageIndex > 1) {
      const prevIndex = pageIndex - 1;
      await fetchPage(prevIndex);
      setPageIndex(prevIndex);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setTranscript("");
    setRecordingStartTime(Date.now());

    cumulativeTranscriptRef.current = ""; // Reset cumulative transcript

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const { transcript } = result[0];
        if (result.isFinal) {
          cumulativeTranscriptRef.current += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscript(cumulativeTranscriptRef.current + interimTranscript);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.start();
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Calculate duration
      const duration = (Date.now() - recordingStartTime) / 1000;
      setRecordingDuration(duration);

      // Use the cumulative transcript
      const finalTranscript = JSON.parse(JSON.stringify(transcript));
      console.log("Final transcript:", finalTranscript);

      try {
        const response = await fetch('/api/sentTranscript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': process.env.NEXT_PUBLIC_DB_API
          },
          body: JSON.stringify({
            expected_text: getCurrentText(),
            transcript: finalTranscript,
            level: sliderValue,
            duration: duration
          })
        });

        if (!response.ok) {
          throw new Error('Failed to send transcript');
        }
      } catch (error) {
        console.error('Error sending transcript:', error);
      }

      setTranscript("");
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleSliderChange = (e) => {
    const newValue = e.target.value;
    console.log("Slider Value Changed:", newValue);
    setSliderValue(newValue);
    fetchPage(pageIndex, newValue);
  };

  const getCurrentText = () => {
    if (!content) return '';
    return content.SubLevel ? content.SubLevel.Text : content.Section.OriginalText;
  };

  return (
    <div style={{ position: "relative" }}>
      <EasierLabel>Easier</EasierLabel>
      <Slider
        type="range"
        min="1"
        max="5"
        value={sliderValue}
        onChange={handleSliderChange}
      />
      <OriginalLabel>Original</OriginalLabel>
      <BookContainer>
        {isLoading ? (
          <LoadingPage>Loading...</LoadingPage>
        ) : pageIndex ? (
          <>
            <LeftArrow onClick={goToPrevPage} disabled={pageIndex === 1}>
              <FaArrowLeft />
            </LeftArrow>

            <Page>
              <BookTitle>{metadata?.Title || 'Untitled'}</BookTitle>
              <PageContent>
                {getCurrentText()}
              </PageContent>
              <PageNumber>Page {pageIndex} of {totalPages}</PageNumber>
            </Page>

            <RightArrow onClick={goToNextPage} disabled={pageIndex === totalPages}>
              <FaArrowRight />
            </RightArrow>

            <AudioButton onClick={toggleRecording} isRecording={isRecording}>
              <FaMicrophone />
            </AudioButton>

            <Teleprompter>
              {isRecording ? "Recording..." : transcript || "Your transcription will appear here." }
            </Teleprompter>
          </>
        ) : (
          <ErrorPage>No content available</ErrorPage>
        )}
      </BookContainer>
    </div>
  );
};

const LoadingPage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #3e2723;
  background: #f8f1e7;
  border-radius: 15px;
`;

const ErrorPage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #e74c3c;
  background: #f8f1e7;
  border-radius: 15px;
`;

const BookTitle = styled.h1`
  text-align: center;
  margin-bottom: 5px;
  color: #3e2723;
  font-size: 1.2rem;
  font-weight: bold;
`;

const PageContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 5px;
  margin: 0 5px;
  position: relative;
  margin-bottom: 50px; /* Add margin at the bottom to make space for page number */
  
  p {
    width: 100%;
    margin: 0;
    font-size: clamp(0.8rem, 1vw + 0.5rem, 1.2rem);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 25;
    -webkit-box-orient: vertical;
  }
`;

const PageNumber = styled.div`
  text-align: center;
  padding: 5px;
  font-size: 0.8rem;
  color: #666;
  border-top: 1px solid #d3c5b5;
  position: absolute;
  bottom: 45px; /* Position above the microphone button */
  left: 0;
  right: 0;
  width: 100%;
`;

const Slider = styled.input`
  position: absolute;
  top: 50px;
  width: 600px;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
  -webkit-appearance: none;
  appearance: none;
  height: 5px;
  background: #d3c5b5;
  border-radius: 5px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const Label = styled.span`
  position: absolute;
  top: 20px;
  font-size: 1rem;
  color: white;
  font-weight: bold;
`;

const EasierLabel = styled(Label)`
  left: 0%;
  top: 5px;
`;

const OriginalLabel = styled(Label)`
  right: 0%;
  top: 5px;
`;

const BookContainer = styled.div`
  width: 600px;
  height: 800px;
  display: flex;
  margin: auto;
  justify-content: center;
  align-items: center;
  margin-top: 100px;
  position: relative;
`;

const Page = styled.div`
  width: 100%;
  height: 100%;
  background: #f8f1e7;
  color: #3e2723;
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2), 0 10px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 15px;
  font-family: 'Georgia', serif;
  text-align: justify;
  border-radius: 15px;
  border: 1px solid #d3c5b5;
  position: absolute;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #5d4037;
  font-size: 2rem;
  cursor: pointer;
  z-index: 2;
  padding: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const LeftArrow = styled(ArrowButton)`
  left: -90px;
`;

const RightArrow = styled(ArrowButton)`
  right: -90px;
`;

const AudioButton = styled.button`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ isRecording }) => (isRecording ? '#e74c3c' : '#3e2723')};
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 15px;
  border-radius: 50%;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ isRecording }) => (isRecording ? '#c0392b' : '#5d4037')};
  }
`;

const PlusButton = styled.button`
  position: absolute;
  bottom: 30px;
  right: 20px;
  background: none;
  border: none;
  color: #5d4037;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 15px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const MinusButton = styled.button`
  position: absolute;
  bottom: 30px;
  left: 20px;
  background: none;
  border: none;
  color: #5d4037;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 15px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
  }
`;

const Teleprompter = styled.div`
  class-name: teleprompter; 
  position: relative;
  bottom: -475px;
  width: 90%;
  background-color: #f8f1e7;
  color: #3e2723;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  font-family: 'Georgia', serif;
  font-size: 1rem;
  line-height: 1.5;
  max-height: 100px;
  overflow-y: auto;
  margin: 0 auto;
  text-align: center;
`;

export default Book;