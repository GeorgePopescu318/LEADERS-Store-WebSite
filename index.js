const e = require("express");
const express = require("express");
const fs = require("fs");
const path = require('path');
const sharp = require('sharp');
const sass = require('sass');
const process = require("process");
const ejs = require("ejs");
const { Client } = require('pg');
const AccesBD= require("./module_proprii/accesbd.js");
AccesBD.getInstanta().select(
    {tabel:"merch",
    campuri:["nume", "pret", "culoare"],
    conditiiAnd:["pret>0"]},
    function (err, rez){
        console.log(err);
        console.log(rez);
    }
)

const formidable=require("formidable");
const {Utilizator}=require("./module_proprii/utilizator.js")
const session=require('express-session');
const Drepturi = require("./module_proprii/drepturi.js");

//const QRCode= require('qrcode');
//const puppeteer=require('puppeteer');
//const mongodb=require('mongodb');
//const helmet=require('helmet');
//const xmljs=require('xml-js');

//const request=require("request");

const bodyParser = require('body-parser');
const utilizator = require("./module_proprii/utilizator.js");

var client = new Client({
    database: "proiect_web",
    user: "agp",
    password: "parola",
    host: "localhost",
    port: 5432
});
client.connect();
client.query("select * from merch", function (err, rez) {
    console.log("eroare:", err)
    console.log("rezultat:", rez)
})



obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu:[],
    material:[]
}

client.query("select * from unnest(enum_range(null::categ_merch))", function (err, rezCategorie) {
    if (err) {
        console.log(err)
    }
    else {
        obGlobal.optiuniMeniu=rezCategorie.rows;
    }
}
);

client.query("select * from unnest(enum_range(null::material_merch))", function (err, rezMaterial) {
    if (err) {
        console.log(err);
    }
    else {
        obGlobal.material=rezMaterial.rows;
    }
}
);

app= express();

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));

console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere = ["temp", "temp1", "backup"];
for (let folder of vectorFoldere) {
    //let caleFolder = __dirname+"/"+folder;
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder)
    }
}


function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
       // let vectorCale = caleScss.split("\\");
        //let numeFisExt = vectorCale[vectorCale.length - 1]
        //let numeFis = numeFisExt.split(".")[0]
        let numeFisExt = path.basename(caleScss)
        let numeFis = numeFisExt.split(".")[0]
        caleCss = numeFis + new Date().toDateString() + ".css"
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)
    //let vectorCale = caleCss.split("\\")
   // let vectorCale = caleCss.split("\\");
   // let numeFisCss = vectorCale[vectorCale.length - 1]
    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css")
    if(!fs.existsSync(caleBackup)){
        fs.mkdirSync(caleBackup,{recursive:true})
    }

    let numeFisCss = path.basename(caleCss)
    if (fs.existsSync(caleCss)) {
        // fs.copyFile(caleCss,path.join(obGlobal.folderBackup,numeFisCss))
        // fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,numeFisCss ))
        fs.copyFileSync(caleCss,path.join(obGlobal.folderBackup,"resurse/css",numeFisCss))
        //fs.copyFileSync(caleCss,numeFisCss)

    }

    rez = sass.compile(caleScss, { "sourceMap": true })
    fs.writeFileSync(caleCss, rez.css)


    fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
        console.log(eveniment, numeFis);
        if (eveniment == "change" || eveniment == "rename") {
            let caleCompeta = path.join(obGlobal.folderScss, numeFis);
            if (fs.existsSync(caleCompeta)) {
                compileazaScss(caleCompeta);
            }
        }
    })
}

vFisisere = fs.readdirSync(obGlobal.folderScss)
for (let numeFis of vFisisere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis)
    }
}

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"))
app.use("/node_modules", express.static(__dirname + "/node_modules"))
app.use("/poze_uploadate",express.static(__dirname+"/poze_uploadate"));

app.use("/*", function(req, res, next) {
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    res.locals.Drepturi=Drepturi;
    if (req.session.utilizator){
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
    }    
    next();
}) 



app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
});

app.get("/favicon.ico", function (req, res) {
    res.sendFile(__dirname + "/resurse/imagini/favicon/favicon.ico");
});

app.get("/ceva", function (req, res) {
    res.send("altceva");
})

app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));//obligatoriu de setat pt request body de tip json

app.get(["/despre"], function (req, res) {
    res.render("pagini/despre", { ip: req.ip, a: 10, b: 20, imagini: obGlobal.obImagini.imagini });
})

app.get(["/index", "/", "/home","/login"], function (req, res) {
    console.log("////////////////////////////")
    
    console.log("////////////////////////////")
    let sir=req.session.mesajLogin;
    console.log("mesajLogin:",sir)
    req.session.mesajLogin=null;
    res.render("pagini/index", { ip: req.ip, a: 10, b: 20, imagini: obGlobal.obImagini.imagini, mesajLogin:sir });
})
//-------------------------------------------------Produse-----------------------------------------------
app.get("/produse", function (req, res) {
    client.query("select * from unnest(enum_range(null::categ_merch))", function (err, rezCategorie) {
        if (err) {
            console.log(err)
        }
        else {
            let conditieWhere = "";
            if (req.query.tip) {
                conditieWhere = ` where categorie='${req.query.tip}'`
            }
            client.query("select * from merch" +conditieWhere, function (err, rez) {
                console.log(300)
                if (err) {
                    console.log(err);
                    afiseazaEroare(res, 2);
                }
                else
                    res.render("pagini/produse", { produse: rez.rows, optiuni: rezCategorie.rows });
            })
        }
    })

})

