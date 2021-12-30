<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/9/28
 * Time: 15:52
 */



$a = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxcc3d4590929753d7&redirect_uri=http%3A%2F%2Ffsh.jiakuaibao.com%2FWebAuthCallback%3Furl%3Dhttp%3A%2F%2Ffsh.jiakuaibao.com%2Ffsh%2Fact30_86%3Fuid%3D1%26share_id%3D1%26new%3D1&response_type=code&scope=snsapi_userinfo&state=150658706732657989&uin=MTUxNDI5NDkwNw%3D%3D&key=6162b85e4641cad0b480822a25566a5641cf40d1e936ef2977b376e7d6416806f09fcfba40d0f7c35f0a804ba7799807&pass_ticket=vcG0hfokJ5W4s6yWjdAkwNNJWFoUvHfB45Rl5czXpvVWTgBDR9CP5+IUmt6VnIuAB12T4NMRmCQgy29VYbD2Kw==';


$v  = 'http://fsh.jiakuaibao.com/fsh/act30_86?uid=1&share_id=1';
function lanEncode ($s){
    return str_replace('=','_v_',base64_encode($s));
}

function lanDecode($s){
    return base64_decode(str_replace('_v_','=',$s));
}

echo $t = lanEncode($v);
echo lanDecode($t);