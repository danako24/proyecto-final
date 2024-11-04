const contenedorCartas = document.getElementById("contenedor-cartas");
const botonAbrirSobre = document.getElementById("abrir-sobre");
const saldoDisplay = document.getElementById("saldo");
const historialGanancias = document.getElementById("historial-ganancias");
const nombreUsuarioDisplay = document.getElementById("nombre-usuario");
const botonReiniciarSesion = document.getElementById("reiniciar-sesion");


let saldo = parseInt(localStorage.getItem("saldo")) || 10000;
const costoSobre = 1000;

function actualizarSaldo() {
    saldoDisplay.textContent = `Saldo: $${saldo}`;
    localStorage.setItem("saldo", saldo);
}

function mostrarNombreUsuario() {
    let nombreUsuario = localStorage.getItem("nombreUsuario");
    
    if (!nombreUsuario) {
        nombreUsuario = prompt("Por favor, ingresa tu nombre:");
        localStorage.setItem("nombreUsuario", nombreUsuario);
    }
    
    nombreUsuarioDisplay.textContent = `Bienvenido, ${nombreUsuario}`;
}

async function obtenerPokemon(id) {
    try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await respuesta.json();
        return data;
    } catch (error) {
        console.error("Error al obtener el Pokémon:", error);
    }
}

function asignarRareza() {
    const probabilidad = Math.random();
    if (probabilidad < 0.6) return "Común";         
    if (probabilidad < 0.85) return "Rara";         
    if (probabilidad < 0.95) return "Super rara";  
    return "Ultra rara";                           
}

function obtenerColorRareza(rareza) {
    switch (rareza) {
        case "Común":
            return "#d3d3d3";
        case "Rara":
            return "#1e90ff";
        case "Super rara":
            return "#8a2be2";
        case "Ultra rara":
            return "#ffd700";
    }
}

function calcularGanancia(rareza) {
    switch (rareza) {
        case "Común":
            return 10;
        case "Rara":
            return 100;
        case "Super rara":
            return 500;
        case "Ultra rara":
            return 3000;
    }
}

function mostrarCarta(pokemon, rareza) {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.style.backgroundColor = obtenerColorRareza(rareza);
    carta.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name.toUpperCase()}</h3>
        <p>ID: ${pokemon.id}</p>
        <p>Tipo: ${pokemon.types.map((type) => type.type.name).join(", ")}</p>
        <p>Rareza: <strong>${rareza}</strong></p>
    `;
    contenedorCartas.appendChild(carta);
}

function actualizarHistorialGanancias(gananciaTotal, rareza) {
    const entradaHistorial = document.createElement("p");
    entradaHistorial.textContent = `Ganancia de sobre: $${gananciaTotal} - Rareza: ${rareza}`;
    entradaHistorial.style.color = obtenerColorRareza(rareza);
    historialGanancias.appendChild(entradaHistorial);

    Toastify({
        text: `Ganancia de sobre: $${gananciaTotal} - Rareza: ${rareza}`,
        className: "info",
        position: "right",
        offset: {
            x: 50,
            y: 400,
        },
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();

    const entradas = historialGanancias.querySelectorAll("p");
    if (entradas.length > 5) {
        historialGanancias.removeChild(entradas[0]);
    }
}

async function abrirSobre() {
    if (saldo < costoSobre) {
        alert("No tienes suficiente saldo para abrir un sobre.");
        return;
    }

    saldo -= costoSobre;
    actualizarSaldo();

    contenedorCartas.innerHTML = "";

    let gananciaTotal = 0;
    for (let i = 0; i < 5; i++) {
        const idAleatorio = Math.floor(Math.random() * 150) + 1;
        const pokemon = await obtenerPokemon(idAleatorio);
        const rareza = asignarRareza();
        mostrarCarta(pokemon, rareza);

        gananciaTotal += calcularGanancia(rareza);
    }

    saldo += gananciaTotal;
    actualizarSaldo();
    actualizarHistorialGanancias(gananciaTotal, asignarRareza());
}

function reiniciarSesion() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Se cerrará la sesión actual y se reiniciarán los datos.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, reiniciar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("nombreUsuario");
            localStorage.removeItem("saldo");
            Swal.fire(
                "Reiniciado",
                "La sesión ha sido reiniciada.",
                "success"
            ).then(() => {
                location.reload();
            });
        }
    });
}

botonReiniciarSesion.addEventListener("click", reiniciarSesion);

botonAbrirSobre.addEventListener("click", abrirSobre);

mostrarNombreUsuario();
actualizarSaldo();


