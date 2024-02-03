import React from 'react';
import VideoPlayer from './video';
import './App.css'

import '@theonlyducks/videojs-zoom/styles';
import '@theonlyducks/videojs-zoom';

import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}


const App = () => {
  let query = useQuery();
  let queryVideoUrl =   query.get('videoUrl') 
  const videoUrl = queryVideoUrl? 
  (queryVideoUrl) : 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const playerRef = React.useRef(null);

  const videoJsOptions = {
    controls: true, // Show video controls
        controlBar: {
          fullscreenToggle: true // Enable the fullscreen button in the control bar
        },
        playbackRates: [0.5, 1, 1.5, 2, 4],
    autoplay: true,
    responsive: true,
    fluid: true,
    sources: [{
      src:  videoUrl,
      type: 'video/mp4'
    }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;
    player.zoomPlugin({
      showZoom: true,
      showMove: true,
      showRotate: true,
      gestureHandler: false
    });
    player.seekButtons({
      forward: 30,
      back: 10
    });

  };

  return (
    <>
      <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
    </>
  );
};

export default App;
