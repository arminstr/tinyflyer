class Controller {
    constructor(maxFrequency){
        this._fMax = maxFrequency;
        this._vMax = 200; // mm/s
        this._requestedPosition = createVector(0,0,0);
        this._requestedSpeed = createVector(0,0,0);
        this._flapLeftFrequency = 0;
        this._flapRightFrequency = 0;

        this._KpP = 0.7;
        this._KiP = 0;
        this._KdP = 15;

        this._KpV = 300; 
        this._KiV = 0.5;
        this._integralP = 0;
        this._integralV = 0;
        this._lastErrorP = 0;

        this._grounded = false;

    }

    set setGain(value){
        this._pV = value;
    }

    set setPos(p){
        this._requestedPosition = p.mult(1,-1,1);
    }

    set setSpeed(v){
        this._requestedSpeed = v.mult(1,-1,1);
    }

    get leftFrequency(){
        return this._flapLeftFrequency;
    }

    get rightFrequency(){
        return this._flapRightFrequency;
    }

    update(p, v) {
        if(this._requestedPosition.y >= - 0.1){
            this._grounded = true;
            this.setSpeed = createVector(0, 0, 0);
            this.speedController(v);
        }else{
            this._grounded = false;
            var dP = p5.Vector.sub(p, this._requestedPosition);
            var delta = dP.mag();
            var norm = dP.normalize();
            var error = delta * norm.y;
            this._integralP += error;
            var derivate = error - this._lastErrorP;
            if(this._integralP * this._KiP < 0 ){this._integralP = 0;}
            if(this._integralP * this._KiP > this._vMax){this._integralP = this._vMax;}

            var setValue = createVector(0, error * this._KpP + this._integralP * this._KiP + derivate * this._KdP, 0);

            if(setValue > this._vMax){setValue = this._vMax;}
            if(setValue < - this._vMax){setValue = - this._vMax;}
            this.setSpeed = setValue;
            this.speedController(v);
            this._lastErrorP = error;
        }
    }

    speedController(v){
        var dV = p5.Vector.sub(v, this._requestedSpeed);
        var delta = dV.mag();
        var norm = dV.normalize();
        var error = delta * norm.y;
        this._integralV += error;
        if(this._integralV < 0) {this._integralV = 0;}
        if(this._integralV * this._KiV > this._fMax){this._integralV = this._fMax;}

        let frequency = error * this._KpV + this._integralV * this._KiV;
        
        if(frequency > this._fMax){frequency = this._fMax;}
        if(round(frequency) <= 0 || this._grounded){frequency = 0;}
        this._flapLeftFrequency = frequency;
        this._flapRightFrequency = frequency;
    }
}