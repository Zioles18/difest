import React, { useEffect, useState } from 'react';
import './Shuffle.css';
export interface ShuffleProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
    textAlign?: React.CSSProperties['textAlign'];
}
const Shuffle: React.FC<ShuffleProps> = ({ text, className = '', style = {}, tag = 'p', textAlign = 'center' }) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        setReady(true);
    }, []);
    const commonStyle: React.CSSProperties = { textAlign, ...style };
    const classes = `shuffle-parent ${ready ? 'is-ready' : ''} ${className} animate-fade-in transition-opacity duration-500`;
    const Tag: React.ElementType = tag || 'p';
    return React.createElement(Tag, { className: classes, style: commonStyle }, text);
};
export default Shuffle;
