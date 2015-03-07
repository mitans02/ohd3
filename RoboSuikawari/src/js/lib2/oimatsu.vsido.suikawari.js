/**
 * Oimatsu Vsido Suikawari Library
 *
 * this library require the following libraries.
 *  - jQuery
 *
 */
var TeamOimatsuVsidoSuika = function(config){
	this.ip = null;
	if(config && config['ip']) {
		this.ip = config['ip'];
	}
	else {
		this.ip = window.location.hostname;
	}
	
	this.status = TeamOimatsuVsidoSuika.STATUS.NONE;
	this.sendCmdQueue         = [];
	this.sendCmdQueueLimit    = 5;
	this.sendResultCheckRetry = 10;
	this.sendResultCheckRetryInterval = 100;
	this.resCorrectThres      = 20;
	
	this.sendLoopInterval = 100;
};
TeamOimatsuVsidoSuika.STATUS = {
	NONE : 'none',
	READY: 'connect',
	FAILED: 'failed',
	FIN  : 'finish'
};
TeamOimatsuVsidoSuika.APP_MODE = {
	ANALOG:0,
	SENSOR:1
};
TeamOimatsuVsidoSuika.SEND_TYPE = {
	ANGLE:1,
	IK   :'ik'
};

/**
 * @summary set status of suika wari library, when status is changed, trigger event.
 * @function getStatus
 * @param {number} status
 */
TeamOimatsuVsidoSuika.prototype.setStatus = function(status){
	this.status = status;
	
	$(this).trigger('status/'+status);
};

/**
 * @summary init oimatsu vsido suika library
 * @function init
 *
 */
TeamOimatsuVsidoSuika.prototype.init = function(){
	// if you are authorized, you can ride a robot cockpit!!
    this.vsido = new VSidoWeb({'ip':this.ip});
	if(this.vsido !== undefined) {
		this.setStatus(TeamOimatsuVsidoSuika.STATUS.READY);
		
		// start send loop
		this._startSendLoop();
		
		// jyro direction of camera
		this.startCameraDirection();
	} else {
		this.setStatus(TeamOimatsuVsidoSuika.STATUS.FAILED);
		// jyro direction of camera
		this.startCameraDirection();
	}
};

/**
 * @summary check range number is correct
 * @function fixRange
 * @param {number} num
 * @return checked range number
 */
TeamOimatsuVsidoSuika.prototype.fixRange = function(num){
	var ret=num;
	if(num<-100){ret=-100;}
	else if(num>100){ret=100;}
	return ret;
};

/**
 * @private
 * @summary send loop
 * @function _startSendLoop
 */
