const ROOT_DIR = "C:";  // 서버 파일 시스템의 root directory.
const MY_PORT = 7777;   // 서버 접속 허용 포트.

var client_numbering = 0; // client name을 부여하기 위한 변수

// fs, path 모듈 사용.
var fs = require('fs');
const path = require('path');

var net = require('net');   // net 모듈 사용.
var server = net.createServer(function(socket){
    socket.current_path = __dirname;   // 각 client socket의 초기 directory는 프로젝트 폴더의 path이다.
    socket.name = "Client " + client_numbering++; // 각 client socket에 name 부여

    socket.on('data', function(str){
        var receive_data = JSON.parse(str); // client로부터 받은 string값을 JSON파일로 바꿔서 사용한다.
        var send_data;
        var your_path;

        switch(receive_data.operator)
        {
            case "ls":
                if(receive_data.operand1 == undefined){
                    // operand가 없는 경우, 현재 path가 operand이다.
                    your_path = socket.current_path;
                }else{
                    if(receive_data.operand1.substring(0, ROOT_DIR.length) == ROOT_DIR){
                        // operand가 absolute path일 경우
                        your_path = receive_data.operand1;
                    }else{
                        // operand가 relative path일 경우
                        your_path = path.join(socket.current_path, receive_data.operand1);
                    }
                }

                if(!fs.existsSync(your_path)){
                    // 유효한 paht가 아닐 경우
                    send_data = "\nError: [" + your_path + "] is non-existent.\n";
                }else{
                    if(!fs.lstatSync(your_path).isDirectory()){
                        // directory가 아닐 경우
                        send_data = "\nError: [" + your_path + "] is not a directory.\n";
                    }else{
                        send_data = "\n[";
                        fs.readdirSync(your_path).forEach(function(filename){
                            send_data += "\"" + filename + "\" , ";
                        });
                        if(send_data.length != 2){
                            // send_data의 length가 2가 아니라는 건, 맨 앞에 붙는 "\n[" 외에 readdirSync 메서드를 통해
                            // 어떤 값이 더해졌다는 것이므로, 빈 폴더가 아니라는 뜻이다.
                            send_data = send_data.substring(0, send_data.length - 3);
                            // 빈 폴더가 아닐 경우, 맨 마지막에 붙는 " , "를 없애주기 위해 substring 메서드를 이용한다.
                        }
                        send_data += "]\n";
                    }
                }
                break;
            // End of "ls" part

            case "cd":
                if(receive_data.operand1 == undefined){
                    // operand가 없는 경우, 현재 path 유지
                    send_data = "\nCurrent Dir : " + socket.current_path + "\n";
                }else{
                    if(receive_data.operand1.substring(0, ROOT_DIR.length) == ROOT_DIR){
                        // operand가 absolute path일 경우
                        your_path = receive_data.operand1;
                    }else{
                        // operand가 relative path일 경우
                        your_path = path.join(socket.current_path, receive_data.operand1);
                    }

                    if(!fs.existsSync(your_path)) {
                        // 유효한 path인지 확인
                        send_data = "\nError: [" + your_path + "] is non-existent.\n";
                    }else if(!fs.lstatSync(your_path).isDirectory()){
                        // directory가 맞는지 확인
                        send_data = "\nError: [" + your_path + "] is not a directory.\n";
                    }else {
                        socket.current_path = your_path;
                        // current_path값을 변경한다. socket별로 이뤄지므로, client간의 간섭이 없다.
                        send_data = "\nCurrent Dir : " + socket.current_path + "\n";
                    }
                }
                break;
            // End of "cd" part

            case "read":
                if(receive_data.operand1 == undefined){
                    // operand가 없는 경우, 오류 메시지 출력
                    send_data = "\nError: You must input file name.\n";
                }else{
                    if(receive_data.operand1.substring(0, ROOT_DIR.length) == ROOT_DIR){
                        // operand가 absolute path일 경우
                        your_path = receive_data.operand1;
                    }else{
                        // operand가 relative path일 경우
                        your_path = path.join(socket.current_path, receive_data.operand1);
                    }

                    if(!fs.existsSync(your_path)){
                        // 유효한 path인지 확인
                        send_data = "\nError: [" + your_path + "] is non-existent.\n";
                    }else if(!fs.lstatSync(your_path).isFile()){
                        // file이 맞는지 확인
                        send_data = "\nError: [" + your_path + "] is not a file.\n"
                    }else{
                        send_data = fs.readFileSync(your_path, 'utf-8');
                    }
                }
                break;
            // End of "read" part

            case "write":
                if(receive_data.operand1 == undefined){
                    // operand가 없는 경우, 오류 메시지 출력
                    send_data = "\nError: You must input file name.\n";
                }else{
                    if(receive_data.operand1.substring(0, ROOT_DIR.length) == ROOT_DIR){
                        // operand가 absolute path일 경우
                        your_path = receive_data.operand1;
                    }else{
                        // operand가 relative path일 경우
                        your_path = path.join(socket.current_path, receive_data.operand1);
                    }

                    if(fs.existsSync(your_path) && fs.lstatSync(your_path).isFile()){
                        // 유효한 path인지, 그리고 같은 이름의 file이 이미 존재하는지 확인
                        send_data = "\nError: A file with same name already exists.\n"
                    }else{
                        if(receive_data.operand2 != undefined){
                            fs.writeFileSync(your_path, receive_data.operand2, 'utf-8');
                        }else{
                            // data가 없는 경우, ""를 write한다.
                            fs.writeFileSync(your_path, "", 'utf-8');
                        }
                        send_data = "\nThe file was written successfully.\n";
                    }
                }
                break;
            // End of "write" part

            case "mkdir":
                if(receive_data.operand1 == undefined){
                    // operand가 없는 경우, 오류 메시지 출력
                    send_data = "\nError: You must input directory path name.\n";
                }else{
                    if(receive_data.operand1.substring(0, ROOT_DIR.length) == ROOT_DIR){
                        // operand가 absolute path일 경우
                        your_path = receive_data.operand1;
                    }else{
                        // operand가 relative path일 경우
                        your_path = path.join(socket.current_path, receive_data.operand1);
                    }

                    if(fs.existsSync(your_path) && fs.lstatSync(your_path).isDirectory()){
                        // 유효한 path인지, 그리고 같은 이름의 directory가 이미 존재하는지 확인
                        send_data = "\nError: A directory with same path name already exists.\n"
                    }else{
                        fs.mkdirSync(your_path);
                        send_data = "\nThe directory was made successfully.\n";
                    }
                }
                break;
            // End of "mkdir" part

            default: // ls, cd, read, write, mkdir 중 어떤 것에도 속하지 않는다면 잘못된 것이므로, 에러 메시지 출력.
                send_data = "\nWrong Command!\n";
        }
        // 위 switch문을 통해 정해진 send_data값을 client에 보낸다.
        socket.write(send_data);
    });

    socket.on('error', function(){
        console.log("\nclient " + socket.name + " is disconnected.\n");
    });
});

server.listen(MY_PORT, function(){
    console.log("Listening on PORT(" + MY_PORT + ")");
});