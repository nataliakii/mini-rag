import { useState } from "react";
import { Menu, X } from "lucide-react"; // Icons for mobile menu

export default function Navbar ()  {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4 sm:p-6 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <a href="/" className="text-2xl font-bold text-blue-600">
                    Natalia Ki
                </a>

                {/* Desktop Menu */}
                <ul className="hidden sm:flex space-x-6 text-gray-700 font-medium">
                    <li><a href="/" className="hover:text-blue-500 transition">Home</a></li>
                    <li><a href="https://bbqr.site/me" className="hover:text-blue-500 transition">About</a></li>
                    <li><a href="https://bbqr.site/me" className="hover:text-blue-500 transition">Contact</a></li>
                </ul>

                {/* Search Button */}
                {/* <button className="hidden sm:block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                    Search
                </button> */}

                {/* Mobile Menu Button */}
                <button className="sm:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <ul className="sm:hidden flex flex-col items-center mt-4 space-y-4 bg-white p-4 shadow-md">
                    <li><a href="#" className="text-gray-700 hover:text-blue-500">Home</a></li>
                    <li><a href="#" className="text-gray-700 hover:text-blue-500">About</a></li>
                    <li><a href="#" className="text-gray-700 hover:text-blue-500">Contact</a></li>
                    <li>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                            Search
                        </button>
                    </li>
                </ul>
            )}
        </nav>
    );
};