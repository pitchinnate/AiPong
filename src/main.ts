import Engine from "./engine";

const engine = new Engine('game');
engine.start();

// document.addEventListener("keyup", (event) => {
//     switch (event.code) {
//         case 'KeyA':
//             paddle.speedX = 0;
//             break;
//         case 'KeyD':
//             paddle.speedX = 0;
//             break;
//     }
// });

document.addEventListener("keypress", (event) => {
    switch (event.code) {
        case 'Space':
            engine.toggle();
            break;
        case 'KeyG':
            engine.newGen();
            break;
        // case 'KeyA':
        //     paddle.speedX = -2;
        //     break;
        // case 'KeyD':
        //     paddle.speedX = 2;
        //     break;
    }
});
