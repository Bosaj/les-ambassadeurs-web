import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ fullScreen = true, message = "Loading..." }) => {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 transition-opacity duration-300">
                <div className="flex flex-col items-center">
                    <FaSpinner className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium animate-pulse">
                        {message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center p-4">
            <FaSpinner className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
    );
};

export default LoadingSpinner;
