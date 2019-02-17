import { Component } from '@angular/core';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title: any;
    chats:any;
    input:any;
    loading:any;
    closed: any;
    animated:any;
    slotDialog:any;
    actions:any;
    client:any;
    constructor(){
    this.title = 'bot';
    this.chats = [];
    this.input = "";
    this.loading = false;
    this.closed = true;
    this.animated = false;
    this.slotDialog = false;
    this.actions = ["Get FX Rate", "Check Balance", "Get Mini Statement", "Branch/ATM Locator"];
    this.client = new ApiAiClient({accessToken: 'dc8201bab1964115a84260bd03270e1c'});
 }
  
  send (request) {
    request = request || this.input;
    if(!this.validate(request)) return;
    this.chats.push({msg: {type:0, speech:request}})
    this.loading = true;
    this.client.textRequest(request)
        .then((response) => {this.respond(response)}, this)
        .catch((error) => {console.log(error)}, this)
    this.input = "";
}

respond(resp) {
    this.loading = false;
    for (var i = 0; i < resp.result.fulfillment.messages.length; i++) {
        this.slotDialog = resp.result.actionIncomplete;
        var message = resp.result.fulfillment.messages[i];
        if(message.platform) continue;
        this.chats.push({bot: true, msg: message});
    }
    this.handleData(resp.result.fulfillment);
}

handleData(fulfillment) {
    if( !fulfillment.data ) return false;
    this.chats.push({bot: false, msg:{type: 4, payload:fulfillment.data}})
}

respondSuggestion(value, index) {
    this.send(value);
    this.chats.splice(index, 1);
}

sendQuickaction(value) {
    this.send(value);
}

validate(request){
    return request.trim().length
}

isSimpleResponse(chat) {
    return chat.msg.type==0 && chat.msg.speech.length;
}

isSuggestion(chat) {
    return chat.msg.type==2;
}

isWebView(chat){
    return chat.msg.type === 4 && chat.msg.payload.unspecified.type == "web_url" ;
}

createConvo() {
    //this.chats.push({bot: true, msg: {speech:"Welcome! I am EVA, Enhanced Virtual Assistant.", type:0}});
    //this.chats.push({bot: true, msg: {speech:"I am your personal banking assistant. You can ask me to check your balance, fetch a mini statement or get FX rates.", type:0}});
    this.loading = true;
    return this.client.eventRequest("WELCOME")
    .then((response) => {this.respond(response)}, this)
    .catch((error) => {console.log(error)})
}

closeChat() {
    let confirmed = confirm("Are you sure we are done talking. If you close the chatbox, we will have to start our conversation all over again.");
    if(!confirmed) return;
    this.closed = true;
    this.chats = [];
    this.client = new ApiAiClient({accessToken: 'dc8201bab1964115a84260bd03270e1c'});
}

openChat() {
    this.closed = false;
   this.createConvo();
}

cancel() {
    this.send('Cancel');
    this.slotDialog = false;
}
}