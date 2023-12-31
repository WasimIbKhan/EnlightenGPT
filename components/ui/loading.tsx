import Spinner from 'react-bootstrap/Spinner';

function Loading() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spinner animation="border" style={{ width: '5rem', height: '5rem' }} />
        </div>
    );
}

export default Loading;