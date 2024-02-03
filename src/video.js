import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import Video.js CSS
import '@antmedia/videojs-webrtc-plugin';
import 'videojs-playbackrate-adjuster';
import 'videojs-seek-buttons';
import '@theonlyducks/videojs-zoom';
import '@theonlyducks/videojs-zoom/styles';
import 'videojs-seek-buttons/dist/videojs-seek-buttons.css'
import receiver from './Connection.js'


const VideoPlayer = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const {options, onReady} = props;

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");
      videoElement.setAttribute('id','video-js')
      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        onReady && onReady(player);
        player.play();
       
      });

    } else {
      const player = playerRef.current;
     
      player.autoplay(options.autoplay);
      receiver(options.sources[0].src, player);
      // player.src(options.sources);      
    }
  }, [options, videoRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}


export default VideoPlayer;
