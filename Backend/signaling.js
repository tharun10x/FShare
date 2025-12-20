const client = require('./client');

function sendToTarget(targetId, msgObject){
    const target = client.get(targetId)
    if(!target) return;

    const socket = target.socket;
    if(socket.readyState ===1){
        socket.send(JSON.stringify(msgObject))}
}

function handlemsg(fromId, socket, msg){
    switch(msg.type){
        case "connection-request":
            sendToTarget(msg.target, {
                type: "connection-request",
                from: fromId
            });
            break;

        case "offer":
            sendToTarget(msg.target, {
                type:"offer",
                from: fromId, 
                sdp: msg.sdp
            });
            break;
        
        case "answer":
            sendToTarget(msg.target, {
                type:"answer",
                from: fromId, 
                sdp: msg.sdp
            });
            break;

        case "ice-candidate":
            sendToTarget(msg.target, {
                type:"ice-candidate",
                from: fromId, 
                sdp: msg.sdp
            });
            break;

        default:
        console.log("Unknown msg type:", msg);

    }
}

module.exports = { handlemsg };