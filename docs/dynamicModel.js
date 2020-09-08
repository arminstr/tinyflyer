//F = m*a
var gravity = 9.81;
class dynamicModel {
    constructor(weight, centerOfGravity, wingAttackOffset, wingArea){
        this._frequencyLeft = 0;
        this._frequencyRight = 0;
        this._periodLeftMS = 0;
        this._periodRightMS = 0;
        this._dutyCycleLeft = 0.0;
        this._dutyCycleRight = 0.0;
        this._lastUpdate = 0;
        this._weight = weight;
        this._centerOfGravity = centerOfGravity;
        this._wingAttackOffset = wingAttackOffset;
        this._wingArea = wingArea;
        this._gravitationalForce = createVector(0, this._weight * gravity, 0);
        this._forces = createVector(0, 0, 0);  //[Newton]
        this._torques = createVector(0, 0, 0); //[Newton * meters]
        
        this._aerodynamicLiftConstant = 0.0000005449; //[Newton / (Hz * mm^2)]
    }

    update(){
        //reset force and torque vector
        this._forces = createVector(0, 0, 0);
        this._torques = createVector(0, 0, 0);

        //calculate torques caused by left and right wing
        this._torqueLeft = createVector(0, 0, this.calculateLiftFromFrequencyAndDutyCycle(this._frequencyLeft, this._dutyCycleLeft) * this._wingAttackOffset[0]/1000);
        this._torqueRight = createVector(0, 0, this.calculateLiftFromFrequencyAndDutyCycle(this._frequencyRight, this._dutyCycleRight) * - this._wingAttackOffset[0]/1000);
        this._torques = this._torqueLeft.add(this._torqueRight);

        //add left wing force 
        this._forces = this._forces.add(createVector(0, - this.calculateLiftFromFrequencyAndDutyCycle(this._frequencyLeft, this._dutyCycleLeft), 0));
        //add right wing force
        this._forces = this._forces.add(createVector(0, - this.calculateLiftFromFrequencyAndDutyCycle(this._frequencyRight, this._dutyCycleRight), 0));
        //add gravity
        this._forces = this._forces.add(this._gravitationalForce);
    }

    calculateLiftFromFrequencyAndDutyCycle(f, dC){
        var force  = dC * (this._aerodynamicLiftConstant * f * this._wingArea);
        return force;
    }
}