TeamOimatsuVsidoSuika.prototype._startSendLoop = function(cmd){
	var that = this;
	function sendloop(){
		if(that.sendCmdQueue.length > 0){
			var q = that.sendCmdQueue.shift();
			that.vsido.send(q.cmd);
			
			if(q.type !== undefined){
				if(q.type === TeamOimatsuVsidoSuika.SEND_TYPE.IK) {
					// result check
					var ik = that.vsido.readIK();
					ik['ikf']['cur'] = q.cmd.ikf.dist;
					ik['kids'].push(q.cmd.kdts[0].kid);
					that.vsido.send(ik, function(res){
						console.log(res, q);
						
						// if result fail, retry this commnd in next time.
						if(res && res.type == TeamOimatsuVsidoSuika.SEND_TYPE.IK &&
						res.kdts !== undefined && res.kdts.length > 0 && res.kdts[0].kid == q.cmd.kdts[0].kid){
							// check
							var pos = res.kdts[0].kdt.pos;
							var ppos = q.cmd.kdts[0].kdt.pos;
							if(((ppos.x-that.resCorrectThres)<=pos.x&&pos.x<=(ppos.x+that.resCorrectThres)) &&
								((ppos.y-that.resCorrectThres)<=pos.y&&pos.y<=(ppos.y+that.resCorrectThres)) &&
								((ppos.z-that.resCorrectThres)<=pos.z&&pos.z<=(ppos.z+that.resCorrectThres))){
								// OK
									// pass
							} else {
								// failed. retry
								q.retry = q.retry + 1;
								if(q.retry <= that.sendResultCheckRetry) {
									that.sendCmdQueue.unshift(q);
								}
							}
						} else {
							// failed. retry
							q.retry = q.retry + 1;
							if(q.retry <= that.sendResultCheckRetry) {
								that.sendCmdQueue.unshift(q);
							}
						}
						
						if(that.status === TeamOimatsuVsidoSuika.STATUS.READY) {
							setTimeout(sendloop, that.sendLoopInterval);
						}
					});
				} else if(q.type === TeamOimatsuVsidoSuika.SEND_TYPE.ANGLE) {
					// result check
					var info = that.vsido.readServoInfo();
					var angle = that.vsido.readServoAngle();
					info["servo"].push(angle);
					that.vsido.send(info, function(res){
						console.log(res, q);
						
						// failed. retry
						q.retry = q.retry + 1;
						if(q.retry <= that.sendResultCheckRetry) {
							that.sendCmdQueue.unshift(q);
						}
						
						if(that.status === TeamOimatsuVsidoSuika.STATUS.READY) {
							setTimeout(sendloop, that.sendLoopInterval);
						}
					});
				}
			} else {
				if(that.status === TeamOimatsuVsidoSuika.STATUS.READY) {
					setTimeout(sendloop, that.sendLoopInterval);
				}
			}
		} else {
			if(that.status === TeamOimatsuVsidoSuika.STATUS.READY) {
				setTimeout(sendloop, that.sendLoopInterval);
			}
		}
	}
	setTimeout(sendloop, this.sendLoopInterval);
};
/**
 * @private
 * @summary send command to Vsido
 * @function _send
 * @param {object} cmd
 * @param {TeamOimatsuVsidoSuika.SEND_TYPE} type
 */
TeamOimatsuVsidoSuika.prototype._send = function(cmd, type){
	if(this.status !== TeamOimatsuVsidoSuika.STATUS.READY) {
		return; // nothing to do
	}
	
	if(this.sendCmdQueue.length <= this.sendCmdQueueLimit) {
		this.sendCmdQueue.push({"cmd":cmd,"type":type,"retry":0});
	}
};
/**
 * @summary do motion
 * @function doIKMotion
 */
TeamOimatsuVsidoSuika.prototype.doIKMotion = function(ikmotion){
	// ik command
	for(var i = 0;i < ikmotion.length; i++){
		var ik = this.vsido.ik();
		ik['ikf']['dist']['pos'] = true;
	
		var kdt = this.vsido.kdt();
		var motion = ikmotion[i];
		kdt['kid'] = motion.kid; // left arm
		kdt['kdt']['pos']['x'] = motion.x;
		kdt['kdt']['pos']['y'] = motion.y;
		kdt['kdt']['pos']['z'] = motion.z;
		ik["kdts"][0] = kdt;
		
		this._send(ik, TeamOimatsuVsidoSuika.SEND_TYPE.IK );
	}
};


/**
 * @summary move forward robot
 * @function moveForward
 */
TeamOimatsuVsidoSuika.prototype.moveForward = function(){
	var s_app_mode = TeamOimatsuVsidoSuika.APP_MODE.ANALOG;
	var s_walk     = this.vsido.walk();
	s_z_forward       = this.fixRange(30);
	s_x_side          = this.fixRange(0);
	s_walk['forward'] = s_z_forward;
	s_walk['turn']    = s_x_side;
	
	this._send(s_walk);
};

/**
 * @summary move backward robot
 * @function moveBackward
 */
TeamOimatsuVsidoSuika.prototype.moveBackward = function(){
	var s_app_mode = TeamOimatsuVsidoSuika.APP_MODE.ANALOG;
	var s_walk     = this.vsido.walk();
	s_z_forward       = this.fixRange(-30);
	s_x_side          = this.fixRange(0);
	s_walk['forward'] = s_z_forward;
	s_walk['turn']    = s_x_side;
	
	this._send(s_walk);
};


