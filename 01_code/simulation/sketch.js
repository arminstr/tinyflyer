let tiFl;
let controller;
let slider1;
let textField1;

function setup() {
  createCanvas(windowHeight/2, windowHeight/2, WEBGL);
  tiFl = new tinyFlyer(0.02, 100, 30, 45, [0,0,0], 100, 30, 10, 20, 80, 40, true);
  controller = new Controller(tiFl.maxFrequency);

  slider1 = createSlider(0, 255, 255, 1);
  slider1.position(10, 10);
  slider1.style('width', '80px');  

  textField1 = createGraphics(600,600);
  textField1.fill(255);
  textField1.textSize(30);

}

function draw() {
  let val = slider1.value();
  val = round((val/255) * 100);
  directionalLight(255,255,255, 1,-1,-1);
  background(255);

  push();
  textField1.clear();
  textField1.text(str(round(val, 2)) + ' px\n' + 'Current Position: ' + round(- tiFl.currentPosition.y) +' px\n' + 'Wing Beat Frequency: '+ tiFl.currentFrequency + ' Hz', 100,100);
  translate(-windowHeight/4+70,-windowHeight/4+100);
  texture(textField1);
  plane(200,200);
  pop();

  controller.setPos = createVector(0,val,0);
  controller.update(tiFl.currentPosition, tiFl.currentVelocity);
  
  tiFl.flapLeft(controller.leftFrequency);
  tiFl.flapRight(controller.rightFrequency);
  tiFl.draw();
}
