import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopWrapper = () => {
    const { pathname, state } = useLocation();

    useEffect(() => {
        // If there's a specific element to scroll to (like contact section), don't scroll to top
        if (state?.scrollTo) {
            return;
        }

        // Otherwise, scroll to top on route change
        window.scrollTo(0, 0);
    }, [pathname, state]);

    return null;
};

export default ScrollToTopWrapper;
