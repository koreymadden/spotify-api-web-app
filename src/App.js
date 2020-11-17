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
      console.log('userData', data)
      setUserData(data)
    })
  }

  return (
    <>
      {
        loginStatus
        ? (<Player spotifyApi={spotifyApi} accessToken={accessToken} userData={userData} />)
        : (<Login />)
      }
    </>
  );
}

export default App;
