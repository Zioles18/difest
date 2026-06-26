import React from 'react';
export const NXLogo: React.FC<{
    className?: string;
    size?: number;
}> = ({ className = '', size = 24, }) => {
    return (<img src="/logo.png" alt="NexBiz Logo" width={size} height={size} className={`${className} select-none`} style={{
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'inline-block'
        }} draggable={false}/>);
};
