// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// import { Emote } from '../utility/db';

// app.set('views', './src/views');
// app.set('view engine', 'ejs');

// // socket function console log every events from stv collection

// const socket = async () => {
//     // load mongo emote stats on global html
//     const emote = await Emote.find({ name: 'altaccountpoggers' });

//     app.get('/top', (req, res) => {
//         res.render('emote', {
//             emotes: emote[0].emotes[0],
//         });
//     });

//     io.on('connection', (socket) => {
//         console.log('a user connected');
//         socket.on('chat message', (msg) => {
//             console.log(msg);
//             io.emit('chat message', msg);
//         });
//     });

//     http.listen(3000, () => {
//         console.log('listening on *:3000');
//     });
// };

// export { socket };
