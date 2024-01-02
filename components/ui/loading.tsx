import { Bars } from 'react-loader-spinner';

function Loading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
            <Bars
                height="80"
                width="80"
                color="#60A3D9"
                ariaLabel="bars-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            />
            <p style={{ maxWidth: '80%' }}>
                We&apos;re preparing your content.
            </p>
            <p>The initial upload may take a bit longer, but we appreciate your patience. Subsequent loads will be faster. Thank you for your understanding.</p>
        </div>
    );
}

export default Loading;
