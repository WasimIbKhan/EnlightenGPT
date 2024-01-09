import React, { useState } from 'react';
import styles from '@/styles/dropdown.module.css';

interface DropdownProps {
    onOptionChange: (option: string) => void;
    options: String[]
}
const Dropdown: React.FC<DropdownProps> = ({onOptionChange, options}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(options[0]);
    
    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (option: string) => {
        setSelectedOption(option);
        onOptionChange(option);
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
