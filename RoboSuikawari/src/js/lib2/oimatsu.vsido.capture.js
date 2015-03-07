/**
 * Oimatsu Vsido Capture Library
 *
 * this library require the following libraries.
 *  - jQuery
 *
 */
var TeamOimatsuVsidoCapture = function(config){
	this.ip = null;
	if(config && config['ip']) {
		this.ip = config['ip'];
	}
	else {
		this.ip = window.location.hostname;
	}
	this.interval  = config.interval || 3000;
	this.consolefn = config.consolefn|| undefined;
	
	this.status = TeamOimatsuVsidoCapture.STATUS.NONE;
};
TeamOimatsuVsidoCapture.STATUS = {
	NONE  : 'none',
	READY : 'connect',
	START : 'start',
	FAILED: 'failed',
	FIN   : 'finish'
};
TeamOimatsuVsidoCapture.APP_MODE = {
	ANALOG:0,
	SENSOR:1,
};


/**
 * @summary init
 * @function init
 * @param {object} config
 * @param {number} config.interval
 */
TeamOimatsuVsidoCapture.prototype.init = function(config){
	
    this.vsido = new VSidoWeb({'ip':this.ip});
	if(this.vsido !== undefined) {
		this.setStatus(TeamOimatsuVsidoCapture.STATUS.READY);
	} else {
		this.setStatus(TeamOimatsuVsidoCapture.STATUS.FAILED);
	}
};
/**
 * @summary set status of suika wari library, when status is changed, trigger event.
 * @function getStatus
 * @param {number} status
 */
TeamOimatsuVsidoCapture.prototype.setStatus = function(status){
	this.status = status;
	
	$(this).trigger('status/'+status);
};

/**
 * @private
 * @summary send command to Vsido
 * @function _send
 * @param {object} cmd
 */
TeamOimatsuVsidoCapture.prototype._send = function(cmd, fn){
	if(this.status !== TeamOimatsuVsidoCapture.STATUS.START) {
		return; // nothing to do
	}
	
	// send command to vsido
	this.vsido.send(cmd, fn);
};

TeamOimatsuVsidoCapture.prototype.log = function(msg){
	console.log(msg);
	if(this.consolefn !== undefined && this.consolefn instanceof Function) {
		this.consolefn(msg);
	}	
};

TeamOimatsuVsidoCapture.prototype.startCapture = function(){
	var that = this;
	var currentCount = 1;
	
	if(this.status !== TeamOimatsuVsidoCapture.STATUS.READY) {
		console.log('connection is not initialized.');
		return;
	}
	this.setStatus(TeamOimatsuVsidoCapture.STATUS.START);
	
	function cap(){
		that.readIK($.proxy(function(motion){
			that.log("-- "+currentCount+" --");
			that.log("IK="+ JSON.stringify(motion));
			currentCount++;
		}, {c: currentCount}));
		that.readServoAngle($.proxy(function(angle){
			that.log("-- "+currentCount+" --");
			that.log("IK="+ JSON.stringify(motion));
		}, {c: currentCount}));
		
		if(that.status === TeamOimatsuVsidoCapture.STATUS.START) {
			setTimeout(cap, that.interval);
		}
		currentCount++;
	}
	
	setTimeout(cap, this.interval);
};

TeamOimatsuVsidoCapture.prototype.readIK = function(fn){
	var ik = this.vsido.readIK();
	ik['ikf']['cur']['pos'] = true;
	ik['kids'].push(2);
	
	this._send(ik, fn);
}
TeamOimatsuVsidoCapture.prototype.readServoAngle = function(fn){
	var info = this.vsido.readServoInfo();
	var readAngle = this.vsido.readServoAngle();
	info["servo"].push(readAngle);
	
	this._send(info, fn);
}



TeamOimatsuVsidoCapture.prototype.stop = function(){
	this.setStatus(TeamOimatsuVsidoCapture.STATUS.FIN);
};

TeamOimatsuVsidoCapture.prototype.on = function(ev, fn){
	$(this).on(ev, fn);
} 
TeamOimatsuVsidoCapture.prototype.trigger = function(ev, d){
	$(this).trigger(ev, d);
}

//
var OimatsuVsidoCapture = TeamOimatsuVsidoCapture;