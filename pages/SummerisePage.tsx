import { useRef, useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import UploadFileDropbox from '../components/upload-file-dropbox/uploadFileDropbox';
import { AppDispatch } from '@/pages/_app';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/RootState';
import { uploadTempFilesToAmplifyStorage } from '../store/actions/chat';


export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const [chatTitle, setTitle] = useState('');
  const [files, setFiles] = useState<File[] | null>([]); // Use File[] or null
  const [serverFiles, setServerFiles] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string][];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about this document?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit() {

    setError(null);

    const fileLocations = await uploadTempFilesToAmplifyStorage(files);

    setLoading(true);
    try {
      const response = await fetch('/api/summeriseDoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileLocations: fileLocations }),
      });
  
      const reader = response.body.getReader();
      let receivedText = '';
  
      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        const textChunk = new TextDecoder("utf-8").decode(chunk);
        receivedText += textChunk;
        
        // Update state with each chunk
        setMessageState((state) => ({
          ...state,
          messages: [{ type: 'apiMessage', message: receivedText }],
        }));
      }
      console.log('messageState', messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
  }


  const onFileChange = (files: File[] | null) => {
    // Accept File[] or null
    if (files) {
      setFiles(files);
    }
  };

  const handleFileSubmit = async () => {
    if (files && files.length > 0) {
      handleSubmit();
      setFiles([]); // Reset the files state to an empty array after submission
    }
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            {chatTitle}
          </h1>
          <div className={styles.flexContainer}>
            <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/bot-image.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown  remarkPlugins={[gfm]} linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
            <div className={styles.box}>
              <input
                placeholder="Chat Title"
                className={styles.chatTitleInput}
                value={chatTitle}
                onChange={(e) => setTitle(e.target.value)}
              />
              <UploadFileDropbox
                onFileChange={onFileChange}
                serverFiles={serverFiles}
              />
              <div className={styles.flexContainer}>
                <button
                  className={styles.submitButton}
                  onClick={handleFileSubmit}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}