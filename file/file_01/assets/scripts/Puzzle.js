
var MoveDirection = cc.Enum({
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
});

var minTilesCount = 2;
var mapMoveStep = 1;
var minMoveValue = 50;

cc.Class({
    extends: cc.Component,
    editor: {
        requireComponent: cc.TiledMap
    },

    properties: {

        _touchStartPos: {
            default: null,
            serializable: false,
        },
        _touching: {
            default: false,
            serializable: false,
        },

        _isMapLoaded : {
            default: false,
            serializable: false,
        },
        
        floorLayerName: {
            default: 'floor'
        },

        barrierLayerName: {
            default: 'barrier'
        },

        objectGroupName: {
            default: 'players'
        },

        startObjectName: {
            default:'SpawnPoint'
        },

        successObjectName: {
            default:'SuccessPoint'
        }
        
        // 变量名前用下划线时不显示组件名称，未确定使用下划线时 是否默认为私有属性
        ,rangeMove:{
            default: null
            ,type: cc.Prefab
            ,tiled: []
        }
        ,_rangMove:[]
        ,_enemys:[]
    },

    // use this for initialization
    onLoad: function () {
        this._player = this.node.getChildByName("player");
        if (! this._isMapLoaded) {
            this._player.active = false;
        }

        // yly 获取界面添加的 敌人精灵 添加敌人 start
        this._enemy_01 = this.node.getChildByName("enemy_01");
        this._enemy_02 = this.node.getChildByName("enemy_02");
        // this._enemys.push = this._enemy_01;
        // this._enemys.push = this._enemy_02;
        // yly 添加敌人 end

        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                self._onKeyPressed(keyCode, event);
            }
        }, self.node);
        
        // yly 
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            // 隐藏 （非激活）
            this._MenuLayer.active = false;
            
            var touchPos = event.touch.getLocation();
            var tilePos = this._getTilePos(touchPos);  // 鼠标点击的可见区域坐标转换为 砖块坐标 例0，1

            // 点击是否在移动范围内
            if(this._rangMove.hasOwnProperty(this._rangKey(tilePos))){
                var pos = this._layerFloor.getPositionAt(tilePos);  // 砖块坐标转换为map像素
                this._player.setPosition(pos);

                this._checkAttEnemy1(tilePos);
            }
            // yly 销毁创建的节点 start
            this._rangDestroy();
            // yly 销毁创建的节点 endthis._rangDestroy();
            

        }, self);

        // this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
        //     self._touching = true;
        //     self._touchStartPos = event.touch.getLocation();
        // }, self);
        // this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
        //     if (!self._touching || !self._isMapLoaded || self._succeedLayer.active) return;

        //     self._touching = false;
        //     var touchPos = event.touch.getLocation();
        //     cc.log("touchPos.x:"+touchPos.x+"***touchPos.y"+touchPos.y);

        //     cc.log(this._getTilePos(touchPos));

        //     // this._ylyTestAddSprite(touchPos);

        //     var movedX = touchPos.x - self._touchStartPos.x;
        //     var movedY = touchPos.y - self._touchStartPos.y;
        //     var movedXValue = Math.abs(movedX);
        //     var movedYValue = Math.abs(movedY);
        //     if (movedXValue < minMoveValue && movedYValue < minMoveValue) {
        //         // touch moved not enough
        //         return;
        //     }

        //     var newTile = cc.p(this._curTile.x, this._curTile.y);
        //     var mapMoveDir = MoveDirection.NONE;
        //     if (movedXValue >= movedYValue) {
        //         // move to right or left
        //         if (movedX > 0) {
        //             newTile.x += 1;
        //             mapMoveDir = MoveDirection.LEFT;
        //         } else {
        //             newTile.x -= 1;
        //             mapMoveDir = MoveDirection.RIGHT;
        //         }
        //     } else {
        //         // move to up or down
        //         if (movedY > 0) {
        //             newTile.y -= 1;
        //             mapMoveDir = MoveDirection.DOWN;
        //         } else {
        //             newTile.y += 1;
        //             mapMoveDir = MoveDirection.UP;
        //         }
        //     }
        //     this._tryMoveToNewTile(newTile, mapMoveDir);
        // }, self);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    _onKeyPressed: function(keyCode, event) {
        if (!this._isMapLoaded || this._succeedLayer.active) return;

        // cc.log(this._player._curTile.x+"***"+this._curTile.y);
        // cc.log(this._curTile.x+"***"+this._curTile.y);
        

        var newTile = cc.p(this._curTile.x, this._curTile.y);
        var mapMoveDir = MoveDirection.NONE;
        switch(keyCode) {
            case cc.KEY.up:
                newTile.y -= 1;
                mapMoveDir = MoveDirection.DOWN;
                break;
            case cc.KEY.down:
                newTile.y += 1;
                mapMoveDir = MoveDirection.UP;
                break;
            case cc.KEY.left:
                newTile.x -= 1;
                mapMoveDir = MoveDirection.RIGHT;
                break;
            case cc.KEY.right:
                newTile.x += 1;
                mapMoveDir = MoveDirection.LEFT;
                break;
            default:
                return;
        }

        this._tryMoveToNewTile(newTile, mapMoveDir);
    },


    restartGame: function() {
        this._succeedLayer.active = false;
        this._initMapPos();
        this._curTile = this._startTile;
        this._updatePlayerPos();
    },
    
    start: function(err) {
        if (err) return;
        
        // init the map position
        this._initMapPos();

        // init the succeed layer
        this._succeedLayer = this.node.getParent().getChildByName('succeedLayer');
        this._succeedLayer.active = false;

        // init the player position
        this._tiledMap = this.node.getComponent('cc.TiledMap');  
        var objectGroup = this._tiledMap.getObjectGroup(this.objectGroupName);
        if (!objectGroup) return;

        var startObj = objectGroup.getObject(this.startObjectName);
        var endObj = objectGroup.getObject(this.successObjectName);
        if (!startObj || !endObj) return;

        //  obj为 tiled中的 对象 获取的 x y 为 地图的px 坐标 x:143  y:46
        // 转换为 cocos 坐标对象 (143.00.46.00)
        var startPos = cc.p(startObj.sgNode.x, startObj.sgNode.y);
        var endPos = cc.p(endObj.sgNode.x, endObj.sgNode.y);

        this._layerFloor = this._tiledMap.getLayer(this.floorLayerName);
        this._layerBarrier = this._tiledMap.getLayer(this.barrierLayerName);
        if (!this._layerFloor || !this._layerBarrier) return;

        // 再有 cc 坐标对象转换为 tiled 块坐标 (3,4)
        this._curTile = this._startTile = this._getTilePos(startPos);
        this._endTile = this._getTilePos(endPos);

        // yly 添加敌人 start
        var enemy_tile_01 = this._getTilePos(this._enemy_01.getPosition());
        this._enemys[this._rangKey(enemy_tile_01)] = this._enemy_01;
        var enemy_tile_02 = this._getTilePos(this._enemy_02.getPosition());
        this._enemys[this._rangKey(enemy_tile_02)] = this._enemy_02;


        var enemyGroup = this._tiledMap.getObjectGroup('enemys');
        var enemy_01 = enemyGroup.getObject('EnemyPoint_01');
        var enemy_02 = enemyGroup.getObject('EnemyPoint_02');

        var enemy_01_Pos = this._getTilePos(cc.p(enemy_01.sgNode.x, enemy_01.sgNode.y));
        var enemy_02_Pos = this._getTilePos(cc.p(enemy_02.sgNode.x, enemy_02.sgNode.y));

        var enemy_Poses = [];
        enemy_Poses[this._rangKey(enemy_01_Pos)] = enemy_01_Pos;
        enemy_Poses[this._rangKey(enemy_02_Pos)] = enemy_02_Pos;

        // 添加敌人  // 动态加载敌人
        for(var key in this._enemys){
            this._updateObjectPos(enemy_Poses[key],this._enemys[key]);
            this._enemys[key].active = true;
        }

        // for(var i = 0 ;i<this._enemys.length;i++){
        //     cc.log(this._enemys[i]);
        //     this._updateObjectPos(this._getTilePos(enemy_01_Pos),this._enemys[i]);
        //     this._enemys[i].active = true;
        // }

        // this._updateObjectPos(this._getTilePos(enemy_01_Pos),this._enemys[0]);
        // this._enemys[0].active = true;
        // this._updateObjectPos(this._getTilePos(enemy_02_Pos),this._enemys[1]);
        // this._enemys[1].active = true;

        // this._updateObjectPos(this._getTilePos(enemy_01_Pos),this._enemy_01);
        // this._enemy_01.active = true;
        // this._updateObjectPos(this._getTilePos(enemy_02_Pos),this._enemy_02);
        // this._enemy_02.active = true;

        // yly 添加敌人 end

        // yly 添加移动限制 start
        this._layerHinder = this._tiledMap.getLayer("hinder");
        // yly 添加移动限制 end

        // yly 添加 layout
        this._MenuLayer = this.node.getParent().getChildByName('layout_Menu');
        this._MenuLayer.active = false;
        


        // cc.log(this._curTile);


        if (this._player) {
            this._updatePlayerPos();
            this._player.active = true;
        }

        this._isMapLoaded = true;
    },

    _initMapPos: function() {
        this.node.setPosition(cc.visibleRect.bottomLeft);
    },

    _updateObjectPos: function(_curTile,_sprite) {
        // cc.log("_updateObjectPos start");
        // cc.log("_curTile:"+_curTile);
        var pos = this._layerFloor.getPositionAt(_curTile);
        // cc.log("pos:"+pos.x+"**"+pos.y);
        _sprite.setPosition(pos);
        // cc.log(_sprite.getPosition());
        // cc.log(this._getTilePos(_sprite.getPosition()));
        // cc.log("_updateObjectPos end");
    },

    _updatePlayerPos: function() {
        // cc.log("_updatePlayerPos start");
        // cc.log("this._curTile:"+this._curTile);
        var pos = this._layerFloor.getPositionAt(this._curTile);
        // cc.log("pos:"+pos.x+"**"+pos.y);
        this._player.setPosition(pos);
        // cc.log(this._player.getPosition());
        // cc.log(this._getTilePos(this._player.getPosition()));
        // cc.log("_updatePlayerPos end");
    },

    _getTilePos: function(posInPixel) {
        // mapSize 为当前 map 的宽高 非可见区域
        var mapSize = this.node.getContentSize();
        var tileSize = this._tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        // cc.log("我在这里"+"mapSize.width "+mapSize.width+"**posInPixel.x:"+posInPixel.x+"**tileSize.width:"+tileSize.width);
        // cc.log("我在这里"+"mapSize.height "+mapSize.height+"**posInPixel.y:"+posInPixel.y+"**tileSize.height:"+tileSize.height);
        // var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        // cc.log("position.y:"+this.node.getPosition().y);
        // var y = Math.floor((mapSize.height - ((posInPixel.y) + -this.node.getPosition().y)) / tileSize.height);
        // y 不加1时 计算的 tile 会多 1
        var y = Math.floor((mapSize.height - ((posInPixel.y+1) + -this.node.getPosition().y)) / tileSize.height);


        // cc.log("我在这里"+"mapSize.height "+mapSize.height+"**posInPixel.y:"+posInPixel.y+"**tileSize.height:"+tileSize.height);
        // cc.log("test***********:"+y+"*******this.node.getPosition().y:"+this.node.getPosition().y);
        // 此时 x y 已经试砖块地图 块坐标， cc.p 用来封装
        return cc.p(x, y);
    },

    // _onKeyPressed: function(keyCode, event) {
    //     if (!this._isMapLoaded || this._succeedLayer.active) return;

    //     var newTile = cc.p(this._curTile.x, this._curTile.y);
    //     var mapMoveDir = MoveDirection.NONE;
    //     switch(keyCode) {
    //         case cc.KEY.up:
    //             newTile.y -= 1;
    //             mapMoveDir = MoveDirection.DOWN;
    //             break;
    //         case cc.KEY.down:
    //             newTile.y += 1;
    //             mapMoveDir = MoveDirection.UP;
    //             break;
    //         case cc.KEY.left:
    //             newTile.x -= 1;
    //             mapMoveDir = MoveDirection.RIGHT;
    //             break;
    //         case cc.KEY.right:
    //             newTile.x += 1;
    //             mapMoveDir = MoveDirection.LEFT;
    //             break;
    //         default:
    //             return;
    //     }

    //     this._tryMoveToNewTile(newTile, mapMoveDir);
    // },

    /**
     * newTile tiled 坐标 即 1，3  一行 3列
     */
    _tryMoveToNewTile: function(newTile, mapMoveDir) {
        var mapSize = this._tiledMap.getMapSize();
        if (newTile.x < 0 || newTile.x >= mapSize.width) return;
        if (newTile.y < 0 || newTile.y >= mapSize.height) return;

        
        if (this._layerBarrier.getTileGIDAt(newTile)) {
            cc.log('This way is blocked!');
            return false;
        }

        // update the player position
        this._curTile = newTile;
        this._updatePlayerPos();

        // move the map if necessary
        this._tryMoveMap(mapMoveDir);

        // check the player is success or not
        if (cc.pointEqualToPoint(this._curTile, this._endTile)) {
            cc.log('succeed');
            this._succeedLayer.active = true;
        }

        // yly 销毁创建的节点 start
        this._rangDestroy();
        // yly 销毁创建的节点 end

        // yly 停止动画 start
        this._player.getComponent(cc.Animation).stop();
        // yly 停止动画 end

    },

    _tryMoveMap: function(moveDir) {
        // get necessary data
        var mapContentSize = this.node.getContentSize();
        var mapPos = this.node.getPosition();
        var playerPos = this._player.getPosition();
        var viewSize = cc.size(cc.visibleRect.width, cc.visibleRect.height);
        var tileSize = this._tiledMap.getTileSize();
        var minDisX = minTilesCount * tileSize.width;
        var minDisY = minTilesCount * tileSize.height;

        var disX = playerPos.x + mapPos.x;
        var disY = playerPos.y + mapPos.y;
        var newPos;
        switch (moveDir) {
            case MoveDirection.UP:
                if (disY < minDisY) {
                    newPos = cc.p(mapPos.x, mapPos.y + tileSize.height * mapMoveStep);
                }
                break;
            case MoveDirection.DOWN:
                if (viewSize.height - disY - tileSize.height < minDisY) {
                    newPos = cc.p(mapPos.x, mapPos.y - tileSize.height * mapMoveStep);
                }
                break;
            case MoveDirection.LEFT:
                if (viewSize.width - disX - tileSize.width < minDisX) {
                    newPos = cc.p(mapPos.x - tileSize.width * mapMoveStep, mapPos.y);
                }
                break;
            case MoveDirection.RIGHT:
                if (disX < minDisX) {
                    newPos = cc.p(mapPos.x + tileSize.width * mapMoveStep, mapPos.y);
                }
                break;
            default:
                return;
        }

        if (newPos) {
            // calculate the position range of map
            var minX = viewSize.width - mapContentSize.width - cc.visibleRect.left;
            var maxX = cc.visibleRect.left.x;
            var minY = viewSize.height - mapContentSize.height - cc.visibleRect.bottom;
            var maxY = cc.visibleRect.bottom.y;

            if (newPos.x < minX) newPos.x = minX;
            if (newPos.x > maxX) newPos.x = maxX;
            if (newPos.y < minY) newPos.y = minY;
            if (newPos.y > maxY) newPos.y = maxY;

            if (!cc.pointEqualToPoint(newPos, mapPos)) {
                cc.log('Move the map to new position: ', newPos);
                this.node.setPosition(newPos);
            }
        }
    }


    ,_ylyTestAddSprite:function(pos){

        // 动态加载
        // var self = this;
        // var url = "content";
        // cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
        //      var node = new cc.Node("New Sprite");
        //      var sprite = node.addComponent(cc.Sprite);
        //      sprite.spriteFrame = spriteFrame;

        //      node.setPosition(pos);
        //      node.setAnchorPoint(0,0);
        //     //  node.setContentSize(512, 512);
        //     //  node.width=512;
        //     //  node.height=512;
        //      node.scalex = 0.0625;
        //     //  node.scaleY = 0.0625;
        //      node.parent = self.node;
        // });



        // // 使用 预设 资源
        // // 使用给定的模板在场景中生成一个新节点
        // var rangeMove = cc.instantiate(this.rangeMove);
        // // 将新增的节点添加到 Canvas 节点下面
        // this.node.addChild(rangeMove);
        var newPos = pos;
        // // newPos.x += -this.node.getPosition().x;
        // // newPos.y += -this.node.getPosition().y;

        var tilePos = this._getTilePos(newPos);  // 鼠标点击的可见区域坐标转换为 砖块坐标 例0，1
        // cc.log("tilePos:"+tilePos);  // 砖块坐标

        // var lf_pos = this._layerFloor.getPositionAt(tilePos);  // 砖块坐标转换为map像素
        // cc.log("newPos:"+newPos);  // (128.00, 96.00) 像素
        // cc.log("lf_pos:"+lf_pos);  // 128**96 像素
        // cc.log("this._curTile:"+this._curTile); // (3.00, 24.00) tiled坐标
        // 为星星设置一个位置
        // rangeMove.setPosition(lf_pos); // 添加了范围 本身不需要

        /***** 测试数据
        // cc 可见区域的像素  (3.00, 24.00)
        // cc.log(this._curTile);
        // this._getTilePos(this._curTile);
        // var pos = this._layerFloor.getPositionAt(this._curTile);
        // this._player.setPosition(pos);
        */

        var left = cc.p(tilePos.x-1,tilePos.y);
        this._addRangMove(left);
        var right = cc.p(tilePos.x+1,tilePos.y);
        this._addRangMove(right);
        var up = cc.p(tilePos.x,tilePos.y-1);
        this._addRangMove(up);
        var down = cc.p(tilePos.x,tilePos.y+1);
        this._addRangMove(down);

        var anim = this._player.getComponent(cc.Animation);
        // 如果没有指定播放哪个动画，并且有设置 defaultClip 的话，则会播放 defaultClip 动画
        anim.play();
        // 指定播放 test 动画
        // anim.play('test');

    }

    ,_addRangMove(tile){
        if (this._layerBarrier.getTileGIDAt(tile)) {
            cc.log('This way is blocked!');
            return false;
        }

        // 使用 预设 资源
        // 使用给定的模板在场景中生成一个新节点
        var rangeMove = cc.instantiate(this.rangeMove);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(rangeMove);
        var pos = this._layerFloor.getPositionAt(tile);  // 砖块坐标转换为map像素
        rangeMove.setPosition(pos);
        this._rangMove.push(rangeMove);
    }

    ,_checkAttEnemy1(tile){
      for(var key in this._enemys){
            this._checkAttEnemy2(tile,this._enemys[key]);
        }
    }
    ,_checkAttEnemy2(tilePos,_enemy){  // 检查 是否有可攻击的敌人
        var enemy_tilePos = this._getTilePos(_enemy.getPosition());
        // cc.log("tilePos:"+tilePos+"****enemy_tilePos:"+enemy_tilePos);
        var result = false;
        if(enemy_tilePos.x == tilePos.x+1 && enemy_tilePos.y == tilePos.y )result = true;
        if(enemy_tilePos.x == tilePos.x && enemy_tilePos.y == tilePos.y+1 )result = true;
        if(enemy_tilePos.x == tilePos.x-1 && enemy_tilePos.y == tilePos.y )result = true;
        if(enemy_tilePos.x == tilePos.x && enemy_tilePos.y == tilePos.y-1 )result = true;

        this._MenuLayer.active = result; // 显示菜单栏
        return result;
    }

    ,_addRangMove2(tile){
        // 使用 预设 资源
        // 使用给定的模板在场景中生成一个新节点
        var rangeMove = cc.instantiate(this.rangeMove);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(rangeMove);
        var pos = this._layerFloor.getPositionAt(tile);  // 砖块坐标转换为map像素
        rangeMove.setPosition(pos);

        // this._rangMove.push(rangeMove);
        this._rangMove[this._rangKey(tile)] = rangeMove;

        var anim = this._player.getComponent(cc.Animation);
        // 如果没有指定播放哪个动画，并且有设置 defaultClip 的话，则会播放 defaultClip 动画
        anim.play();
    }



    // 路径
    ,_ShowPathRange:function(sprite){
        var pos = this._getTilePos(sprite.touchPos);  // 鼠标点击的可见区域坐标转换为 砖块坐标 例0，1
        sprite.point = pos;

        var rangeList = new Array();
        var tempList = new Array();

        rangeList[this._rangKey(pos)] = {"pos":pos,"value":0};
        tempList[this._rangKey(pos)] = {"pos":pos,"value":0};

        var countPoint = 0;
        var i = 0;
        while (countPoint<sprite.mov){
            tempList = this._RangeScan(tempList, rangeList, sprite.mov);
            countPoint += 10;
            i++;
        }
        cc.log(i);

        for (var key in rangeList){  
            this._addRangMove2(rangeList[key]["pos"]);
        }
    }

    // 四叉树遍历
    // tempList:临时的四周检查点
    // rangeList:移动范围
    // moveLimit:精灵总的机动力
    ,_RangeScan(tempList,rangeList,moveLimit){
        var result = new Array(); 
        for (var key in tempList){       
            var pos = tempList[key]["pos"]; 
            var up = cc.p(pos.x,pos.y-1);
            var right = cc.p(pos.x+1,pos.y);
            var down = cc.p(pos.x,pos.y+1);
            var left = cc.p(pos.x-1,pos.y);
            this._directionScan(up,tempList[key]["value"],result,rangeList,moveLimit);
            this._directionScan(right,tempList[key]["value"],result,rangeList,moveLimit);
            this._directionScan(down,tempList[key]["value"],result,rangeList,moveLimit);
            this._directionScan(left,tempList[key]["value"],result,rangeList,moveLimit);
        }
        return result;
    }

    // 检查当前节点
    // point:当前检查点;   
    // matrix:当精灵在此位置的移动力   
    // tempList:临时的四周检查点
    // range:移动范围
    // moveLimit:精灵总的机动力
    ,_directionScan(point,matrix,tempList,range,moveLimit){
        if(
            // !range.hasOwnProperty(this._rangKey(point)) && // 
            // &&_IsEffectivelyCoordinate(point)    // 坐标是否有效
            this._layerFloor.getTileGIDAt(point)  // cc中 有效坐标
            // &&Matrix[direction.X, direction.Y] != 0 参考的代码中 这句代码意思为是否可以通过 即 是否为障碍物
            &&!this._layerBarrier.getTileGIDAt(point)  // cc中 直接获取是否是障碍物
            
            &&!this._enemys.hasOwnProperty(this._rangKey(point)) // 是否有敌人
            ){
            // 移动代价+当前地形的移动代价  
            // var value = matrix + Matrix[direction.X, direction.Y];
            var value = matrix + (this._layerHinder.getTileGIDAt(point)?20:10);
            if(value<=moveLimit){  // 当前移动力小于总的移动力
                var key = this._rangKey(point);
                if(!tempList.hasOwnProperty(key)){
                    tempList[key] = {"pos":point,"value":value};
                }else if(value<tempList[key].value){ //各方向到达同一地点，只取最小机动力消耗
                    tempList[key]["value"] = value;
                }

                if(!range.hasOwnProperty(this._rangKey(point))){
                    range[key] = {"pos":point,"value":value};
                }

            }
        }
    }

    ,_rangKey(point){
        return point.x+"_"+point.y;
    }

    // // 坐标是否有效 更换方法，cc中getTileGIDAt 返回0为无效
    // ,_IsEffectivelyCoordinate(point){
    //     var tileSize = this._tiledMap.getTileSize();
    //     return point.x>=0&&point.y>=0
    //     &&point.x<tileSize.width&&point.y<tileSize.height;
    // }

    ,_rangDestroy(){ 
        for (var key in this._rangMove){  
            this._rangMove[key].destroy();
        }
        this._rangMove = [];

        // 停止动画
        this._player.getComponent(cc.Animation).stop();
    }

});
