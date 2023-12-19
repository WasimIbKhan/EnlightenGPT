import { useRef, useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { addChat, getChats, switchChat } from '../store/actions/chat';
import DropFileInput from '../components/drop-file-input/DropFileInput';
import { AppDispatch } from '@/pages/_app';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/RootState';
import FeedbackComponent from '@/components/Feedback';
import Dropdown from '../components/Dropdown/Dropdown';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const chats = useSelector((state: RootState) => state.chats.chats);
  const index = useSelector((state: RootState) => state.chats.index);
  const [chatId, setChatId] = useState('000000000');
  const [chatTitle, setTitle] = useState('');
  const [files, setFiles] = useState<File[] | null>([]); // Use File[] or null
  const [serverFiles, setServerFiles] = useState<[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [agent, setAgent] = useState<string>(''); 
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(async () => {
    try {
      await dispatch(getChats());
    } catch (err: any) {
      console.log(err.message);
    }
    return;
  }, [dispatch, setLoading]);

  useEffect(() => {
    setLoading(true);
    loadChats().then(() => {
      setLoading(false);
    });
  }, [dispatch, loadChats]);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, please enter the document youd like to learn about?',
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
  }, [files, index]);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
          chatTitle,
        }),
      });
      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('messageState', messageState);
      const response1 = await fetch('/api/updateHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newHistory: [[question, data.text]],
          userId: userId,
          chatId: chatId,
        }),
      });

      if (!response1.ok) {
        console.error('Error during updating history:', await response1.text());
        return;
      }

      // Continue with JSON parsing and further processing...

      const data1 = await response1.json();
      if (data1.error) {
        console.error(data1.error);
      } else {
        console.log(data1.message);
      }
    } catch (error) {
      console.error('Error during updating history:', error);
    }

    setLoading(false);

    //scroll to bottom
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }

  async function handleAgent2Submit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery('');

    try {
      const response = await fetch('http://127.0.0.1:5000/QA_Agent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, chatTitle }),
    });

      const data = await response.json();
      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.answer
            },
          ],
          history: [...state.history, [question, data.answer]],
        }));
      }
    } catch (error) {
      console.error('Error during updating history:', error);
    }

    setLoading(false);

    //scroll to bottom
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      if(agent === 'Quick search') {
        handleSubmit(e);
      } else if(agent === 'Research') {
        handleAgent2Submit(e);
      }
      
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleSwitchChat = async (index: number) => {
    await dispatch(switchChat(index));
    const chat = chats[index];
    setTitle(chat.chatTitle);
    setServerFiles(chat.docs);
    setChatId(chat.chat_id);
    const newHistory: [string, string][] = [];

    // Check if the chat has a history property
    if (chat.history && Array.isArray(chat.history)) {
      // Loop through the history array of the selected chat
      chat.history.forEach((qaPair) => {
        // Check if the qaPair is a valid array with at least two elements
        if (Array.isArray(qaPair) && qaPair.length >= 2) {
          // Push each question-answer pair to the newHistory array
          newHistory.push([qaPair[0], qaPair[1]]);
        }
      });
    }
    // Update the messageState with the newHistory array
    setMessageState((state) => ({
      ...state,
      history: newHistory,
    }));
    console.log(messageState.history);
  };
  const onFileChange = (files: File[] | null) => {
    // Accept File[] or null
    if (files) {
      setFiles(files);
    }
  };

  const onAgentChange = (agent: string) => {
    setAgent(agent);
  }
  const handleFileSubmit = async () => {
    if ((chatTitle.length > 0) && files && files.length > 0) {
      setPageLoading(true)
      await dispatch(addChat(chatTitle, files));
      setPageLoading(false)
    }
    else {
      alert('Please make sure a Chat Title and files are set');
      return;
    }
  };

  const handleIngest = async () => {
    console.log('docs')
    const chat = chats[index];
    if (chat.chatTitle == 0 || chat.docs.length == 0) {
      alert('No files to ingest');
      return;
    } else {
      
      console.log(chat)
        try {
          const response = await fetch('/api/ingestDocuments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              docLocations: chat.docs,
              namespace: chat.chatTitle,
            }),
          });

          const data = await response.json();
          if (data.error) {
            console.error(data.error);
          } else {
            console.log(data.message);
          }
        } catch (error) {
          console.error('Error during ingestion:', error);
        }
      
    }
    
    
  };

  if(pageLoading) {
    return(
    <div><h1>Its loading, will make a loading button soon</h1></div>)
  }
  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            {chatTitle}
          </h1>
          <div className={styles.flexContainer}>
            <div className={styles.sidebar}>
              {chats && (
                <ul className={styles.chatList}>
                  <button
                    className={styles.newChatButton}
                    onClick={() => {
                      handleSwitchChat(0);
                    }}
                  >
                    New Chat
                  </button>
                  {chats &&
                    chats.map((chat, index) => (
                      <li
                        key={index}
                        className={styles.chatItem}
                        onClick={() => handleSwitchChat(index)}
                      >
                        {chat.chatTitle}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            
            <main className={styles.main}>
            <div className={styles.cloud}>
            {chatTitle.length!==0 && (<div ref={messageListRef} className={styles.messagelist}>
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
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {message.sourceDocs && (
                        <div
                          className="p-5"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {doc.metadata.source}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </>
                  );
                })}
              </div>)}
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'ask your question?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            <FeedbackComponent />
          </main>
            <div className={styles.box}>
              <Dropdown onAgentChange={onAgentChange}/>
              <input
                placeholder="Chat Title"
                className={styles.chatTitleInput}
                value={chatTitle}
                onChange={(e) => setTitle(e.target.value)}
              />
              <DropFileInput
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
                <button className={styles.submitButton} onClick={handleIngest}>
                  Ingest
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
