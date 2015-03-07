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
};
TeamOimatsuVsidoSuika.STATUS = {
	NONE : 'none',
	READY: 'connect',
	FAILED: 'failed',
	FIN  : 'finish'
};
TeamOimatsuVsidoSuika.APP_MODE = {
	ANALOG:0,
	SENSOR:1,
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
	} else {
		this.setStatus(TeamOimatsuVsidoSuika.STATUS.FAILED);
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
 * @summary send command to Vsido
 * @function _send
 * @param {object} cmd
 */
TeamOimatsuVsidoSuika.prototype._send = function(cmd){
	if(this.status !== TeamOimatsuVsidoSuika.STATUS.READY) {
		return; // nothing to do
	}
	
	// send command to vsido
	this.vsido.send(cmd);
};

/**
 * @summary move forward robot
 * @function moveForward
 */
TeamOimatsuVsidoSuika.prototype.moveForward = function(){
	var s_app_mode = TeamOimatsuVsidoSuika.APP_MODE.ANALOG;
	var s_walk     = this.vsido.walk();
	s_z_forward       = this.fixRange(100);
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
	s_z_forward       = this.fixRange(-100);
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
	s_x_side          = this.fixRange(-100);
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
	s_x_side          = this.fixRange(100);
	s_walk['forward'] = s_z_forward;
	s_walk['turn']    = s_x_side;
	
	this._send(s_walk);
};

/**
 * @summary do Suikawari
 * @function doSuikawari
 */
TeamOimatsuVsidoSuika.prototype.doSuikawari = function(){
	// ik command
	var ik = this.vsido.ik();
	ik['ikf']['dist']['pos'] = true;
	
	var motion = [
		{"x":90, "y":-100, "z": 100},
		{"x":-15,"y":-88 , "z":-22},
		{"x":-24,"y":-30 , "z":-98}	
	];
	
	for(var i = 0;i < motion.length ; i ++){
		var kdt = this.vsido.kdt();
		kdt['kid'] = 3; // left arm
		kdt['kdt']['pos']['x'] = motion[i].x;
		kdt['kdt']['pos']['y'] = motion[i].y;
		kdt['kdt']['pos']['z'] = motion[i].z;
		ik["kdts"].push(kdt);
	}
	
	this._send(ik);
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
