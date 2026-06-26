import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import "./RotatingText.css";
export interface RotatingTextRef {
    next: () => void;
    previous: () => void;
    jumpTo: (index: number) => void;
    reset: () => void;
}
export interface RotatingTextProps {
    texts: string[];
    rotationInterval?: number;
    auto?: boolean;
    mainClassName?: string;
    className?: string;
    [key: string]: any;
}
export const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>((props, ref) => {
    const { texts, rotationInterval = 2000, auto = true, mainClassName = "", className = "", ...rest } = props;
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const next = () => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            setIsFading(false);
        }, 300);
    };
    const previous = () => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentTextIndex((prev) => (prev === 0 ? texts.length - 1 : prev - 1));
            setIsFading(false);
        }, 300);
    };
    const jumpTo = (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) {
            setIsFading(true);
            setTimeout(() => {
                setCurrentTextIndex(validIndex);
                setIsFading(false);
            }, 300);
        }
    };
    const reset = () => jumpTo(0);
    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }));
    useEffect(() => {
        if (!auto)
            return;
        const intervalId = setInterval(next, rotationInterval);
        return () => clearInterval(intervalId);
    }, [auto, rotationInterval, texts.length]);
    return (<span className={`inline-block transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'} ${mainClassName} ${className}`} {...rest}>
        {texts[currentTextIndex]}
      </span>);
});
RotatingText.displayName = "RotatingText";
