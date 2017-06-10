cc.Class({
    extends: cc.Component,

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
    },

    // use this for initialization
    onLoad: function () {
         var node = new cc.Node("New Sprite");
         var sprite = node.addComponent(cc.Sprite);
         node.parent = this.node;
    },

    
    start: function(err) {
        // if (err) return;

        // init the map position
        // this._initMapPos();

        // // init the succeed layer
        // this._succeedLayer = this.node.getParent().getChildByName('succeedLayer');
        // this._succeedLayer.active = false;

        // // init the player position
        // this._tiledMap = this.node.getComponent('cc.TiledMap');
        // var objectGroup = this._tiledMap.getObjectGroup(this.objectGroupName);
        // if (!objectGroup) return;

        // var startObj = objectGroup.getObject(this.startObjectName);
        // var endObj = objectGroup.getObject(this.successObjectName);
        // if (!startObj || !endObj) return;

        // // yly 暂理解为 obj为 tiled中的 对象 获取的 x y 为 地图块元素坐标 例：  x：3 y：4
        // // 转换为 cocos 坐标 例如 x：300px y:400px
        // var startPos = cc.p(startObj.sgNode.x, startObj.sgNode.y);
        // var endPos = cc.p(endObj.sgNode.x, endObj.sgNode.y);

        // this._layerFloor = this._tiledMap.getLayer(this.floorLayerName);
        // this._layerBarrier = this._tiledMap.getLayer(this.barrierLayerName);
        // if (!this._layerFloor || !this._layerBarrier) return;

        // this._curTile = this._startTile = this._getTilePos(startPos);
        // this._endTile = this._getTilePos(endPos);

        // if (this._player) {
        //     this._updatePlayerPos();
        //     this._player.active = true;
        // }

        // this._isMapLoaded = true;
    }
    
    // ,restartGame: function() {
    //     this._succeedLayer.active = false;
    //     this._initMapPos();
    //     this._curTile = this._startTile;
    //     this._updatePlayerPos();
    // }
    // ,_initMapPos: function() {
    //     this.node.setPosition(cc.visibleRect.bottomLeft);
    // },
});
