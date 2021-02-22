import './styles/App.css';
import { useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import Player from './components/Player';
import Login from './components/Login';

function App() {
  const spotifyApi = new SpotifyWebApi();
  const hashed = getHashParams();
  const [loginStatus, setLoginStatus] = useState(false)
  const [accessToken, setAccessToken] = useState()
  const [userData, setUserData] = useState({})
  let statusTimer;


  function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  if (hashed.access_token) {
    hashed.access_token !== accessToken && (setAccessToken(hashed.access_token))
    !loginStatus && (setLoginStatus(true))
    spotifyApi.setAccessToken(accessToken)
  } else {
    loginStatus && (setLoginStatus(false))
  }

  if (!userData.display_name) {
    fetch(
      'https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      }
    ).then(response => {
      return response.json()
    }).then(data => {
      if (data?.error?.status === 401) {
        console.warn('the access token is invalid')
      } else {
        setUserData(data)
      }
    })
  }

   let mouseMoved = (event) => {
     if (!document.getElementById('status-bar') || !document.getElementById('user-display-name')) return
    if (document.getElementById('status-bar').style.display === 'none' || document.getElementById('status-bar').style.display === '') document.getElementById('status-bar').style.display = 'flex'
    if (document.getElementById('user-display-name').style.display === 'none' || document.getElementById('user-display-name').style.display === '') document.getElementById('user-display-name').style.display = 'block'
    clearTimeout(statusTimer)
    if (document.getElementById('search-results').classList.contains('hide') && (document.getElementById('search-songs') !== document.activeElement)) {
      statusTimer = setTimeout(() => {
        document.getElementById('status-bar').style.display = 'none'
        document.getElementById('user-display-name').style.display = 'none'
      }, 3500);
    }
  }

  document.onmousemove = () => mouseMoved()

  return (
    <>
      {
        loginStatus && Object.keys(userData).length > 0
        ? (<Player spotifyApi={spotifyApi} accessToken={accessToken} userData={userData} mouseMoved={mouseMoved} />)
        : (<Login />)
      }
    </>
  );
}

export default App;
