# simple-remote-file-system-service

Language    : Node.js<br><br>
Tool        : WebStorm(version 2017.2.3)<br><br>
Description : Multiple clients can be connected to Node.js based server at the same time, <br>
              allowing independent operation on a common file system.<br>
              Among the existing Linux file system commands, this program supports below commands.<br>
              1. ls
              2. cd
              3. read
              4. write
              5. mkdir<br><br>
Scenario    :
1. Run the 'server.js' file using node.
2. Run the 'client.js' file using node and then you can use remote file system service provided 'server.js'.
3. If another user wants to use remote file system service, just repeat step 2.
