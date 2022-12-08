import _ from 'lodash';

import Paddle from "./paddle";
import Ball from "./ball";
import {NeuralNetwork} from "./network";


export interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
    update(): void;
    lost: boolean;
}

export default class Engine {
    canvas: HTMLCanvasElement;
    parent: HTMLDivElement;
    context: CanvasRenderingContext2D;
    running = false;
    drawables: Drawable[] = [];
    height = 100;
    width = 100;
    paddles: Paddle[] = [];
    bestPaddle?: Paddle;
    bestPaddleLastRound?: Paddle;
    iterations = 500;
    generation = 0;

    bestDiv: HTMLDivElement;
    currentDiv: HTMLDivElement;
    paddleDiv: HTMLDivElement;
    generationDiv: HTMLDivElement;

    constructor(canvasId: string) {
        this.bestDiv = document.getElementById('best') as HTMLDivElement;
        this.currentDiv = document.getElementById('current') as HTMLDivElement;
        this.paddleDiv = document.getElementById('paddles') as HTMLDivElement;
        this.generationDiv = document.getElementById('generation') as HTMLDivElement;

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.parent = this.canvas.parentElement as HTMLDivElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    start(iterations?: number) {
        this.generation += 1;
        this.running = true;
        if (iterations) {
            this.iterations = iterations;
        }

        const paddles = [];

        console.log('old best paddle:', this.bestPaddle);

        for(let i=0;i<this.iterations;i++) {
            const paddle = new Paddle(100, 800, this);
            const ball = new Ball(100, 100, this, paddle);
            paddle.setBalls([ball]);

            if (this.bestPaddle && this.bestPaddle.brain) {
                const brain = _.cloneDeep(this.bestPaddle.brain);
                const brain2 = _.cloneDeep(this.bestPaddleLastRound?.brain || brain);
                if (i === 0) {
                    console.log('use best overall brain exact');
                    paddle.brain = brain; // exact copy
                } else if (i === 1) {
                    console.log('use last round best brain exact');
                    paddle.brain = brain2; // exact copy of best last round
                } else if (i < 80) {
                    console.log('use last round best brain modified');
                    NeuralNetwork.mutate(brain2,0.02);
                    paddle.brain = brain2;
                } else {
                    console.log('use best overall brain modified');
                    NeuralNetwork.mutate(brain,0.02);
                    paddle.brain = brain;
                }
            }
            paddles.push(paddle);
        }

        this.paddles = paddles;
        this.animate();
    }

    stop() {
        this.running = false;
    }

    toggle() {
        this.running = !this.running;
        if (this.running) {
            this.animate();
        } else {
            console.log('Paddles remaining: ', this.paddles.length);
            let bestThisGen = 0;
            this.paddles.forEach((paddle) => {
               if (paddle.bounces > bestThisGen) {
                   bestThisGen = paddle.bounces;
               }
            });
            console.log('best this gen', bestThisGen);
            console.log('best overall', this.bestPaddle?.bounces);
        }
    }

    addDrawable(drawable: Drawable) {
        this.drawables.push(drawable);
    }

    newGen() {
        this.running = false;
        this.drawables = [];
        this.paddles = [];
        this.bestPaddle = _.cloneDeep(this.bestPaddle);

        setTimeout(() => {
            this.start();
        }, 500);
    }

    animate() {
        if (!this.running) {
            return;
        }

        this.canvas.height = this.parent.clientHeight - (window.innerHeight * .08);
        this.canvas.width = this.parent.clientWidth - (window.innerWidth * .08);
        this.height = this.canvas.height;
        this.width = this.canvas.width;

        this.context.fillStyle = "#aaa";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.paddles) {
            let bestThisGen = 0;
            let highest = this.bestPaddle?.bounces || 0;
            this.paddles = this.paddles.filter((paddle) => !paddle.lost);
            this.paddles.forEach((paddle) => {
                paddle.update();
                paddle.draw(this.context);
                if (paddle.bounces > highest) {
                    this.bestPaddle = paddle;
                    highest = paddle.bounces;
                }
                if (paddle.bounces > bestThisGen) {
                    bestThisGen = paddle.bounces;
                    this.bestPaddleLastRound = paddle;
                }
            })
            if (this.paddles.length <= 1) {
                console.log('Paddles dead');
                console.log(this.bestPaddle);
                this.newGen();
            }

            this.bestDiv.innerHTML = `Best Overall: ${this.bestPaddle?.bounces} Bounces`;
            this.currentDiv.innerHTML = `Round Best: ${bestThisGen} Bounces`;
            this.paddleDiv.innerHTML = `Paddles Remaining: ${this.paddles.length} Paddles`;
            this.generationDiv.innerHTML = `Generation: ${this.generation}`;
        }

        this.drawables = this.drawables.filter((d) => !d.lost);
        this.drawables.forEach((drawable) => {
            drawable.update();
            drawable.draw(this.context);
        });

        requestAnimationFrame(() => {
            this.animate();
        })
    }
}