/**
 * @summary move left robot
 * @function moveLeft
 */
TeamOimatsuVsidoSuika.prototype.moveLeft = function(){
	var s_app_mode = TeamOimatsuVsidoSuika.APP_MODE.ANALOG;
	var s_walk     = this.vsido.walk();
	s_z_forward       = this.fixRange(0);
	s_x_side          = this.fixRange(-50);
	s_walk['forward'] = s_z_forward;
	s_walk['turn']    = s_x_side;
	
	this._send(s_walk);
};

/**
 * @summary moveR right robot
 * @function moveRight
 */
TeamOimatsuVsidoSuika.prototype.moveRight = function(){
	var s_app_mode = TeamOimatsuVsidoSuika.APP_MODE.ANALOG;
	var s_walk     = this.vsido.walk();
	
	s_z_forward       = this.fixRange(0);
	s_x_side          = this.fixRange(50);
	s_walk['forward'] = s_z_forward;
	s_walk['turn']    = s_x_side;
	
	this._send(s_walk);
};

/**
 * @summary do Suikawari
 * @function doSuikawari
 */
TeamOimatsuVsidoSuika.prototype.doSuikawari = function(){
	var motion = [
		{"kid":3, "x":90, "y":-100, "z": 100},
		{"kid":3, "x":-24,"y":-30 , "z":-98},	
		{"kid":3, "x":90, "y":-100, "z": 100}
	];
	
	this.doIKMotion(motion);
};


/**
 * @summary finish pose
 * @function finishPose
 */
TeamOimatsuVsidoSuika.prototype.finishPose = function(){
	var motion = [
		{"kid":3, "x":90, "y":-100, "z": 100},
		{"kid":4, "x":-5, "y":20, "z": 0},
		{"kid":5, "x":5, "y":-20, "z": 0},
		{"kid":4, "x":-5, "y":40, "z": 0},
		{"kid":5, "x":5, "y":-40, "z": 0},
		{"kid":4, "x":-5, "y":60, "z": 0},
		{"kid":5, "x":5, "y":-60, "z": 0},
		{"kid":4, "x":-5, "y":80, "z": 0},
		{"kid":5, "x":5, "y":-80, "z": 0},
		{"kid":4, "x":-5, "y":100, "z": 0},
		{"kid":5, "x":5, "y":-100, "z": 0},
		{"kid":3, "x":-30, "y":100, "z": -98}
	];
	
	this.doIKMotion(motion);
};

/**
 * @summary camera direction with jyro
 * @function startCameraDirection
 */
TeamOimatsuVsidoSuika.prototype.startCameraDirection = function(){
	var that = this;
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(eventData) {
		    // gamma is the left-to-right tilt in degrees, where right is positive
		    var tiltLR = eventData.gamma;
			
			// 
			var LR = Math.round(tiltLR);
			
			if(-20 < LR && LR < 20) {
				return;
			}
			LR = that.fixRange(LR);
			
			var angle = that.vsido.servoAngle();
			angle["cycle"] = 2;
			angle["servo"].push({"sid":2,"angle":LR});
			
			that._send(angle, TeamOimatsuVsidoSuika.SEND_TYPE.ANGLE );
		}, false);
	}
};


/**
 * @summary stop suikawari and stop robot
 * @function stop
 */
TeamOimatsuVsidoSuika.prototype.stop = function(){
	this.setStatus(TeamOimatsuVsidoSuika.STATUS.FIN);
};


TeamOimatsuVsidoSuika.prototype.on = function(ev, fn){
	$(this).on(ev, fn);
} 
TeamOimatsuVsidoSuika.prototype.trigger = function(ev, d){
	$(this).trigger(ev, d);
}


var OimatsuVsidoSuika = TeamOimatsuVsidoSuika;
