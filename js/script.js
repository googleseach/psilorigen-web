function toggleMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.getElementById('menuNav');
    if (button && menu) { button.classList.toggle('open'); menu.classList.toggle('open'); }
}
const scriptURL = 'https://script.google.com/macros/s/AKfycbwFldwkBpUDF8OIRhYnaHLWpXP6IfJ_Fn_hfMnlmunqlqRmNWytjQQQcGgWaUzjxcmG/exec';
const formContacto = document.getElementById('contactoForm');
if (formContacto) {
    formContacto.addEventListener('submit', e => {
        e.preventDefault();
        const btn = formContacto.querySelector('button[type="submit"]');
        const originalText = btn.textContent; btn.textContent = 'Enviando...'; btn.disabled = true;
        fetch(scriptURL, { method: 'POST', body: new FormData(formContacto) })
            .then(response => { alert('✅ ¡Mensaje enviado!'); formContacto.reset(); btn.textContent = originalText; btn.disabled = false; })
            .catch(error => { alert('¡Error!'); btn.textContent = originalText; btn.disabled = false; });
    });
}
let fechaActual = new Date(); let mesActual = fechaActual.getMonth(); let anioActual = fechaActual.getFullYear(); let diaSeleccionado = null;
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function renderCalendario() {
    const grid = document.getElementById('calendarioGrid'); if (!grid) return;
    document.getElementById('mesActual').textContent = meses[mesActual] + ' ' + anioActual;
    grid.innerHTML = '';
    let primerDia = new Date(anioActual, mesActual, 1).getDay(); let diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate(); let hoy = new Date(); hoy.setHours(0,0,0,0);
    for (let i = 0; i < primerDia; i++) { let empty = document.createElement('div'); empty.className = 'dia'; empty.style.visibility = 'hidden'; grid.appendChild(empty); }
    for (let dia = 1; dia <= diasEnMes; dia++) {
        let div = document.createElement('div'); div.className = 'dia'; div.textContent = dia;
        let fechaObjeto = new Date(anioActual, mesActual, dia); let diaSemana = fechaObjeto.getDay();
        if (diaSemana >= 1 && diaSemana <= 5 && fechaObjeto >= hoy) { div.classList.add('disponible'); div.onclick = function() { seleccionarDia(this, dia); }; } else { div.classList.add('ocupado'); }
        grid.appendChild(div);
    }
}
function cambiarMes(dir) { mesActual += dir; if (mesActual < 0) { mesActual = 11; anioActual--; } if (mesActual > 11) { mesActual = 0; anioActual++; } renderCalendario(); }
function seleccionarDia(el, dia) {
    document.querySelectorAll('.dia.seleccionado').forEach(d => d.classList.remove('seleccionado')); el.classList.add('seleccionado'); diaSeleccionado = dia;
    document.getElementById('fechaSeleccionada').value = anioActual + '-' + (mesActual + 1) + '-' + (dia < 10 ? '0' : '') + dia;
    document.getElementById('horariosDisponibles').style.display = 'block';
    const btnNext = document.querySelector('.wizard-step[data-step="1"] .btn-wizard-next'); if(btnNext) btnNext.disabled = false;
}
function seleccionarHorario(el, horario) { document.querySelectorAll('.horario-btn.seleccionado').forEach(b => b.classList.remove('seleccionado')); el.classList.add('seleccionado'); document.getElementById('horarioSeleccionado').value = horario; }
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('calendarioGrid')) renderCalendario();
    const steps = document.querySelectorAll('.wizard-step'); const progressBar = document.getElementById('progressBar'); let currentStep = 0;
    function updateProgress() { if(!progressBar) return; let percent = ((currentStep) / (steps.length - 1)) * 100; progressBar.style.width = percent + '%'; }
    function showStep(index) { steps.forEach((step, i) => { step.classList.remove('active'); if (i === index) step.classList.add('active'); }); updateProgress(); }
    document.querySelectorAll('.btn-wizard-next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 0) { if (!document.getElementById('fechaSeleccionada').value || !document.getElementById('horarioSeleccionado').value) { alert("Selecciona día y hora."); return; } }
            else if (currentStep === 1 || currentStep === 2) { let stepEl = steps[currentStep]; if (stepEl.querySelectorAll('input[type="checkbox"]:checked').length === 0) { alert("Selecciona al menos una opción."); return; } }
            else if (currentStep === 4) { if (document.getElementById('intencion_final').value.trim() === '') { alert("Escribe tu intención."); return; } }
            if (currentStep < steps.length - 1) { currentStep++; showStep(currentStep); }
        });
    });
    document.querySelectorAll('.btn-wizard-prev').forEach(btn => { btn.addEventListener('click', () => { if (currentStep > 0) { currentStep--; showStep(currentStep); } }); });
    document.querySelectorAll('.opcion-card').forEach(label => {
        const input = label.querySelector('input');
        if(input) { input.addEventListener('change', () => { if(input.type === 'radio') { document.querySelectorAll(`input[name="${input.name}"]`).forEach(r => { if(r !== input) r.parentElement.classList.remove('selected'); }); } if(input.checked) label.classList.add('selected'); else label.classList.remove('selected'); }); }
    });
});
