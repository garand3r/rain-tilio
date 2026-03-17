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

function logout(){

loggedIn=false;

document.getElementById("systemArea").classList.add("hidden");
document.getElementById("loginCard").classList.remove("hidden");

}

function registerVisitor(){

const name=document.getElementById("name").value.trim();
const zone1=document.getElementById("zone1").value;
const zone2=document.getElementById("zone2").value;
const zone3=document.getElementById("zone3").value;

if(!name){
alert("Please enter visitor name");
return;
}

const visitor={
id:Date.now(),
name,
zone1,
zone2,
zone3,
startTime:Date.now(),
timedOut:false
};

visitors.push(visitor);

saveData();

printReceipt(visitor);

document.getElementById("name").value="";

loadVisitors();

}

function loadVisitors(){

if(!loggedIn)return;

const container=document.getElementById("visitors");

container.innerHTML="";

visitors.forEach(v=>{

if(!v.timedOut && Date.now()-v.startTime>=TIME_LIMIT){
v.timedOut=true;
}

const div=document.createElement("div");

div.className="visitor";

if(v.timedOut)div.classList.add("timeout");

const timeLeft=getTimeLeft(v.startTime);

let zones=v.zone1;

if(v.zone2!=="None") zones+=" , "+v.zone2;
if(v.zone3!=="None") zones+=" , "+v.zone3;

div.innerHTML=`
<strong>${v.name}</strong><br>
Zones: ${zones}<br>
${v.timedOut ? "⚠ Timed Out" : "Time Left: "+timeLeft}
<br>
<button onclick="printReceiptById(${v.id})">Reprint</button>
${v.timedOut ? `<button class="delete-btn" onclick="deleteVisitor(${v.id})">Delete</button>` : ""}
`;

container.appendChild(div);

});

saveData();

}

function deleteVisitor(id){

visitors=visitors.filter(v=>v.id!==id);

saveData();

loadVisitors();

}

function getTimeLeft(startTime){

const remaining=Math.max(TIME_LIMIT-(Date.now()-startTime),0);

const m=Math.floor(remaining/60000);
const s=Math.floor((remaining%60000)/1000);

return `${m}:${s.toString().padStart(2,"0")}`;

}

function printReceipt(visitor){

let zones=visitor.zone1;

if(visitor.zone2!=="None") zones+="\n"+visitor.zone2;
if(visitor.zone3!=="None") zones+="\n"+visitor.zone3;

const receipt=document.getElementById("receiptContent");

receipt.innerHTML=`

<b>CAFEQUEUE</b><br>
Art Museum Cafe

<div class="line"></div>

Visitor:<br>
${visitor.name}<br><br>

Zones:<br>
${zones.replace(/\n/g,"<br>")}<br>

Time Limit: 15 Minutes

<div class="line"></div>

Issued:<br>
${new Date().toLocaleString()}

<div class="line"></div>

Enjoy Your Visit!

`;

setTimeout(()=>{
window.print();
},200);

}

function printReceiptById(id){

const visitor=visitors.find(v=>v.id===id);

if(visitor){
printReceipt(visitor);
}

}

function exportCSV(){

let csv="Name,Zone1,Zone2,Zone3,Timed Out\n";

visitors.forEach(v=>{
csv+=`"${v.name}","${v.zone1}","${v.zone2}","${v.zone3}","${v.timedOut}"\n`;
});

const blob=new Blob([csv],{type:"text/csv"});

const link=document.createElement("a");

link.href=URL.createObjectURL(blob);

link.download="CafeQueue_Report.csv";

link.click();

}

setInterval(loadVisitors,1000);
