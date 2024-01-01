import React, { useRef, useState, ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import styles from '@/styles/DropFileInputStyles.module.css';

import { ImageConfig } from '../../config/ImageConfig';
import uploadImg from '../../assets/cloud-upload-regular-240.png';

interface DropFileInputProps {
    onFileChange: (files: File[]) => void;
    serverFiles:[],
    currentFiles:File[]|null
}

const DropFileInput: React.FC<DropFileInputProps> = (props) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    //console.log("current files:",props.currentFiles);
    const [fileList, setFileList] = useState<File[]|null>(props.currentFiles);

    const onDragEnter = () => {
        if (wrapperRef.current) {
            wrapperRef.current.classList.add('dragover');
        }
    };

    const onDragLeave = () => {
        if (wrapperRef.current) {
            wrapperRef.current.classList.remove('dragover');
        }
    };

    const onDrop = () => {
        if (wrapperRef.current) {
            wrapperRef.current.classList.remove('dragover');
        }
    };

    const onFileDrop = (e: ChangeEvent<HTMLInputElement>) => {
        const newFile = e.target.files && e.target.files[0];
        if (newFile) {
            const updatedList = [...fileList, newFile];
            setFileList(updatedList);
            props.onFileChange(updatedList);
        }
    };

    const fileRemove = (file: File) => {
        const updatedList = [...fileList];
        const index = updatedList.indexOf(file);
        if (index !== -1) {
            updatedList.splice(index, 1);
            setFileList(updatedList);
            props.onFileChange(updatedList);
        }
    };

    return (
        <>
            {props.currentFiles.length > 0 ? (
                <div className={styles.dropFilePreview}>
                    {props.currentFiles.map((item, index) => (
                        <div key={index} className={styles.dropFilePreview_item}>
                            <Image src={ImageConfig[item.type.split('/')[1]] || ImageConfig['default']} alt="File Preview" />
                            <div className={styles.dropFilePreview_item_info}>
                                <p>{item.name}</p>
                                <p>{item.size}</p>
                            </div>
                            <span
                                className={styles.dropFilePreview_item_del}
                                onClick={() => fileRemove(item)}
                            >
                            </span>
                        </div>
                    ))}
                </div>
            ) : null}
            {props.serverFiles.map((fileName, index) => (
                <div key={index} className={styles.dropFilePreview_item}>
                    <Image src={ImageConfig['default']} alt="File Preview" />
                    <div className={styles.dropFilePreview_item_info}>
                    <p>{fileName}</p>
                    <p>Unknown Size</p>
                    </div>
                </div>
                ))}
        </>
    );
};

export default DropFileInput;
