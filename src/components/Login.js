const Login = () => {
    return (
        <div id="login-page">
            <a id='login-block' href='http://localhost:8888/login'>
                <img src="https://www.logo.wine/a/logo/Spotify/Spotify-Icon-Black-Logo.wine.svg" alt="Spotify Logo" height='200' width='200' />
                <div id='login' style={{color: '#cdcdcd', backgroundColor: 'transparent', border: '2px solid #cdcdcd', borderRadius: '20px'}}>
                    Login to Spotify
                </div>
            </a>
        </div>
    );
};

export default Login;