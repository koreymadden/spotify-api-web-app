import { useState, useEffect } from 'react';
import DeviceList from './DeviceList'
import SearchResult from './SearchResult';

const Player = ({ spotifyApi, accessToken, userData }) => {
  const [counter, changeCounter] = useState(0);
  
  const [nowPlaying, setNowPlaying] = useState({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeDevice, setActiveDevice] = useState({})
  const [testingData, setTestingData] = useState('Test Data')
  const [currentDevices, setCurrentDevices] = useState([])
  const [volume, setVolume] = useState(-1)
  const [searchedTracks, setSearchedTracks] = useState([])
  const [ignoreVolumeMessages, setIgnoreVolumeMessages] = useState(false)
  const [trackProgress, setTrackProgress] = useState({
    actual: 0,
    max: 100
  })

  let skipVolumeMessage = false;
  let skipDurationMessage = false;
  let ignoreDurationMessages = false;

  if (!currentDevices.length) {
    getAllDevices()
  }

  useEffect(() => {
    setInterval(() => {
      changeCounter(prevCounter => prevCounter + 1);
      getNowPlaying()
    }, 1000);
  }, []);

  function getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState()
      .then(response => {
        document.title = response.item.name;
        setNowPlaying(response.item)
        setIsPlaying(response.is_playing)
        setActiveDevice(response.device)
        if (volume === -1 && !ignoreVolumeMessages) {
          !skipVolumeMessage
            ? setVolume(response.device.volume_percent) 
            : skipVolumeMessage = false;
        }
        if (!ignoreDurationMessages) {
          !skipDurationMessage 
            ? setTrackProgress({
              ...trackProgress,
              actual: response.progress_ms,
              max: response.item.duration_ms
            }) 
            : skipDurationMessage = false;
        }
        console.debug('Current Playback State:', response);
      })
  }

  function setUserVolume(value) {
    skipVolumeMessage = true;
    spotifyApi.setVolume(value)
      .then(function () {
        console.log(`Setting API volume to ${value}.`);
      });
  }

  function testing() {
    let limit = 3;
    spotifyApi.getMyRecentlyPlayedTracks({
      limit
    }).then(function (data) {
      console.log(`Your ${limit} most recently played tracks are:`);
      data.items.forEach(item => {
        console.log(item.track.album.name)
      })
    });
  }

  function getAllDevices() {
    spotifyApi.getMyDevices()
      .then(response => {
        setCurrentDevices(response.devices)
      })
  }

  function transferPlayback(device) {
    if (!device) return
    spotifyApi.transferMyPlayback([device])
      .then(function () {
        console.log('Transfering playback to ' + device);
      })
  }

  function playPause() {
    if (isPlaying) {
      spotifyApi.pause()
    } else {
      spotifyApi.play()
    }
  }

  function changeTrack(direction) {
    if (direction === 'next') {
      spotifyApi.skipToNext()
        .then(function () {
          console.log('Skip to next');
        });
    } else if (direction === 'previous') {
      spotifyApi.skipToPrevious()
        .then(function () {
          console.log('Skip to previous');
        });
    }

  }

  function updateTrackProgress(value) {
    skipDurationMessage = true;
    setTrackProgress({
      ...trackProgress,
      actual: value
    })
    spotifyApi.seek(value)
      .then(function () {
        console.log('Seek to ' + value);
      });
  }

  function searchSongs(searchText) {
    if (searchText === '') {
      toggleSearch('close')
      return
    }
    spotifyApi.searchTracks(searchText)
      .then(function (data) {
        console.log(`Search by "${searchText}"`, data);
        setSearchedTracks(data.tracks.items)
      }, function (err) {
        console.error(err);
      });
  }

  function toggleSearch(value, searchText) {
    if (searchText === '') return
    const searchMenu = document.getElementById('search-results');
    const closeIcon = document.getElementById('close-search-div');
    if (value === 'close') {
      searchMenu.classList.add('hide')
      closeIcon.classList.add('hide')
    } else if (value === 'open') {
      searchMenu.classList.remove('hide')
      closeIcon.classList.remove('hide')
    }
  }

  function addToFavorites() {
    let favorite = nowPlaying;
    console.log('favorite: ', favorite);

    spotifyApi.addToMySavedTracks([favorite.id])
      .then(data => {
        console.log(`Added ${favorite.name}!`)
      })
  }

  function changeSong(uri) {
    fetch(
      'https://api.spotify.com/v1/me/player/queue?uri=' + uri, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }
    ).then(response => {
      console.log('response: ', response);
      changeTrack('next');
    })
  }

  return ( 
    <div className="App">
      <a id='login-a' href='http://localhost:8888/'>
        <div id='login'>{
          userData.display_name 
            ? <span>{userData.display_name}</span> 
            : <span id='login-text'>Login</span>
          }
        </div>
      </a>
      <div id='now-playing-img-div'>
        <img id='now-playing-img' src={nowPlaying?.album?.images[0]?.url} alt="Album Art" width='300' height='300' />
        <div className="overlay" onClick={() => addToFavorites()}>
          <ion-icon name="heart-sharp"></ion-icon>
        </div>
      </div>
      <div id='now-playing-name'>
        {nowPlaying.name}
      </div>
      <select id='transfer-playback-selection' value={activeDevice.id} onChange={e => {transferPlayback(e.target.value)}}>
        {
          currentDevices.map(device => {
            return <DeviceList key={device.id} id={device.id} name={device.name} />
          })
        }
      </select>
      <ion-icon id='dropdown-arrow' name="chevron-down-sharp"></ion-icon>
      <div id='progress'>
        <input id="progress-slider" type="range" value={trackProgress.actual} onMouseDown={e => {ignoreDurationMessages = true; setTrackProgress({...trackProgress, actual: e.target.value})}} onChange={e => {setTrackProgress({...trackProgress, actual: e.target.value})}} onMouseUp={e => {ignoreDurationMessages = false; updateTrackProgress(e.target.value)}} min='0' max={trackProgress.max} />
      </div>
      <div id='player'>
        <div id="previous">
          <ion-icon name="play-back-sharp" onClick={() => {changeTrack('previous')}}></ion-icon>
        </div>
        <div id="play-pause" onClick={() => playPause()}>
          {isPlaying ? (<ion-icon name="pause-sharp"></ion-icon>) : (<ion-icon name="play-sharp"></ion-icon>)}
        </div>
        <div id="next">
          <ion-icon name="play-forward-sharp" onClick={() => {changeTrack('next')}}></ion-icon>
        </div>
      </div>
      <button onClick={() => testing()} style={{display: "block", margin: "50px auto"}}>
        Test
      </button>
      <div>
        {testingData}
      </div>
      <div>
        {counter}
      </div>
      <div className='hide' id='search-results' data-text={document.getElementById('search-songs')?.value || ''}>
        {
          searchedTracks.map(track => {
            return (
              <div key={track.id} onClick={() => changeSong(track.uri)}>
                <SearchResult image={track.album.images[0].url} name={track.name} artists={track.artists} duration={track.duration_ms} trackId={track.id} activeSong={nowPlaying.id} />
              </div>
            )
          })
        }
      </div>
      <div id='close-search-div' className="hide">
        <ion-icon id='close-search' name="close-sharp" onClick={() => toggleSearch('close')}></ion-icon>
      </div>
      <div id="status-bar">
        <ion-icon id="search-songs-icon" name="search-sharp"></ion-icon>
        <input type="search" onKeyPress={e => {searchSongs(e.target.value); toggleSearch('open', e.target.value)}} autoComplete='off' name="Songs" id='search-songs' onChange={e => {searchSongs(e.target.value); toggleSearch('open', e.target.value)}} />
        
        <div id="volume">
          <input id='volume-slider' type="range" value={volume} onMouseDown={e => {setIgnoreVolumeMessages(true); setVolume(e.target.value)}} onChange={e => {setVolume(e.target.value)}} onMouseUp={e => {setUserVolume(e.target.value)}} className="slider" min="0" max="100" />
        </div>
      </div>
    </div>
  );
};

export default Player;