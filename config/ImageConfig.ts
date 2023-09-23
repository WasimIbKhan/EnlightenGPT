import type { StaticImageData } from 'next/image';
import fileDefault from '../assets/file-blank-solid-240.png';
import fileCSS from '../assets/file-css-solid-240.png';
import filePdf from '../assets/file-pdf-solid-240.png';
import filePng from '../assets/file-png-solid-240.png';

type ImageConfigType = {
    readonly default: StaticImageData;
    readonly pdf: StaticImageData;
    readonly png: StaticImageData;
    readonly css: StaticImageData;
    [key: string]: StaticImageData;  // This is the index signature
};

export const ImageConfig: ImageConfigType = {
    default: filePdf,
    pdf: filePdf,
    png: filePng,
    css: fileCSS,
};
