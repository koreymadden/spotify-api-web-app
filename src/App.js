import './App.css';
import { useState, useEffect } from 'react';
import Spotify from 'spotify-web-api-js';
import DeviceList from './deviceList'

const spotifyWebApi = new Spotify();
let skipVolumeMessage = false;
let skipDurationMessage = false;
let ignoreDurationMessages = false;
let ignoreVolumeMessages = false;

function App() {
  
  const hashed = getHashParams();
  const [counter, changeCounter] = useState(0);
  const [loginStatus, setLoginStatus] = useState(hashed.access_token)
  const [nowPlaying, setNowPlaying] = useState({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [testingData, setTestingData] = useState('Test Data')
  const [currentDevices, setCurrentDevices] = useState([])
  const [targetTransferDevice, setTargetTransferDevice] = useState('')
  const [volume, setVolume] = useState(-1)
  const [trackProgress, setTrackProgress] = useState({
    actual: 0,
    max: 100
  })

  if (loginStatus) {
    spotifyWebApi.setAccessToken(loginStatus)
  }
  if (!currentDevices.length) {
    getAllDevices()
  }
  if (JSON.stringify(nowPlaying) === '{}') {
    getNowPlaying()
  }

  useEffect(() => {
    setInterval(() => {
      changeCounter(prevCounter => prevCounter + 1);
      getNowPlaying()
    }, 1000);
  }, []);

  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  function getNowPlaying() {
    spotifyWebApi.getMyCurrentPlaybackState()
    .then(response => {
      setNowPlaying(response.item)
      setIsPlaying(response.is_playing)
      if (volume === -1 && !ignoreVolumeMessages) {
        !skipVolumeMessage ? setVolume(response.device.volume_percent) : skipVolumeMessage = false;
      }
      if (!ignoreDurationMessages) {
        !skipDurationMessage ? setTrackProgress({...trackProgress, actual: response.progress_ms, max: response.item.duration_ms}) : skipDurationMessage = false;
      }
      console.debug('Current Playback State:', response);
    })
  }

  function setUserVolume(value) {
    skipVolumeMessage = true;
    spotifyWebApi.setVolume(value)
    .then(function () {
      console.log(`Setting API volume to ${value}.`);
      });
  }
  
  function testing() {
    let limit = 3;
    spotifyWebApi.getMyRecentlyPlayedTracks({
      limit
    }).then(function(data) {
        console.log(`Your ${limit} most recently played tracks are:`);
        data.items.forEach(item => {
          console.log(item.track.album.name)
        })
      });
  }

  function getAllDevices() {
    spotifyWebApi.getMyDevices()
    .then(response => {
      setCurrentDevices(response.devices)
    })
  }

  function transferPlayback(device) {
    if (!device) return
    spotifyWebApi.transferMyPlayback([device])
      .then(function () {
        console.log('Transfering playback to ' + device);
      })
  }

  function playPause() {
    if (isPlaying) {
      spotifyWebApi.pause()
    } else {
      spotifyWebApi.play()
    }
  }

  function changeTrack(direction) {
    if (direction === 'next') {
      spotifyWebApi.skipToNext()
      .then(function () {
        console.log('Skip to next');
      });
    } else if (direction === 'previous') {
      spotifyWebApi.skipToPrevious()
      .then(function () {
        console.log('Skip to previous');
      });
    }
    
  }

  function updateTrackProgress(value) {
    skipDurationMessage = true;
    setTrackProgress({...trackProgress, actual: value})
    spotifyWebApi.seek(value)
    .then(function () {
      console.log('Seek to ' + value);
      });
  }

  return (
    <div className="App">
      <a href='http://localhost:8888/'>
        <button>Login With Spotify</button>
      </a>
      <div>
        Now Playing: {nowPlaying.name}
      </div>
      <div>
        <img src={nowPlaying?.album?.images[0]?.url} alt="Album Art" width='200' />
      </div>
      <button onClick={() => getNowPlaying()}>
        Update Now Playing
      </button>
      <button onClick={() => testing()}>
        Test
      </button>
      <button onClick={() => getAllDevices()}>
        Get Devices
      </button>
      <button onClick={() => transferPlayback(targetTransferDevice)}>
        Transfer Playback
      </button>
      <select id='transferPlaybackSelection' onChange={e => {setTargetTransferDevice(e.target.value)}}>
        {
          currentDevices.map(device => {
            return <DeviceList key={device.id} id={device.id} name={device.name} />
          })
        }
      </select>
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
      <div id="volume">
        <input id='volume-slider' type="range" value={volume} onMouseDown={e => {ignoreVolumeMessages = true; setVolume(e.target.value)}} onChange={e => {setVolume(e.target.value)}} onMouseUp={e => {setUserVolume(e.target.value)}} className="slider" min="0" max="100" />
      </div>
      <div>
        {testingData}
      </div><div>
        {counter}
      </div>
    </div>
  );
}

export default App;
