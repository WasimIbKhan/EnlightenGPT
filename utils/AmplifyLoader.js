import { Document } from 'langchain/document';
import { Storage } from 'aws-amplify';

export class AmplifyPDFLoader {
    constructor(s3Url, { splitPages = true, pdfjs = PDFLoaderImports } = {}) {
        this.s3Url = s3Url;
        this.splitPages = splitPages;
        this.pdfjs = pdfjs;
    }

    async loadFromS3() {
        try {
            const signedURL = await Storage.get(this.s3Url, { expires: 60 }); // you can adjust the expiration time as needed
            console.log(signedURL)
            const response = await fetch(signedURL); // use signedURL here
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.arrayBuffer();
            return data;
        } catch (error) {
            console.error("Error fetching document from S3:", error);
            throw error;
        }
    }
    

    async parse(raw, metadata) {
        const { getDocument, version } = await this.pdfjs();
        const pdf = await getDocument({
            data: new Uint8Array(raw),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        }).promise;
        const meta = await pdf.getMetadata().catch(() => null);
        const documents = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            if (content.items.length === 0) {
                continue;
            }
            const text = content.items.map(item => item.str).join("\n");
            documents.push(new Document({
                pageContent: text,
                metadata: {
                    ...metadata,
                    pdf: {
                        version,
                        info: meta?.info,
                        metadata: meta?.metadata,
                        totalPages: pdf.numPages,
                    },
                    loc: {
                        pageNumber: i,
                    },
                },
            }));
        }
        if (this.splitPages) {
            return documents;
        }
        if (documents.length === 0) {
            return [];
        }
        return [
            new Document({
                pageContent: documents.map(doc => doc.pageContent).join("\n\n"),
                metadata: {
                    ...metadata,
                    pdf: {
                        version,
                        info: meta?.info,
                        metadata: meta?.metadata,
                        totalPages: pdf.numPages,
                    },
                },
            }),
        ];
    }

    async load() {
        const raw = await this.loadFromS3();
        return this.parse(raw, {});
    }
}

async function PDFLoaderImports() {
    try {
        const { default: mod } = await import("pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js");
        const { getDocument, version } = mod;
        return { getDocument, version };
    } catch (e) {
        console.error(e);
        throw new Error("Failed to load pdf-parse. Please install it with eg. `npm install pdf-parse`.");
    }
}

export default AmplifyPDFLoader;
