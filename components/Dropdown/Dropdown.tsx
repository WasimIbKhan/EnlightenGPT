import React, { useState } from 'react';
import styles from '@/styles/dropdown.module.css';

interface DropdownProps {
    onAgentChange: (option: string) => void;
}
const Dropdown: React.FC<DropdownProps> = ({onAgentChange}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Select a Q/A Agent');
    const options = ['Quick search', 'Research'];

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        onAgentChange(option);
        setIsOpen(false);
    };

    return (
        <>
        <div className={styles.dropdownContainer}>
            <button className={styles.dropdownButton} onClick={toggleDropdown}>
                {selectedOption}
            </button>
            {isOpen && (
                <ul className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleSelect(option)} className={styles.dropdownItem}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </>
    );
};

export default Dropdown;
