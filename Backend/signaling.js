const client = require('./client');

function sendError(clientId, errMsg){
    const sender = client.get(clientId);
    if(sender && sender.socket.readyState === 1){
        const message = {
            type: "error",
            payload: {
                message: errMsg
            }
        };
        sender.socket.send(JSON.stringify(message));
        console.log(`❌ Error to ${clientId}: ${errMsg}`);
    }
}

function sendToTarget(senderId, targetId, type, data){
    const target = client.get(targetId);
    
    if(!target) {
        console.log(`❌ Target ${targetId} NOT FOUND`);
        return false;
    }

    const socket = target.socket;
    if(socket.readyState !== 1){
        console.log(`❌ Target ${targetId} socket not open`);
        return false;
    }

    const messageToSend = {
        type: type,
        payload: {
            senderId: senderId,
            ...data
        }
    };
    
    socket.send(JSON.stringify(messageToSend));
    console.log(`✅ [${type}] ${senderId} → ${targetId}`);
    return true;
}

function handleMsg(fromId, msg){
    if (!msg || typeof msg !== "object") {
        sendError(fromId, "Invalid message format");
        return;
    }
    
    const { type, payload } = msg;
    
    if (!payload || typeof payload !== "object") {
        sendError(fromId, "Invalid payload");
        return;
    }
    
    if (!payload.targetId) {
        sendError(fromId, "Missing targetId");
        return;
    }
    
    let data;
    switch(type){
        case "connection-request":
            data = { senderName: payload.senderName || `Device-${fromId}` };
            break;
            
        case "offer":
            if (!payload.offer) {
                sendError(fromId, "Missing offer");
                return;
            }            
            data = { offer: payload.offer };
            break;
            
        case "answer":
            if (!payload.answer) {
                sendError(fromId, "Missing answer");
                return;
            }
            data = { answer: payload.answer };
            break;
            
        case "ice-candidate":
            if (!payload.candidate) {
                sendError(fromId, "Missing candidate");
                return;
            }
            data = { candidate: payload.candidate };
            break;
            
        default:
            console.log(`❌ Unknown msg type: ${type}`);
            sendError(fromId, `Unknown message type: ${type}`);
            return;
    }
    
    const success = sendToTarget(fromId, payload.targetId, type, data);
    if (!success) {
        sendError(fromId, "Target device not available");
    }
}

module.exports = { handleMsg };