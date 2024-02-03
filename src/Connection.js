import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import Video.js CSS

function receiver(url,player) {
    new Receiver(url,player);
}

export default receiver;

const restartPause = 2000;

class Receiver {
	constructor(url,player) {
		this.terminated = false;
        this.url = url;
        this.player = player;
		this.ws = null;
		this.pc = null;
		this.restartTimeout = null;
		this.start();
	}

	start() {
		console.log("connecting");
        this.wsUrl = this.url.replace(/^http/, "ws") + 'ws'
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onerror = () => {
            console.log("ws error");
            if (this.ws === null) {
                return;
            }
            this.ws.close();
            this.ws = null;
        };

        this.ws.onclose = () => {
            console.log("ws closed");
            this.ws = null;
            this.scheduleRestart();
        };

        this.ws.onmessage = (msg) => this.onIceServers(msg);
	}

    onIceServers(msg) {
        if (this.ws === null) {
            return;
        }

        const iceServers = JSON.parse(msg.data);

        this.pc = new RTCPeerConnection({
            iceServers,
        });

        this.ws.onmessage = (msg) => this.onRemoteDescription(msg);
        this.pc.onicecandidate = (evt) => this.onIceCandidate(evt);

        this.pc.oniceconnectionstatechange = () => {
            if (this.pc === null) {
                return;
            }

            console.log("peer connection state:", this.pc.iceConnectionState);

            switch (this.pc.iceConnectionState) {
            case "disconnected":
                this.scheduleRestart();
            }
        };

        this.pc.ontrack = (evt) => {
            console.log("new track " + evt.track.kind);
            this.player.src({
                src: this.wsUrl,
                iceServers : msg.data,
                type: 'application/x-mpegURL'
            })
            this.player.on('ant-error',function(event,errors){
                console.log(errors);
            })
            
        };

        const direction = "sendrecv";
        this.pc.addTransceiver("video", { direction });
        this.pc.addTransceiver("audio", { direction });

        this.pc.createOffer()
            .then((desc) => {
                if (this.pc === null || this.ws === null) {
                    return;
                }

                this.pc.setLocalDescription(desc);

                console.log("sending offer");
                this.ws.send(JSON.stringify(desc));
            });
    }

	onRemoteDescription(msg) {
		if (this.pc === null || this.ws === null) {
			return;
		}

		this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
		this.ws.onmessage = (msg) => this.onRemoteCandidate(msg);
	}

    onIceCandidate(evt) {
        if (this.ws === null) {
            return;
        }

        if (evt.candidate !== null) {
            if (evt.candidate.candidate !== "") {
                this.ws.send(JSON.stringify(evt.candidate));
            }
        }
    }

	onRemoteCandidate(msg) {
		if (this.pc === null) {
			return;
		}

		this.pc.addIceCandidate(JSON.parse(msg.data));
	}

    scheduleRestart() {
        if (this.terminated) {
            return;
        }

        if (this.ws !== null) {
            this.ws.close();
            this.ws = null;
        }

        if (this.pc !== null) {
            this.pc.close();
            this.pc = null;
        }

        this.restartTimeout = window.setTimeout(() => {
            this.restartTimeout = null;
            this.start();
        }, restartPause);
    }
}

