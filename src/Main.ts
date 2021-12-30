class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;
    private socket:egret.WebSocket = new egret.WebSocket();
    private errorTrick: number = 0;
    private textIput:egret.TextField = new egret.TextField();
    private online: egret.TextField = new egret.TextField();

    public constructor() {
        super();
        this.once(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event): void {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }
    private onConfigComplete(evt: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.loadGroup('preload');
    }
    private onResourceLoadComplete(evt: RES.ResourceEvent) {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        this.createScene();
        this.connect();
    }
    private createScene() {
        // create background
        const bg: egret.Sprite = new egret.Sprite();
        bg.graphics.beginFill(0xebebeb);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        this.stage.addChild(bg);

        const bgPic = new egret.Bitmap();
        const texture: egret.Texture = RES.getRes('background_pic');
        bgPic.texture = texture;
        bgPic.width = this.stage.width;
        bgPic.height = this.stage.height;
        bgPic.fillMode = egret.BitmapFillMode.SCALE;
        this.stage.addChild(bgPic);

        // create textinput
        const wrapper:egret.Shape =  new egret.Shape();
        wrapper.graphics.beginFill(0x000000);
        wrapper.graphics.drawRect(0,0,this.stage.stageWidth - 100,40);
        wrapper.graphics.endFill();
        wrapper.alpha = .5;
        this.stage.addChild(wrapper);
        wrapper.touchEnabled = true;
        this.textIput.text = '';
        this.textIput.inputType = egret.TextFieldInputType.TEXT;
        this.textIput.type = egret.TextFieldType.INPUT;
        this.textIput.width = this.stage.width - 100;
        this.textIput.height = 40;
        this.textIput.verticalAlign = 'center';
        this.stage.addChild(this.textIput);
        const postionY = this.stage.stageHeight - 50;
        wrapper.y = postionY - 5;
        this.textIput.y = postionY;
        this.textIput.x = 10;
        
        // create send button
        const label: egret.Shape = new egret.Shape();
        label.graphics.beginFill(0x1dafec);
        label.graphics.drawRect(0, 0, 100, 40);
        label.graphics.endFill();
        label.x = this.stage.width - 100;
        label.y = postionY -5;
        label.alpha = .5;
        const button:egret.TextField = new egret.TextField();
        button.width = 100;
        button.height = 40;
        button.textColor = 0xffffff;
        button.text = "发送";
        button.size = 18;
        button.x = this.stage.width - 100;
        button.y = postionY - 5;
        button.textAlign = egret.HorizontalAlign.CENTER;
        button.verticalAlign = egret.VerticalAlign.MIDDLE;
        button.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(e) => {
                this.onPressSend(this.textIput.text);
            }, this);
        label.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(e) => {
                this.onPressSend(this.textIput.text);
            }, this);
        this.stage.addChild(label);
        this.stage.addChild(button);
        button.touchEnabled = true;
        label.touchEnabled = true;

        //create online number
        this.online.text = '同时在线 0人';
        this.online.x = this.stage.width - 90;
        this.online.y = 5;
        this.online.size = 14;
        this.online.textColor = 0x000;
        this.stage.addChild(this.online);
    }


    private connect(): void {
        this.socket.connect('127.0.0.1', 8080);
        this.socket.type = egret.WebSocket.TYPE_STRING;
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReciveMsg, this)
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
    }

    private onSocketClose():void {
        ++this.errorTrick;
        egret.log('closed');
        if(this.errorTrick > 5) return;
        this.socket.connect('127.0.0.1', 8080);
    }

    private onSocketOpen(): void {
        egret.log('connected');
    }
    
    private onSocketError(): void {
        egret.log('error');
        this.socket.connect('127.0.0.1', 8080);
    }

    private onPressSend(msg: string) {
        this.socket.writeUTF(JSON.stringify({message: msg}));
        const request: egret.HttpRequest = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(`http://127.0.0.1:8080/message/${this.textIput.text}`, egret.HttpMethod.POST);
        request.send(JSON.stringify({content: this.textIput.text}));
        this.textIput.text = '';
    }

    private onReciveMsg(e: egret.Event): void {
        const bytes: egret.ByteArray = new egret.ByteArray();
        let msg:any = this.socket.readUTF();
        msg = JSON.parse(msg);
        if(msg.message) this.createDanmaku(msg.message);
        if(msg.online) this.online.text = `同时在线 ${msg.online.toString()}`;
    }


    /**
     * hadnle for create danmaku
     */
    private createDanmaku(msg): void {
        if(!msg) return;
        const danmaku:egret.TextField = new egret.TextField();
        danmaku.text = msg;
        danmaku.y = Math.random() * (this.stage.stageHeight - 100);
        this.stage.addChild(danmaku);
        danmaku.x = this.stage.stageWidth - danmaku.textWidth;
        danmaku.size = 18 + Math.random() * 6;
        danmaku.textColor = parseInt(`0x${Math.random().toString(16).substr(2,6)}`);
        danmaku.stroke = 1;
        danmaku.strokeColor = 0xebebeb;
        let swith: number = this.stage.width;
        const enterFrame: number = 2 * (Math.random() + .5);
        egret.startTick(() => {
            if(swith < -1 * danmaku.textWidth) return true;
            swith -= enterFrame;
            danmaku.x = swith;
            return false;
        }, this);
    }
}