client.query("select * from unnest(enum_range(null::categ_merch))",function(err,rezCategorie){
	if(err)
	{
		console.log(err);
	}
	else{
		obGlobal.optiuniMeniu=rezCategorie.rows;
		console.log(obGlobal.optiuniMeniu);
	}
});

app.get("/produs/:id", function (req, res) {
    console.log(req.params);

    client.query(` select * from merch where id=${req.params.id} `, function (err, rezultat) {
        if (err) {
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else{
            console.log(rezultat.rows[0]);
            res.render("pagini/produs", { prod: rezultat.rows[0] });
        }
    });
});

app.get("/produse", function (req, res) {
    client.query(
        "SELECT MIN(pret) AS min_price, MAX(pret) AS max_price FROM instrumente",
        function (err, rezPret) {
            if (err) {
                console.log(err);
                afiseazaEroare(res, 2);
            }
})});



function initializeazaErori() {
    var continut = fs.readFileSync(__dirname + "/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    //for(let i=0; i< vErori.length; i++) //vErori[i]
    for (let eroare of vErori) {
        eroare.imagine = "/" + obGlobal.obErori.cale_baza + "/" + eroare.imagine;
    }
}

initializeazaErori();

function initializeazaImagini() {
    /*
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
        
        [numeFis, ext]=imag.cale_imagine.split(".");
        let caleFisAbs=path.join(caleAbs,imag.cale_imagine);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        sharp(caleFisAbs).resize(50).toFile(caleFisMicAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp")
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic",numeFis+".webp")
        imag.cale_imagine=path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_imagine)
        ////////////
*/
    var continut = fs.readFileSync(__dirname + "/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic = path.join(__dirname, obGlobal.obImagini.cale_galerie, "mic");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);
    //for (let i=0; i< vErori.length; i++ )	
    for (let imag of vImagini) {
        [numeFis, ext] = imag.cale_relativa.split(".");
        let caleFisAbs = path.join(caleAbs, imag.cale_relativa);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");
        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs);
        imag.fisier_mediu = path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis + ".webp")
        imag.fisier_mic = path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis + ".webp")
        imag.fisier = path.join("/", obGlobal.obImagini.cale_galerie, imag.cale_relativa)
        //eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}

initializeazaImagini();

function afiseazaEroare(res, _identificator, _titlu = "titlu default", _text, _imagine) {
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (elem) { return elem.identificator == _identificator });
    if (eroare) {
        let titlu1 = _titlu == "titlu default" ? (_titlu || eroare.titlu) : _titlu;
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if (eroare.status) {
            console.log(eroare.identificator);
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu1, text: text1, imagine: imagine1 });
        }
        else {
            res.render("pagini/eroare", { titlu: titlu1, text: text1, imagine: imagine1 });
        }
    } else {
        var errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", { titlu: errDef.titlu, text: errDef.text, imagine: obGlobal.obErori.cale_baza + "/" + errDef.imagine });
    }

}

app.listen(8080);
console.log("Serverul a pornit");


  //////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////Cos virtual
app.post("/produse_cos",function(req, res){
    // console.log(req.body);
    if(req.body.ids_prod.length!=0){
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fi `select nume, descriere, pret, gramaj, imagine from prajituri where id in (lista de id-uri)`
        AccesBD.getInstanta().select({tabel:"merch", campuri:"nume,descriere,pret,material,produ_disp,culoare,categorie,marime,de_spalat,imagine,data_adaugare".split(","),conditiiAnd:[`id in (${req.body.ids_prod})`]},
        function(err, rez){
            if(err) {
                res.send([]);
                console.log(err);
            } else {
                res.send(rez.rows);
            }
        });
    }
    else{
        res.send([]);
    }
});




