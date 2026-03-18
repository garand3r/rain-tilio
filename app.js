const TIME_LIMIT = 15 * 60 * 1000;
const ADMIN_PASSWORD = "cafe123";

let visitors = JSON.parse(localStorage.getItem("cafequeue_data")) || [];
let loggedIn = false;

function saveData(){
localStorage.setItem("cafequeue_data",JSON.stringify(visitors));
}

function login(){

const pass=document.getElementById("adminPass").value;

if(pass===ADMIN_PASSWORD){

loggedIn=true;

document.getElementById("loginCard").classList.add("hidden");
document.getElementById("systemArea").classList.remove("hidden");

loadVisitors();

}else{
alert("Incorrect password");
}

}

function registerVisitor(){

const name=document.getElementById("name").value.trim();
const zone1=document.getElementById("zone1").value;
const zone2=document.getElementById("zone2").value;
const zone3=document.getElementById("zone3").value;

if(!name){
alert("Enter visitor name");
return;
}

const visitor={
id:Date.now(),
name,
zones:[zone1,zone2,zone3],
startTime:Date.now(),
timedOut:false
};

visitors.push(visitor);

saveData();

printReceipt(visitor);

loadVisitors();

}

function loadVisitors(){

const container=document.getElementById("visitors");
container.innerHTML="";

visitors.forEach(v=>{

if(!v.timedOut && Date.now()-v.startTime>=TIME_LIMIT){
v.timedOut=true;
}

let zones=v.zones.filter(z=>z!=="None").join(", ");

const div=document.createElement("div");

div.className="visitor";

if(v.timedOut)div.classList.add("timeout");

div.innerHTML=`

<strong>${v.name}</strong><br>
Zones: ${zones}<br>
${v.timedOut ? "Timed Out" : getTimeLeft(v.startTime)}

<br>

<button onclick="printReceiptById(${v.id})">Reprint</button>

${v.timedOut ? `<button class="delete-btn" onclick="deleteVisitor(${v.id})">Delete</button>`:""}

`;

container.appendChild(div);

});

}

function deleteVisitor(id){

visitors=visitors.filter(v=>v.id!==id);

saveData();

loadVisitors();

}

function getTimeLeft(start){

const remaining=Math.max(TIME_LIMIT-(Date.now()-start),0);

const m=Math.floor(remaining/60000);
const s=Math.floor((remaining%60000)/1000);

return `Time Left: ${m}:${s.toString().padStart(2,"0")}`;

}

/* TEXT WRAP */

function wrapText(text,max=32){

let words=text.split(" ");
let line="";
let result="";

words.forEach(word=>{

if((line+word).length>max){
result+=line+"\n";
line=word+" ";
}else{
line+=word+" ";
}

});

result+=line;

return result;

}

/* PRINT RECEIPT (ONLY BOOTH NAMES) */

function printReceipt(visitor){

let boothText="";

visitor.zones.forEach(zone=>{

if(zone!=="None"){

boothText+=`

<div class="line"></div>

${zone}

`;

}

});

const receipt=document.getElementById("receiptContent");

receipt.innerHTML=`

<b>CAFEQUEUE</b>
Museum Cafe

<div class="line"></div>

Visitor:
${wrapText(visitor.name)}

${boothText}

<div class="line"></div>

Time Limit: 15 Minutes

<div class="line"></div>

${new Date().toLocaleString()}

`;

setTimeout(()=>window.print(),200);

}

function printReceiptById(id){

const visitor=visitors.find(v=>v.id===id);

if(visitor)printReceipt(visitor);

}

setInterval(loadVisitors,1000);
