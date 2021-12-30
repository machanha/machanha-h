<?php

class GameAct
{

}


class SwooleWebsocketServer
{
    private $server;
    private $user      = [];
    private $blackList = [];

    function __construct($ip, $port)
    {
        $this->server = new swoole_websocket_server($ip, $port);
        $this->server->on('open', function (swoole_websocket_server $server, $request) {
            $this->users($request->fd, 'add');
            echo "server: handshake success with fd{$request->fd}\n";
            $this->countOnline();
        });
        $this->server->on('message', function (swoole_websocket_server $server, $frame) {
            echo "receive from {$frame->fd}:{$frame->data},opcode:{$frame->opcode},fin:{$frame->finish}\n";
            $this->broadcast($frame->data, $frame->fd);

        });
        $this->server->on('close', function ($server, $fd) {
            unset($this->user[$fd]);
            echo "client {$fd} closed\n";
            $this->countOnline();
        });
        $this->server->start();
    }

    /*
     * 用户数据
     */
    function users($fd, $action = null, Closure $cb = null)
    {
        $clientInfo = $this->server->getClientInfo($fd);
        if (isset($this->blackList[$clientInfo['remote_ip']])) {
            if (time() - $this->blackList[$clientInfo['remote_ip']] < 3600) {
                $this->server->close($fd);
                if ($this->user[$fd]) {
                    unset($this->user[$fd]);
                }
                return false;
            }
        }
        switch (strtolower($action)) {
            case 'add':
                if (!isset($this->user[$fd])) {
                    $this->user[$fd] = [
                        'ini'  => time(),
                        'bad'  => 0,
                        'fd'   => $fd,
                        'time' => time(),
                    ];
                }
                break;
            case 'ban':
                if ($this->user[$fd]) {
                    $this->user[$fd]['bad']++;
                    if ($this->user[$fd]['bad'] > 10) {
                        $this->blackList[$clientInfo['remote_ip']] = time();
                        $this->users($fd);
                    }
                }
                break;

            default :
                ;
                if ($cb) {
                    return $cb($clientInfo, $this->user[$fd]);
                }
        }
        return false;
    }

    function broadcast($data, $fd = null)
    {
        if ($fd) {
            $lastTime = $this->user[$fd]['time'];
            if (time() - $lastTime < 2) {
                $this->server->push($fd, '数据发送间隔需大于1秒');
                $this->users($fd, 'ban');
                return;
            }
            $res = $this->server->push($fd, $data);
            if (!$res) {
                $this->users($fd, 'ban');
                return;
            } elseif ($this->user[$fd]) {
                $tmp = $this->user[$fd];
                unset($this->user[$fd]);
            }
        }
        foreach ($this->user as $v) {
            $this->server->push($v['fd'], $data);
        }
        if ($fd && isset($tmp)) {
            $this->user[$fd]         = $tmp;
            $this->user[$fd]['time'] = time();

        }
    }

    function countOnline()
    {
        $x = count($this->user);
        $this->broadcast('当前在线人数：' . $x);
    }
}

$serv = new SwooleWebsocketServer(
    '0.0.0.0', 9501
);