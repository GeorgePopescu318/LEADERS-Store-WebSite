window.addEventListener("load",function(){

	prod_sel=localStorage.getItem("cos_virtual");
	if (prod_sel){
		var vect_ids=prod_sel.split(",");
		fetch("/produse_cos", {		

			method: "POST",
			headers:{'Content-Type': 'application/json'},
			
			mode: 'cors',		
			cache: 'default',
			body: JSON.stringify({
				a:10,
				b:20,

				ids_prod: vect_ids

			})
		})
		.then(function(rasp){ console.log(rasp); x=rasp.json(); console.log(x); return x})
		.then(function(objson) {
			console.log(objson); // objson e vectorul de produse
			let main=document.getElementsByTagName("main")[0];
			let btn=document.getElementById("cumpara");
			let counter = 0;
			for (let prod of objson){
				let article=document.createElement("article");
				article.classList.add("produs");
				var h3=document.createElement("h3");
				h3.innerHTML="<br><b>"+prod.nume+"</b>";
				article.appendChild(h3);
				let imagine=document.createElement("img");
				imagine.src="../resurse/imagini/produse/"+prod.imagine;
				console.log(imagine.src);
				article.appendChild(imagine);
				
				let descriere=document.createElement("p");
				descriere.innerHTML=prod.descriere+"<br><b>Pret: </b>"+prod.pret;
				article.appendChild(descriere);

				let btnDelete = document.createElement("button");
				btnDelete.className = "btn btn-secondary";
				btnDelete.id = "delete";
				btnDelete.name = counter++;
				btnDelete.innerHTML = "Sterge din cos";

				let articleToDelete = article; // Stochează referința la elementul article

				btnDelete.onclick = function() {
					var prod_sel = localStorage.getItem("cos_virtual");
					var vect_ids = prod_sel.split(",");
					vect_ids.sort(function(a, b) {
						return parseInt(a) - parseInt(b);
					});

					var idToDelete = parseInt(this.name);

    				vect_ids.splice(idToDelete, 1); // șterge elementul din vector
					prod_sel = vect_ids.join(",");

					localStorage.setItem("cos_virtual", prod_sel);

					articleToDelete.remove();
				};
				article.appendChild(btnDelete);

				main.insertBefore(article, btn);
			}
	
		}
		).catch(function(err){console.log(err)});


		document.getElementById("cumpara").onclick=function(){
			prod_sel=localStorage.getItem("cos_virtual");// "1,2,3"

			if (prod_sel){
				var vect_ids=prod_sel.split(",");
				fetch("/cumpara", {		
		
					method: "POST",
					headers:{'Content-Type': 'application/json'},
					
					mode: 'cors',		
					cache: 'default',
					body: JSON.stringify({
						ids_prod: vect_ids,
						a:10,
						b:"abc"
					})
				})
				.then(function(rasp){ console.log(rasp); return rasp.text()})
				.then(function(raspunsText) {
					
					console.log(raspunsText);
					if(raspunsText){
						localStorage.removeItem("cos_virtual")
						let p=document.createElement("p");
						p.innerHTML=raspunsText;
						document.getElementsByTagName("main")[0].innerHTML="";
						document.getElementsByTagName("main")[0].appendChild(p)
					}
				}).catch(function(err){console.log(err)});
			}
		}
		
	}
	else{
		document.getElementsByTagName("main")[0].innerHTML="<p>Nu aveti nimic in cos!</p>";
	}		
});