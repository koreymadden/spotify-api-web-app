const SearchResult = ({ image, name, artists, duration, trackId, activeSong }) => {

    let currentSong = false
    if (activeSong === trackId) currentSong = true;

    const formatDuration = (milliseconds) => {
        let seconds = (milliseconds / 1000).toFixed(0);
        let minutes = Math.floor(Number(seconds) / 60).toString();
        let hours;
        if (Number(minutes) > 59) {
            hours = Math.floor(Number(minutes) / 60);
            hours = (hours >= 10) ? hours : '0' + hours;
            minutes = (Number(minutes) - (hours * 60)).toString();
            minutes = (Number(minutes) >= 10) ? minutes : '0' + minutes;
        }
        seconds = Math.floor(Number(seconds) % 60).toString();
        seconds = (Number(seconds) >= 10) ? seconds : '0' + seconds;
        !hours && (hours = '00')
        !minutes && (minutes = '00')
        !seconds && (seconds = '00')
        if (hours !== '00') return `${hours}:${minutes}:${seconds}`
        return `${minutes}:${seconds}`;
    }

    return (
        <div className='result-row'>
            <img className='search-result-img' src={image} alt=""/>
            <div className="search-info">
                <div className={currentSong ? 'current-song search-result' : 'search-result'}>
                    {name}
                </div>
                <div className="result-artist">
                    <span>{artists[0].name}</span>
                    <span id='track-duration'>{formatDuration(duration)}</span>
                </div>
            </div>
            {
                currentSong && (
                <div>
                    <ul className="volume-animation">
                        <li><span>&nbsp;</span></li>
                        <li><span>&nbsp;</span></li>
                        <li><span>&nbsp;</span></li>
                        <li><span>&nbsp;</span></li>
                        <li><span>&nbsp;</span></li>
                    </ul>
                </div>
                )
            }
        </div>
    );
};

export default SearchResult;