import React, { useState } from 'react';
import styles from '@/styles/Feedback.module.css';

const FeedbackComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitFeedback = async () => {
    if (rating === null) {
      alert('Please select a rating before submitting.');
      return;
    }
    try {
      const response = await fetch('/api/post-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        setIsModalOpen(false); // Close the modal after submission
      } else {
        console.error('Failed to record feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  
  return (
    <div>
      <h2 className={styles.feedbackHeader}>Feedback</h2>
      <div className={styles.emojiOptions}>
        <span
          role="img"
          aria-label="Excellent"
          className={styles.emoji}
          onClick={() => {
            setRating(5)
            openModal()
            }}
        >
          😃
        </span>
        <span
          role="img"
          aria-label="Good"
          className={styles.emoji}
          onClick={() => {
            setRating(4)
            openModal()
            }}
        >
          😀
        </span>
        <span
          role="img"
          aria-label="Neutral"
          className={styles.emoji}
          onClick={() => {
            setRating(3)
            openModal()
            }}
        >
          😐
        </span>
        <span
          role="img"
          aria-label="Poor"
          className={styles.emoji}
          onClick={() => {
            setRating(2)
            openModal()
            }}
        >
          😕
        </span>
        <span
          role="img"
          aria-label="Terrible"
          className={styles.emoji}
          onClick={() => {
            setRating(1)
            openModal()
            }}
        >
          😞
        </span>
      </div>
      {isModalOpen && (
        <div className={styles.modalContainer}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>
                How would you rate your experience on this page?
              </h4>
            </div>
            <div className={styles.npsTextareaWrap}>
              <textarea
                placeholder="Your comment..."
                rows={8}
                className={styles.npsTextarea}
                onChange={(e) => setComment(e.target.value)}
                value={comment} // Added value prop to the textarea
              ></textarea>
            </div>
            <div className={styles.npsBtnWrap}>
              <br />
              <button
                onClick={handleSubmitFeedback}
                className={styles.btnPrimary}
              >
                Submit Feedback
              </button>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button onClick={closeModal} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;
