class WsConnect {

    constructor(connect, onmessage)
    {
        let wsServer        = 'ws://120.78.72.42:9501';
        let websocket       = new WebSocket(wsServer);
        this.websocket = websocket;
        websocket.onopen    = () =>
        {
            if(websocket.readyState){
                connect();
            }
        };
        websocket.onmessage = (m) =>
        {
            onmessage(m.data);
        };


    }

    send (x){
        this.websocket.send(x);
    }
    connectStatus()
    {
        /*
         CONNECTING    0    The connection is not yet open.
         OPEN    1    The connection is open and ready to communicate.
         CLOSING    2    The connection is in the process of closing.
         CLOSED    3    The connection is closed or couldn't be opened.
         */
    }
}



