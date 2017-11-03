const MY_PORT = 7777; // 서버에 접속하기 위한 포트.

// net 모듈 사용.
var net = require('net');

// socket 생성.
var socket = net.connect({port : MY_PORT});

socket.on('connect', function(){
    // 서버에 연결 후, send event를 발생시킨다. 그러면 command 입력이 시작된다.
    eventEmitter.emit('send');
});
socket.on('data', function(data){
    // server에서 write를 하면 data event가 발생되는데,
    // server에서 write를 하는 경우는 client의 요청을 처리한 경우밖에 없으므로,
    // data event를 처리한 후 send event를 발생시켜서 다음 commmand 입력을 받도록 해야한다.
    console.log(data + "");
    eventEmitter.emit('send');
});
socket.on('end', function(end){
    console.log(end + "");
});
socket.on('timeout', function(timeout){
    console.log(timeout + "");
});
socket.on('error', function(error){
    console.log(error + "");
});

// event 모듈 사용
var event = require('events');
var eventEmitter = new event.EventEmitter();

var event_send_handler = function(){
    const readline = require('readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("", function(input){
        var command = input.split(' ');
        rl.close(); // 반드시 close()를 해줘야 함

        var input_data = new Object();
        input_data.operator = command[0];
        input_data.operand1 = command[1];
        input_data.operand2 = command[2];

        var send_data = JSON.stringify(input_data); // JSON파일을 string으로 변환.

        socket.write(send_data); // 서버에 데이터 전송.
    });
};

eventEmitter.on('send', event_send_handler);