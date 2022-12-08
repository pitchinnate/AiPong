import Polygon, { Position } from "./polygon";
import Engine from "./engine";
import {NeuralNetwork} from "./network";
import Ball from "./ball";
import Sensor from "./Sensor";

export default class Paddle {
    currentPosition: Position;
    polygon: Polygon;
    speedX = 0;
    speedY = 0;
    engine: Engine;
    brain?: NeuralNetwork;
    sensor?: Sensor;
    balls: Ball[] = [];
    lost = false;
    bounces = 0;
    speed = 6;

    constructor(startX: number, startY: number, engine: Engine) {
        this.engine = engine;
        this.currentPosition = {x: startX, y: startY};
        this.polygon = Polygon.Rectangle(this.currentPosition, 100, 10, 0);
    }

    setBalls(balls: Ball[]) {
        this.balls = balls;
        this.sensor = new Sensor(this, 40, 2000, Math.PI, this.balls);
        this.brain = new NeuralNetwork([40,40,40,40,2]);
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.lost) {
            return;
        }

        ctx.globalAlpha = 0.4;
        ctx.fillStyle="orange";
        ctx.beginPath();
        ctx.moveTo(this.polygon.points[0].x,this.polygon.points[0].y);
        for(let i=1;i<this.polygon.points.length;i++){
            ctx.lineTo(this.polygon.points[i].x,this.polygon.points[i].y);
        }
        ctx.fill();
        ctx.globalAlpha = 1;

        if (this.balls.length > 0) {
            this.balls.forEach((ball) => {
                ball.draw(ctx);
            })
        }

        // if (this.sensor) {
        //     this.sensor.draw(ctx);
        // }
    }

    addBounce() {
        this.bounces += 1;
        if (this.bounces % 5 === 0) {
            this.addBall();
        }
    }

    addBall() {
        const randX = Math.floor(Math.random() * 500 + 100);
        const randY = Math.floor(Math.random() * 100 + 100);

        const ball = new Ball(randX, randY, this.engine, this);
        ball.speedY = ball.speedY * -1;
        this.balls.push(ball);
        this.speed = this.speed * 1.5;
        if (this.sensor) {
            this.sensor.updateBalls(this.balls);
        }
    }

    update(): void {
        if (this.lost) {
            return
        }

        if (this.balls.length > 0) {
            this.balls.forEach((ball) => {
                ball.update();
            })
        }

        if (this.sensor && this.brain) {
            this.sensor.update();
            const offsets = this.sensor.readings.map((s) => {
                return s==null ? 0 : 1-s.offset
            });
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);
            if (outputs[0] === 1 && outputs[1] === 0) {
                // console.log('move left');
                this.speedX = -1 * this.speed;
            } else if (outputs[0] === 0 && outputs[1] === 1) {
                // console.log('move right');
                this.speedX = this.speed;
            }
        }

        if ((this.currentPosition.x <= 5 && this.speedX < 0) || (this.currentPosition.x >= this.engine.width - 5 && this.speedX > 0)) {
            this.speedX = 0;
        }
        this.currentPosition.x += this.speedX;
        this.polygon.move(this.speedX,this.speedY);
    }
}