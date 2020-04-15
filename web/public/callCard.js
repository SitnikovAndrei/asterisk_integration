let ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (event) => {
    let callEvent = JSON.parse(event.data);
    
    let card = document.querySelector(".card");
    let cardCallNumber = document.querySelector(".card .callNumber");
    let cardCallType = document.querySelector(".card .callType");
    if (callEvent.state == "appeared") {
        card.style.display = "flex";
    } else if (callEvent.state == "disconnected") {
        card.style.display = "none";
    }

    if (callEvent.callType == "inbound"){
        cardCallNumber.innerHTML = callEvent.fromNumber;
        cardCallType.innerHTML = "Входящий звонок"
    } else {
        cardCallNumber.innerHTML = callEvent.toNumber;
        cardCallType.innerHTML = "Исходящий звонок"
    }
};