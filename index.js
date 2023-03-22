const e = require("express");
const express = require("express");
const fs=require("fs");

obGlobal={
    obErori:null,
    obImagini:null
}

app= express();
console.log("Folder proiect", __dirname);

app.set("view engine","ejs");

app.use("/resurse",express.static(__dirname+"/resurse"))

app.get("/ceva", function(req, res){
    res.send("altceva");
})

app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index",{ip: req.ip, a: 10, b: 20});
})

app.get("/*",function(req,res){
    console.log(req.url);
    res.render("pagini"+req.url, function(err, rezRandare){
        if (err) {
            console.log(err);
            if (err.message.startsWith("Failed to lookup view")) {
                afiseazaEroare(res,404);
            }
            else{
                afiseazaEroare(res);
            }
        }else{
            res.send(rezRandare);
        }

    });
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

function afiseazaEroare(res,_identificator,_titlu,_text,_imagine){
    let vErori= obGlobal.obErori.info_erori;
    let eroare = vErori.find( function(elem){return elem.identificator==_identificator});
    if (eroare) {
        let titlu1= _titlu || eroare.titlu;
        let text1= _text || eroare.text;
        let imagine1= _imagine || eroare.imagine;
        if (eroare.status) {
            res.render(eroare.identificator).render({titlu:titlu1,text:text1,imagine:imagine1});
        }
        else{
        res.render("pagini/eroare",{titlu:titlu1,text:text1,imagine:imagine1});
        }
    }else{
        var errDef=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare",{titlu:errDef.titlu,text:errDef.text,imagine:errDef.imagine});
    }

}

app.listen(8080);
console.log("Serverul a pornit");