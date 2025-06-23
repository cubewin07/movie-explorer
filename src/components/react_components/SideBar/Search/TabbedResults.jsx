import { Clapperboard, Tv } from 'lucide-react';
import { useState } from 'react';

function TabbedResults({ data, renderCards }) {
    const [activeTab, setActiveTab] = useState(data?.movies?.length > 0 ? 'movie' : 'tv');

    const tabClass = (tab) =>
        `flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium cursor-pointer border-b-2 transition-all duration-200 ${
            activeTab === tab
                ? 'text-primary border-primary bg-base-100'
                : 'text-base-content/70 border-transparent hover:text-primary hover:border-base-300 hover:bg-base-200'
        }`;

    return (
        <div className="w-full">
            {/* Custom Tab Headers */}
            <div className="flex gap-4 border-b border-base-300 px-4 sm:px-6">
                <button onClick={() => setActiveTab('movie')} className={tabClass('movie')}>
                    <Clapperboard className="w-4 h-4" />
                    <span>Movies</span>
                </button>
                <button onClick={() => setActiveTab('tv')} className={tabClass('tv')}>
                    <Tv className="w-4 h-4" />
                    <span>TV Series</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 bg-base-100">
                {activeTab === 'movie' ? (
                    data?.movies?.length > 0 ? (
                        renderCards(data.movies, 'movie')
                    ) : (
                        <p className="text-warning text-center">No movies found.</p>
                    )
                ) : data?.tv?.length > 0 ? (
                    renderCards(data.tv, 'tv')
                ) : (
                    <p className="text-warning text-center">No TV series found.</p>
                )}
            </div>
        </div>
    );
}

export default TabbedResults;
