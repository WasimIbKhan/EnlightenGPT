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
import DropPlusButton from '../components/drop-plus-button/DropPlusButton';
import ChatItem from '@/components/ChatItem';
import Chat from '@/models/Chat';
import Loading from '@/components/ui/loading';
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
  const [hasSubmittedFiles, setHasSubmittedFiles] = useState(false);
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
  //console.log('messages', messages);
  //console.log('history', history);
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
    //console.log("1. has user submitted files => " ,hasSubmittedFiles)
    setLoading(true);
    setQuery('');

    let chat;
    if(serverFiles && serverFiles.length==0){
      chat = await handleFileSubmit()
    } else {
      chat = chats[index];
    }
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
          chat_id: chat? chat.chat_id: chatId,
        }),
      });
      const data = await response.json();
      //console.log('data', data);

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
      //console.log('messageState', messageState);
      const response1 = await fetch('/api/updateHistory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newHistory: [[question, data.text]],
          userId: userId,
          chatId: chat? chat.chat_id: chatId,
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
    let chat;
    if(files && files.length>0){
      chat = await handleFileSubmit()
    } else {
      chat = chats[index];
    }

    setQuery('');
    //http://127.0.0.1:5000/QA_Agent
    try {
      const response = await fetch(
        'https://flask-env.eba-mheghy3z.eu-west-2.elasticbeanstalk.com/QA_Agent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question, chatTitle: chatId }),
        },
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.answer,
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
      if (agent === 'Quick search') {
        handleSubmit(e);
      } else if (agent === 'Research') {
        handleAgent2Submit(e);
      }
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleSwitchChat = async (index: number) => {
    await dispatch(switchChat(index));
    const chat = chats[index];
    if(chat.docs && chat.docs.length > 0){
      setHasSubmittedFiles(true);
    } else {
      setHasSubmittedFiles(false);
    }
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
      messages: newHistory.length > 0 ? []: [{ message: 'Hi, please enter the document youd like to learn about?', type: 'apiMessage' }],
    }));
  };
  const onFileChange = (files: File[] | null) => {
    // Accept File[] or null
    if (files) {
      setFiles(files);
    }
  };

  const onAgentChange = (agent: string) => {
    setAgent(agent);
  };

  const handleFileSubmit = async () => {
  if (query.length > 0 && files && files.length > 0) {
    setPageLoading(true);
    const newChatData = await dispatch(addChat(query.trim(), files));
    if(newChatData) {
      await handleIngest(newChatData); // Pass new chat data
      setTitle(newChatData.chatTitle)
      setServerFiles(newChatData.docs)
    }
    setPageLoading(false);
    return newChatData
  } else {
    alert('Please make sure a Chat Title and files are set');
    return;
  }
};

  const handleIngest = async (chat: Chat) => {
    console.log('docs')
    console.log(chat)
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
              namespace: chat.chat_id,
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

  if (pageLoading) {
    return (
      <Loading />
    );
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
                      <ChatItem
                        title={chat.chatTitle}
                        handleSwitchChat={handleSwitchChat}
                        chatIndex={index} />
                    ))}
                </ul>
              )}
            </div>

            <main className={styles.main}>
              {chatTitle.length!==0 && (<><div className={styles.cloud}>
                <div ref={messageListRef} className={styles.messagelist}>
                  {messageState.history.map((messagePair, index) => (
                    <>
                      <div
                        key={`history-question-${index}`}
                        className={styles.usermessage}
                      >
                        <Image
                          src="/usericon.png"
                          alt="Me"
                          width="30"
                          height="30"
                          className={styles.usericon}
                          priority
                        />
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {messagePair[0]}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div
                        key={`history-answer-${index}`}
                        className={styles.apimessage}
                      >
                        <Image
                          src="/bot-image.png"
                          alt="AI"
                          width="40"
                          height="40"
                          className={styles.boticon}
                          priority
                        />
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {messagePair[1]}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </>
                  ))}
                  {messages && messages.map((message, index) => {
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
                </div>
              </div>
              <div className={styles.center}>
                <div className={styles.cloudform}>
                  <form onSubmit={handleSubmit} className="relative">
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
                      style={{ paddingLeft: '2.5rem' }} // Add left padding to make room for the button
                    />
                    <DropPlusButton onFileChange={onFileChange} serverFiles={serverFiles}/>
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
                <DropFileInput
                onFileChange={onFileChange}
                serverFiles={serverFiles}
                currentFiles={files}
              />
              </div>
              {error && (
                <div className="border border-red-400 rounded-md p-4">
                  <p className="text-red-500">{error}</p>
                </div>
              )}</>)}
              <FeedbackComponent />
            </main>
          </div>
        </div>
      </Layout>
    </>
  );
}
