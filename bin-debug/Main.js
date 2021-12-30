var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.socket = new egret.WebSocket();
        _this.errorTrick = 0;
        _this.textIput = new egret.TextField();
        _this.online = new egret.TextField();
        _this.once(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    Main.prototype.onConfigComplete = function (evt) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.loadGroup('preload');
    };
    Main.prototype.onResourceLoadComplete = function (evt) {
        RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        this.createScene();
        this.connect();
    };
    Main.prototype.createScene = function () {
        var _this = this;
        // create background
        var bg = new egret.Sprite();
        bg.graphics.beginFill(0xebebeb);
        bg.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);
        bg.graphics.endFill();
        this.stage.addChild(bg);
        var bgPic = new egret.Bitmap();
        var texture = RES.getRes('background_pic');
        bgPic.texture = texture;
        bgPic.width = this.stage.width;
        bgPic.height = this.stage.height;
        bgPic.fillMode = egret.BitmapFillMode.SCALE;
        this.stage.addChild(bgPic);
        // create textinput
        var wrapper = new egret.Shape();
        wrapper.graphics.beginFill(0x000000);
        wrapper.graphics.drawRect(0, 0, this.stage.stageWidth - 100, 40);
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
        var postionY = this.stage.stageHeight - 50;
        wrapper.y = postionY - 5;
        this.textIput.y = postionY;
        this.textIput.x = 10;
        // create send button
        var label = new egret.Shape();
        label.graphics.beginFill(0x1dafec);
        label.graphics.drawRect(0, 0, 100, 40);
        label.graphics.endFill();
        label.x = this.stage.width - 100;
        label.y = postionY - 5;
        label.alpha = .5;
        var button = new egret.TextField();
        button.width = 100;
        button.height = 40;
        button.textColor = 0xffffff;
        button.text = "发送";
        button.size = 18;
        button.x = this.stage.width - 100;
        button.y = postionY - 5;
        button.textAlign = egret.HorizontalAlign.CENTER;
        button.verticalAlign = egret.VerticalAlign.MIDDLE;
        button.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
            _this.onPressSend(_this.textIput.text);
        }, this);
        label.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (e) {
            _this.onPressSend(_this.textIput.text);
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
    };
    Main.prototype.connect = function () {
        this.socket.connect('127.0.0.1', 8080);
        this.socket.type = egret.WebSocket.TYPE_STRING;
        this.socket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.onReciveMsg, this);
        this.socket.addEventListener(egret.Event.CONNECT, this.onSocketOpen, this);
        this.socket.addEventListener(egret.Event.CLOSE, this.onSocketClose, this);
        this.socket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onSocketError, this);
    };
    Main.prototype.onSocketClose = function () {
        ++this.errorTrick;
        egret.log('closed');
        if (this.errorTrick > 5)
            return;
        this.socket.connect('127.0.0.1', 8080);
    };
    Main.prototype.onSocketOpen = function () {
        egret.log('connected');
    };
    Main.prototype.onSocketError = function () {
        egret.log('error');
        this.socket.connect('127.0.0.1', 8080);
    };
    Main.prototype.onPressSend = function (msg) {
        this.socket.writeUTF(JSON.stringify({ message: msg }));
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open("http://127.0.0.1:8080/message/" + this.textIput.text, egret.HttpMethod.POST);
        request.send(JSON.stringify({ content: this.textIput.text }));
        this.textIput.text = '';
    };
    Main.prototype.onReciveMsg = function (e) {
        var bytes = new egret.ByteArray();
        var msg = this.socket.readUTF();
        msg = JSON.parse(msg);
        if (msg.message)
            this.createDanmaku(msg.message);
        if (msg.online)
            this.online.text = "\u540C\u65F6\u5728\u7EBF " + msg.online.toString();
    };
    /**
     * hadnle for create danmaku
     */
    Main.prototype.createDanmaku = function (msg) {
        if (!msg)
            return;
        var danmaku = new egret.TextField();
        danmaku.text = msg;
        danmaku.y = Math.random() * (this.stage.stageHeight - 100);
        this.stage.addChild(danmaku);
        danmaku.x = this.stage.stageWidth - danmaku.textWidth;
        danmaku.size = 18 + Math.random() * 6;
        danmaku.textColor = parseInt("0x" + Math.random().toString(16).substr(2, 6));
        danmaku.stroke = 1;
        danmaku.strokeColor = 0xebebeb;
        var swith = this.stage.width;
        var enterFrame = 2 * (Math.random() + .5);
        egret.startTick(function () {
            if (swith < -1 * danmaku.textWidth)
                return true;
            swith -= enterFrame;
            danmaku.x = swith;
            return false;
        }, this);
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
