'use client';
import { useState } from 'react';

import Navbar from "./navbar"

export default function Home() {
	const [search, setSearch] = useState<string>('');
	const [response, setResponse] = useState<{
		post: string;
		aboutNataliaki: string;
		title: string;
		hashtags: string[];
	} | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async () => {
		try {
			setResponse(null);	
			setLoading(true);
			const response = await fetch('/api/search', {
				method: 'POST',
				body: JSON.stringify({ search }),
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();
			setResponse(data.response);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

    	// Function to handle Enter key press
	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch(); // Trigger search when Enter key is pressed
		}
	};

	return (
        <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
			<main className='flex flex-col gap-8 row-start-2 items-center '>
				<Navbar />
				
				{/* Search Input */}
                {!loading && <input
                    className='rounded border bg-white text-black p-2'
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyPress}
                    type='text'
                    placeholder='Enter search term...'
                />}

                {/* Search Button */}
                {!loading &&<button 
                    onClick={handleSearch} 
                    className={`rounded p-2 text-black ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-300'}`} 
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>}

                {/* Loading State - Circular Progress Bar */}
                {loading && (
                    <div className="flex justify-center items-center space-x-2">
                        <svg
                            className="w-12 h-12 text-blue-500 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 1116 0A8 8 0 014 12z"
                            ></path>
                        </svg>
                        <p className="text-blue-500">Thinking...</p>
                    </div>
                )}

                {/* Error Message */}
                {error && <p className="text-red-500">{error}</p>}

                {/* Response Data */}
                {response?.post && (
                    <div className='flex flex-col gap-6 items-center text-center sm:text-left'>
                        {/* Main Response Section */}
                        <div className='flex flex-col gap-4'>
                            <h2 className='text-2xl font-bold'>{response.title}</h2>
                            <p className="text-lg">{response.post}</p>
                            {/* <div className='flex flex-wrap gap-2'>
                                {response.hashtags.map((hashtag: string) => (
                                    <span key={hashtag} className='rounded bg-blue-300 text-white p-1'>
                                        {hashtag}
                                    </span>
                                ))}
                            </div> */}
                        </div>

                        {/* Natalia Ki Section with Link Handling */}
                        {response.aboutNataliaki && (
                            <div className='mt-6 p-4 border-l-4 border-blue-500 bg-blue-100 text-blue-900 rounded-lg w-full max-w-md'>
                                <p className='text-sm sm:text-base font-medium'>
                                    {renderWithLinks(response.aboutNataliaki)}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
	);
}

import React from 'react';


// Utility function to convert text with links into JSX elements
const renderWithLinks = (text: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    return text.split(urlRegex).map((part, index) => 
        urlRegex.test(part) ? (
            <a 
                key={index} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 underline hover:text-blue-800"
            >
                {part}
            </a>
        ) : (
            part
        )
    );
};