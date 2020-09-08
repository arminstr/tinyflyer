// copyright 2020 Armin Straller

class tinyFlyer {
    constructor(weight, maxF, maxWingAngleX, maxWingAngleY, centerOfGravity, wingLength, wingHeight, wingPivotMargin, bodyThickness, bodyHeight, bodyWidth, drawCoordSys = false) {
        this._wingLength = wingLength;
        this._wingHeight = wingHeight;
        this._wingPivotMargin = wingPivotMargin;
        this._bodyThickness = bodyThickness;
        this._bodyHeight = bodyHeight;
        this._bodyWidth = bodyWidth;
        this._drawCoord = drawCoordSys;
        this._position = createVector(0, 0, 0);
        this._velocity = createVector(0, 0, 0);
        this._orientation = createVector(0, 0, 0);
        this._maxWingAngleX = maxWingAngleX;
        this._maxWingAngleY = maxWingAngleY;
        this._maxFrequency = maxF;
        this._model = new dynamicModel(weight, centerOfGravity, [this._bodyWidth/2 + this._wingPivotMargin,-this._bodyHeight,0], (this._wingLength * this._wingHeight));
    }

    draw() {
        this._model.update();

        var angleYleft, angleYright, angleXleft, angleXright = 0;
        angleYleft = this._maxWingAngleY/360 * TWO_PI * sin(TWO_PI*(millis()%this._model._periodLeftMS)/this._model._periodLeftMS );
        angleYright = this._maxWingAngleY/360 * TWO_PI * sin(TWO_PI*(millis()%this._model._periodRightMS)/this._model._periodRightMS );
        angleXleft = - this._maxWingAngleX/360 * TWO_PI * sin(TWO_PI*(millis()%this._model._periodLeftMS)/this._model._periodLeftMS );
        angleXright = - this._maxWingAngleX/360 * TWO_PI * sin(TWO_PI*(millis()%this._model._periodRightMS)/this._model._periodRightMS );

        this.update();
        rectMode(CENTER);
        //body
        noStroke();
        ambientMaterial(100,100,100);
        rotateX(this._orientation.x);
        rotateY(this._orientation.y + PI/4);
        rotateZ(this._orientation.z);
        push();
        translate(this._position.x, this._position.y, this._position.z);
        box(this._bodyWidth, this._bodyHeight, this._bodyThickness);
        pop();

        //wings
        ambientMaterial(230,230,230,50);
        this.drawWingLeft(angleXleft,angleYleft);
        this.drawWingRight(angleXright,angleYright);

        //draw coordinate System if required
        if(this._drawCoord)
        {
            this.drawCoordinateSystem();
        }
    }

    flapLeft(f, dC = 1){
        if(f > this._maxFrequency){f = this._maxFrequency;}
        if(f < 0){f = 0;}
        this._model._frequencyLeft = f;
        this._model._periodLeftMS = (1/f)*1000;
        this._model._dutyCycleLeft = dC;
    }

    flapRight(f, dC = 1){
        if(f > this._maxFrequency){f = this._maxFrequency;}
        if(f < 0){f = 0;}
        this._model._frequencyRight = f;
        this._model._periodRightMS = (1/f)*1000;
        this._model._dutyCycleRight = dC;
    }

    drawWingLeft(angleX, angleY){
        var dY = (this._wingHeight/2)*cos(angleX) - this._bodyHeight/2;
        var dZaYTopView = sin(angleY)*(this._wingLength/2);
        var dZ = dZaYTopView + cos(angleY) * (sin(angleX) * this._wingHeight/2);
        var dXaYTopView = cos(angleY)*(this._wingLength/2) + this._bodyWidth/2 + this._wingPivotMargin;  
        var dX = dXaYTopView - sin(angleY) * (sin(angleX) * this._wingHeight/2);
        //wingLeft
        //translate to wing midpoint
        push();
        translate(this._position.x - dX, this._position.y + dY, this._position.z + dZ);
        rotateY(angleY);
        rotateX(angleX);
        plane(this._wingLength, this._wingHeight);
        pop();
    }

    drawWingRight(angleX, angleY){
        var dY = (this._wingHeight/2)*cos(angleX) - this._bodyHeight/2;
        var dZaYTopView = sin(angleY)*(this._wingLength/2);
        var dZ = dZaYTopView + cos(angleY) * (sin(angleX) * this._wingHeight/2);
        var dXaYTopView = cos(angleY)*(this._wingLength/2) + this._bodyWidth/2 + this._wingPivotMargin;  
        var dX = dXaYTopView - sin(angleY) * (sin(angleX) * this._wingHeight/2);
        //wingRight
        //translate to wing midpoint
        push();
        translate(this._position.x + dX, this._position.y  + dY, this._position.z + dZ);
        rotateY(-angleY);
        rotateX(angleX);
        plane(this._wingLength, this._wingHeight);
        pop();
    }

    drawCoordinateSystem(){
        // x red, y green z blue
        translate(0, this._bodyHeight/2, 0);
        //x line coord 
        push();
        stroke(255,0,0);
        line(this._position.x, this._position.y, this._position.z, this._position.x + 20, this._position.y, this._position.z)
        pop();
        //y line coord 
        push();
        stroke(0,255,0);
        line(this._position.x, this._position.y, this._position.z, this._position.x, this._position.y + 20, this._position.z)
        pop();
        //z line coord 
        push();
        stroke(0,0,255);
        line(this._position.x, this._position.y, this._position.z, this._position.x, this._position.y, this._position.z + 20)
        pop();
    }

    set showCoordinateSystem(show){
        this._drawCoord = show;
    }

    get currentPosition(){
        return this._position;
    }

    get currentVelocity(){
        return this._velocity;
    }

    get maxFrequency(){
        return this._maxFrequency;
    }

    get currentFrequency(){
        var f = round((this._model._frequencyLeft + this._model._frequencyRight) / 2);
        return f;
    }

    update(){
        var dT = (millis() - this._lastUpdate) / 1000; //convert to seconds
        let acceleration = this._model._forces.div(this._model._weight, this._model._weight, this._model._weight); // in [m / (s * s)]
        this._velocity.add(p5.Vector.mult(acceleration, createVector(dT, dT, dT)));
        this._position.add(p5.Vector.mult(this._velocity, createVector(dT, dT, dT)));
        //check for ground colission
        if(this._position.y > 0 ){
            this._position.y = 0;
            this._velocity.y = 0;
        }

        if(this._position.y < (- windowHeight/2 + 100) ){
            this._position.y = - windowHeight/2 + 100;
            this._velocity.y = 0;
        }
        
        this._lastUpdate = millis();
    }
}