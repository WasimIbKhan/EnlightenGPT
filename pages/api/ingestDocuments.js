import { run } from '../../scripts/ingest-data.ts';

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
    if (req.method === 'POST') {
        const { docLocations, namespace } = req.body;

        try {
            await run(docLocations, namespace);
            res.status(200).json({ message: 'Documents ingested successfully!' });
        } catch (error) {
            console.error("Error during ingestion:", error);
            res.status(500).json({ error: 'Failed to ingest documents.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
