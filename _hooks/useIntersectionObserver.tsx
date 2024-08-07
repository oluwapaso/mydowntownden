"use client"
import { useEffect, useState, useRef, RefObject } from 'react';

const useIntersectionObserver = (options: IntersectionObserverInit): [RefObject<HTMLDivElement>, boolean] => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setInView(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return [ref, inView];
};

export default useIntersectionObserver;

