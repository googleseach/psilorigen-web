function toggleMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.getElementById('menuNav');
    if (button && menu) { button.classList.toggle('open'); menu.classList.toggle('open'); }
}

// FORMULARIO LEAD / CONTACTO (Fetch)
const scriptURL = 'https://script.google.com/macros/s/AKfycbwFldwkBpUDF8OIRhYnaHLWpXP6IfJ_Fn_hfMnlmunqlqRmNWytjQQQcGgWaUzjxcmG/exec';

// Formulario de Contacto
const formContacto = document.getElementById('contactoForm');
if (formContacto) {
    formContacto.addEventListener('submit', e => {
        e.preventDefault();
        const btn = formContacto.querySelector('button[type="submit"]');
        const originalText = btn.textContent; btn.textContent = 'Enviando...'; btn.disabled = true;
        fetch(scriptURL, { method: 'POST', body: new FormData(formContacto) })
            .then(response => {
                alert('✅ ¡Mensaje enviado! Te responderemos pronto.');
                formContacto.reset(); btn.textContent = originalText; btn.disabled = false;
            })
            .catch(error => { alert('¡Error! No se pudo enviar.'); btn.textContent = originalText; btn.disabled = false; });
    });
}

// =========================================
// LÓGICA DEL CALENDARIO Y WIZARD (RESERVA)
// =========================================
let fechaActual = new Date();
let mesActual = fechaActual.getMonth();
let anioActual = fechaActual.getFullYear();
let diaSeleccionado = null;
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function renderCalendario() {
    const grid = document.getElementById('calendarioGrid');
    if (!grid) return; 

    const titulo = document.getElementById('mesActual');
    titulo.textContent = meses[mesActual] + ' ' + anioActual;
    grid.innerHTML = '';
    
    let primerDia = new Date(anioActual, mesActual, 1).getDay();
    let diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    for (let i = 0; i < primerDia; i++) {
        let empty = document.createElement('div');
        empty.className = 'dia';
        empty.style.visibility = 'hidden';
        grid.appendChild(empty);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        let div = document.createElement('div');
        div.className = 'dia';
        div.textContent = dia;
        
        let fechaObjeto = new Date(anioActual, mesActual, dia);
        let diaSemana = fechaObjeto.getDay(); 
        
        // Lunes a Viernes (1 a 5) y fechas de hoy en adelante
        if (diaSemana >= 1 && diaSemana <= 5 && fechaObjeto >= hoy) {
            div.classList.add('disponible');
            div.onclick = function() { seleccionarDia(this, dia); };
        } else {
            div.classList.add('ocupado');
        }
        grid.appendChild(div);
    }
}

function cambiarMes(direccion) {
    mesActual += direccion;
    if (mesActual < 0) { mesActual = 11; anioActual--; }
    if (mesActual > 11) { mesActual = 0; anioActual++; }
    renderCalendario();
}

function seleccionarDia(elemento, dia) {
    document.querySelectorAll('.dia.seleccionado').forEach(el => el.classList.remove('seleccionado'));
    elemento.classList.add('seleccionado');
    diaSeleccionado = dia;
    document.getElementById('fechaSeleccionada').value = anioActual + '-' + (mesActual + 1) + '-' + (dia < 10 ? '0' : '') + dia;
    document.getElementById('horariosDisponibles').style.display = 'block';
    
    // Habilitar botón siguiente del paso 1
    const btnNext = document.querySelector('.wizard-step[data-step="1"] .btn-wizard-next');
    if(btnNext) btnNext.disabled = false;
}

function seleccionarHorario(elemento, horario) {
    document.querySelectorAll('.horario-btn.seleccionado').forEach(el => el.classList.remove('seleccionado'));
    elemento.classList.add('seleccionado');
    document.getElementById('horarioSeleccionado').value = horario;
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('calendarioGrid')) {
        renderCalendario();
    }
    
    // Lógica del Wizard
    const steps = document.querySelectorAll('.wizard-step');
    const progressBar = document.getElementById('progressBar');
    let currentStep = 0;

    function updateProgress() {
        if(!progressBar) return;
        let percent = ((currentStep) / (steps.length - 1)) * 100;
        progressBar.style.width = percent + '%';
    }

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.remove('active');
            if (i === index) step.classList.add('active');
        });
        updateProgress();
    }

    document.querySelectorAll('.btn-wizard-next').forEach(btn => {
        btn.addEventListener('click', () => {
            // Validaciones básicas por paso
            if (currentStep === 0) {
                if (!document.getElementById('fechaSeleccionada').value || !document.getElementById('horarioSeleccionado').value) {
                    alert("Por favor, selecciona un día y un horario."); return;
                }
            } else if (currentStep === 1 || currentStep === 2) {
                // Los pasos 2 y 3 tienen múltiples opciones
                let stepEl = steps[currentStep];
                let checked = stepEl.querySelectorAll('input[type="checkbox"]:checked');
                if (checked.length === 0) {
                    alert("Por favor, selecciona al menos una opción."); return;
                }
            } else if (currentStep === 4) {
                let textVal = document.getElementById('intencion_final').value;
                if (textVal.trim() === '') {
                    alert("Por favor, escribe tu intención."); return;
                }
            }

            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.btn-wizard-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Selección visual de tarjetas
    document.querySelectorAll('.opcion-card').forEach(label => {
        const input = label.querySelector('input');
        if(input) {
            input.addEventListener('change', () => {
                if(input.type === 'radio') {
                    // Desmarcar otros en el mismo grupo
                    document.querySelectorAll(`input[name="${input.name}"]`).forEach(radio => {
                        if(radio !== input) radio.parentElement.classList.remove('selected');
                    });
                }
                if(input.checked) label.classList.add('selected');
                else label.classList.remove('selected');
            });
        }
    });
});
