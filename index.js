const e = require("express");
const express = require("express");
const fs=require("fs");
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const process = require("process");
const ejs = require("ejs");
const {Client} = require('pg'); 
/*
var client= new Client({database:"proiect_web",
        user:"agp",
        password:"parola",
        host:"localhost",
        port:5432});
client.connect();
client.query("select * from proiect_web", function(err, rez){
    console.log("eroare:",err)
    console.log("rezultat:",rez)
})
*/

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
}

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1","backup"];
for(let folder of vectorFoldere){
    //let caleFolder = __dirname+"/"+folder;
    let caleFolder = path.join(__dirname,folder);
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder)
    }
}


function compileazaScss(caleScss, caleCss){
    if (!caleCss)
    {
        let vectorCale=caleScss.split("/");
    let numeFisExt=vectorCale[vectorCale.length-1]
    let numeFis = numeFisExt.split(".")[0]
    caleCss=numeFis+".css"
    }
    
    if(!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss)
    if(!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss)
    let vectorCale = caleCss.split("\\")
    numeFisCss = vectorCale[vectorCale.lenght-1]
    
    if(fs.existsSync(caleCss)){
       // fs.copyFile(caleCss,path.join(obGlobal.folderBackup,numeFisCss))
       // fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,numeFisCss ))
      // fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeFisCss))

    }
    
    rez=sass.compile(caleScss,{"SourceMap":true})
    fs.writeFileSync(caleCss,rez.css)


    fs.watch(obGlobal.folderScss,function(eveniment, numeFis){
        console.log(eveniment,numeFis);
        if (eveniment =="change" || eveniment=="rename"){
            let caleCompeta=path.join(obGlobal.folderScss,numeFis);
            if (fs.existsSync(caleCompeta)){
                compileazaScss(caleCompeta);
            }
        }
    })
}

vFisisere = fs.readdirSync(obGlobal.folderScss)
for (let numeFis of vFisisere){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis)
    }
}

app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"))
app.use("/node_modules",express.static(__dirname+"/node_modules"))

app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/,function(req,res){
    afiseazaEroare(res,403);
});

app.get("/favicon.ico",function(req,res){
    res.sendFile(__dirname+"/resurse/imagini/favicon/favicon.ico");
});

app.get("/ceva", function(req, res){
    res.send("altceva");
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index",{ip: req.ip, a: 10, b: 20, imagini:obGlobal.obImagini.imagini});
})

// ^\w+\.ejs$
app.get("/*.ejs",function(req,res){
    afiseazaEroare(res,400);
});

app.get("/*",function(req,res){
    try{
    console.log(req.url);
    res.render("pagini"+req.url, function(err, rezRandare){
        if (err) {
            console.log(err);
            if (err.message.startsWith("Failed to lookup view")) {
                //afiseazaEroare(res,{_identificator:404,_titlu:"ceva"});
                afiseazaEroare(res,404,"ceva");
            }
            else{
                afiseazaEroare(res);
            }
        }else{
            res.send(rezRandare);
        }

    });}
    catch(err){
        if (err.message.startsWith("Cannot find module")) {
            //afiseazaEroare(res,{_identificator:404,_titlu:"ceva"});
            afiseazaEroare(res,404,"Eroare");
        }
        else{
            afiseazaEroare(res);
        }
    }
})

function initializeazaErori(){
    var continut=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori= JSON.parse(continut);
    let vErori= obGlobal.obErori.info_erori;
    //for(let i=0; i< vErori.length; i++) //vErori[i]
    for (let eroare of vErori){
        eroare.imagine= "/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}

initializeazaErori();

function initializeazaImagini(){
    var continut=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini= JSON.parse(continut);
    let vImagini= obGlobal.obImagini.imagini;

    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie,"mediu");
    if (!fs.existsSync(caleAbsMediu)){
        fs.mkdirSync(caleAbsMediu);
    }

    //for(let i=0; i< vErori.length; i++) //vErori[i]
    for (let imag of vImagini){
        [numeFis, ext] = imag.fisier.split(".");
        let caleFisAbs = path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs = path.join(caleAbsMediu,numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/",obGlobal.obImagini.cale_galerie,"mediu",numeFis+".webp");
        imag.fisier=path.join("/",obGlobal.obImagini.cale_galerie,imag.fisier);
        //eroare.imagine= "/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;

    }
}

initializeazaImagini();

function afiseazaEroare(res,_identificator,_titlu="titlu default",_text,_imagine){
    let vErori= obGlobal.obErori.info_erori;
    let eroare = vErori.find( function(elem){return elem.identificator==_identificator});
    if (eroare) {
        let titlu1= _titlu== "titlu default" ? (_titlu || eroare.titlu): _titlu;
        let text1= _text || eroare.text;
        let imagine1= _imagine || eroare.imagine;
        if (eroare.status) {
            console.log(eroare.identificator);
            res.status(eroare.identificator).render("pagini/eroare",{titlu:titlu1,text:text1,imagine:imagine1});
        }
        else{
        res.render("pagini/eroare",{titlu:titlu1,text:text1,imagine:imagine1});
        }
    }else{
        var errDef=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare",{titlu:errDef.titlu,text:errDef.text,imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine});
    }

}

app.listen(8080);
console.log("Serverul a pornit");