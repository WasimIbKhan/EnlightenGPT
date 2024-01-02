import React, { useEffect, useRef, useState } from 'react';

import ChatIcon from '../assets/icon/ChatIcon';
import CrossIcon from '../assets/icon/CrossIcon';
import DeleteIcon from '../assets/icon/DeleteIcon';
import EditIcon from '../assets/icon/EditIcon';
import TickIcon from '../assets/icon/TickIcon';

const ChatHistoryClass = {
    normal:
        'flex py-2 px-2 items-center gap-3 relative rounded-md bg-white hover:bg-gray-850 break-all hover:pr-4 group transition-opacity',
    active:
        'flex py-2 px-2 items-center gap-3 relative rounded-md break-all pr-14 bg-white hover:bg-gray-400 group transition-opacity',
    normalGradient:
        'absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-white group-hover:from-gray-850',
    activeGradient:
        'absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-white',
};

const ChatHistory = React.memo(
    ({ title, handleSwitchChat, chatIndex }: { title: string; handleSwitchChat: Function, chatIndex: number }) => {
        const [isDelete, setIsDelete] = useState<boolean>(false);
        const [isEdit, setIsEdit] = useState<boolean>(false);
        const [_title, _setTitle] = useState<string>(title);
        const inputRef = useRef<HTMLInputElement>(null);

        const editTitle = () => {
            //setChats(updatedChats);
            setIsEdit(false);
        };

        const deleteChat = () => {
            setIsDelete(false);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        };

        const handleTick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            if (isEdit) editTitle();
            else if (isDelete) deleteChat();
        };

        const handleCross = () => {
            setIsDelete(false);
            setIsEdit(false);
        };

        const handleDragStart = (e: React.DragEvent<HTMLAnchorElement>) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData('chatIndex', String(chatIndex));
            }
        };

        useEffect(() => {
            if (inputRef && inputRef.current) inputRef.current.focus();
        }, [isEdit]);
 
        return (
            <a
                className={`${
                    ChatHistoryClass.active
                } ${
                    'cursor-pointer opacity-100'
                }`}
                onClick={() => {
                        console.log("Chat Index: ", chatIndex);
                        handleSwitchChat(chatIndex);
                    //if (!generating) setCurrentChatIndex(chatIndex);
                }}
                draggable
                onDragStart={handleDragStart}
            >
                <ChatIcon />
                <div className='flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative' title={title}>
                    {isEdit ? (
                        <input
                            type='text'
                            className='focus:outline-blue-600 text-sm border-none bg-transparent p-0 m-0 w-full'
                            value={_title}
                            onChange={(e) => {
                                _setTitle(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            ref={inputRef}
                        />
                    ) : (
                        _title
                    )}

                    {isEdit || (
                        <div
                            className={ChatHistoryClass.active}
                        />
                    )}
                </div>
                <div className='absolute flex right-1 z-10 text-gray-300 visible'>
                        {isDelete || isEdit ? (
                            <>
                                <button
                                    className='p-1 hover:text-white'
                                    onClick={handleTick}
                                    aria-label='confirm'
                                >
                                    <TickIcon />
                                </button>
                                <button
                                    className='p-1 hover:text-white'
                                    onClick={handleCross}
                                    aria-label='cancel'
                                >
                                    <CrossIcon />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className='p-1 hover:text-white'
                                    onClick={() => setIsEdit(true)}
                                    aria-label='edit chat title'
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    className='p-1 hover:text-white'
                                    onClick={() => setIsDelete(true)}
                                    aria-label='delete chat'
                                >
                                    <DeleteIcon />
                                </button>
                            </>
                        )}
                    </div>
            </a>
        );
    }
);

ChatHistory.displayName = 'ChatHistory'; 

export default ChatHistory;