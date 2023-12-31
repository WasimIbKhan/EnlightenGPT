import React, { useState, ChangeEvent, useRef } from 'react';
import styles from './DropPlusButton.module.css';
import { PlusCircle } from 'react-bootstrap-icons';

interface DropPlusButtonProps {
    onFileChange: (files: File[]) => void;
    serverFiles: []; // If you're not using serverFiles, you can remove this.
}

const DropPlusButton: React.FC<DropPlusButtonProps> = (props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const onFileDrop = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            props.onFileChange(newFiles); // Update parent component's state

            // Reset the file input
            e.target.value = '';
        }
    };

    return (
        <div className="plus_button_wrapper" onMouseEnter={handleIconClick}>
            <PlusCircle className={styles.plus_button} />
            <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={onFileDrop}
                style={{ display: 'none' }} // Hide the actual file input
            />
        </div>
    );
};


export default DropPlusButton;