////////////////////////////////////FACTURA////////////////////////////////////////////////////////////////////////////////////
app.post("/cumpara",function(req, res){
    // console.log(req.body);
    console.log("Utilizator:", req?.utilizator);
    console.log("Utilizator:", req?.utilizator?.rol?.areDreptul?.(Drepturi.cumparareProduse));
    console.log("Drept:", req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse));
    if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)){
        AccesBD.getInstanta().select({
            tabel:"poze",
            campuri:["*"],
            conditiiAnd:[`id in (${req.body.ids_prod})`]
        }, function(err, rez){
            if(!err  && rez.rowCount>0){
                console.log("produse:", rez.rows);
                let rezFactura= ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"),{
                    protocol: obGlobal.protocol, 
                    domeniu: obGlobal.numeDomeniu,
                    utilizator: req.session.utilizator,
                    produse: rez.rows
                });
                console.log(rezFactura);
                let numeFis=`./temp/factura${(new Date()).getTime()}.pdf`;
                genereazaPdf(rezFactura, numeFis, function (numeFis){
                    mesajText=`Stimate ${req.session.utilizator.nume} ${req.session.utilizator.prenume} aveti mai jos factura.`;
                    mesajHTML=`<h2>Stimate ${req.session.utilizator.nume} ${req.session.utilizator.prenume},</h2> aveti mai jos factura.`;
                    req.utilizator.trimiteMail("Factura", mesajText,mesajHTML,[{
                        filename:"factura.pdf",
                        content: fs.readFileSync(numeFis)
                    }] );
                    res.send("Totul e bine!");
                });
                rez.rows.forEach(function (elem){ elem.cantitate=1});
                let jsonFactura= {
                    data: new Date(),
                    username: req.session.utilizator.username,
                    produse:rez.rows
                }
                if(obGlobal.bdMongo){
                    obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo){
                        if (err) console.log(err)
                        else console.log ("Am inserat factura in mongodb");

                        obGlobal.bdMongo.collection("facturi").find({}).toArray(
                            function (err, rezInserare){
                                if (err) console.log(err)
                                else console.log (rezInserare);
                        })
                    })
                }
            }
        })
    }
    else{
        res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");
    }
    
});

///////////////////////////////////inregistrare//////////////////////////////
app.post("/inregistrare",function(req, res){
    var username;
    var poza;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume[0];
            utilizNou.setareUsername=campuriText.username[0];
            utilizNou.email=campuriText.email[0]
            utilizNou.prenume=campuriText.prenume[0]
            
            utilizNou.parola=campuriText.parola[0];
            utilizNou.culoare_chat=campuriText.culoare_chat[0];
            utilizNou.poza= poza[0];
            utilizNou.telefon = campuriText.telefon[0];
            utilizNou.data_nastere = campuriText.data_nastere[0];
            Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul. Incercati " + campuriText.username[0] + Math.floor(Math.random() * 100000);
                }

                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })
        }
        catch(e){ 
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }

    });
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
		//TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        let folderUser=path.join(__dirname, "poze_uploadate",username);
        //folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename
        //fisier.filepath=folderUser+"/"+fisier.originalFilename

    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});


app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                campuri:{confirmat_mail:'true'}, 
                conditiiAnd:[`cod='${obparam.token}'`]}, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        afisareEroare(res,2);
    }
});

////////////////////////////////LOGARE
app.post("/login",function(req, res){
    var username;
    mesajLogin = "";
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        Utilizator.getUtilizDupaUsername (campuriText.username[0],{
            req:req,
            res:res,
            parola:campuriText.parola[0]
        }, function(u, obparam ){
            let parolaCriptata=Utilizator.criptareParola(obparam.parola);
            if(u.parola==parolaCriptata && u.confirmat_mail ){
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                obparam.req.session.utilizator=u;
                
                obparam.req.session.mesajLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                //obparam.res.render("/login");
            }
            else{
                console.log("Eroare logare")
                obparam.req.session.mesajLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});

/******************Administrare utilizatori */
app.get("/useri", function(req, res){
   
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        afisareEroare(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){ 
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        afisareEroare(res,403);
    }
});

app.use("/*",function(req,res,next)
{
	res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    res.locals.Drepturi=Drepturi;
    if (req.session.utilizator){
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);
    }   
	next();
});

app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        randeazaEroare(res,403,)
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola[0]);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[`${campuriText.nume[0]}`,`${campuriText.prenume[0]}`,`${campuriText.email[0]}`,`${campuriText.culoare_chat[0]}`],
            conditiiAnd:[`parola='${parolaCriptata}'`,`username='${campuriText.username[0]}'`]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                afiseazaEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume[0];
                req.session.utilizator.prenume= campuriText.prenume[0];
                req.session.utilizator.email= campuriText.email[0];
                req.session.utilizator.culoare_chat= campuriText.culoare_chat[0];
                res.locals.utilizator=req.session.utilizator[0];
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});

// ^\w+\.ejs$
app.get("/*.ejs", function (req, res) {
    afiseazaEroare(res, 400);
});

app.get("/*", function (req, res) {
    try {
        console.log(req.url);
        res.render("pagini" + req.url, function (err, rezRandare) {
            if (err) {
                console.log(err);
                if (err.message.startsWith("Failed to lookup view")) {
                    //afiseazaEroare(res,{_identificator:404,_titlu:"ceva"});
                    afiseazaEroare(res, 404, "ceva");
                }
                else {
                    afiseazaEroare(res);
                }
            } else {
                res.send(rezRandare);
            }

        });
    }
    catch (err) {
        if (err.message.startsWith("Cannot find module")) {
            //afiseazaEroare(res,{_identificator:404,_titlu:"ceva"});
            afiseazaEroare(res, 404, "Eroare");
        }
        else {
            afiseazaEroare(res);
        }
    }
})

