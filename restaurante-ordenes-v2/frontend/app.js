let usuario = null;

const badgeEstado = (estado) => {
  const map = { pending: 'warning', preparing: 'info', delivered: 'success' };
  const txt = { pending: 'Pendiente', preparing: 'Preparando', delivered: 'Entregado' };
  const cls = map[estado] || 'secondary';
  return `<span class="badge text-bg-${cls}">${txt[estado]||estado}</span>`;
};

function setSesion(u){
  usuario = u;
  localStorage.setItem('cliente', JSON.stringify(u || {}));
  document.getElementById('clienteActual').textContent = u ? `${u.nombre} (#${u.id})` : 'Sin sesión';
  document.getElementById('btnCrearOrden').disabled = !u;
  document.getElementById('userBadge').innerHTML = u ? `<span class="badge text-bg-success">Conectado: ${u.nombre}</span>` : '';
  cargarOrdenes();
}

async function registrar(){
  const nombre = document.getElementById('regNombre').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const telefono = document.getElementById('regTelefono').value.trim();
  try{
    const res = await fetch(API_URL + '/clientes/registrar', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ nombre, email, telefono })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Error al registrar');
    alert('Cuenta creada, ahora inicia sesión.');
  }catch(e){
    alert(e.message);
  }
}

async function login(){
  const email = document.getElementById('loginEmail').value.trim();
  const telefono = document.getElementById('loginTelefono').value.trim();
  try{
    const res = await fetch(API_URL + '/clientes/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, telefono })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');
    setSesion(data);
  }catch(e){
    alert(e.message);
  }
}

async function crearOrden(){
  if(!usuario) return alert('Inicia sesión');
  const platillo_nombre = document.getElementById('ordPlatillo').value.trim();
  const notes = document.getElementById('ordNotas').value.trim();
  if(!platillo_nombre) return alert('Ingresa un platillo');
  try{
    const res = await fetch(API_URL + '/ordenes', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ cliente_id: usuario.id, platillo_nombre, notes })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'No se pudo crear la orden');
    document.getElementById('ordPlatillo').value='';
    document.getElementById('ordNotas').value='';
    cargarOrdenes();
  }catch(e){
    alert(e.message);
  }
}

async function cargarOrdenes(){
  const tbody = document.getElementById('tbodyOrdenes');
  if(!usuario){
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Inicia sesión para ver tus órdenes.</td></tr>';
    return;
  }
  try{
    const res = await fetch(API_URL + '/ordenes/' + usuario.id);
    const data = await res.json();
    tbody.innerHTML = (data.length ? '' : '<tr><td colspan="6" class="text-center text-muted py-4">Sin órdenes aún.</td></tr>');
    data.forEach(o => {
      const btnDisabled = o.estado === 'delivered' ? 'disabled' : '';
      const row = `
        <tr>
          <td>#${o.id}</td>
          <td>${o.platillo_nombre}</td>
          <td>${o.notes || '-'}</td>
          <td>${badgeEstado(o.estado)}</td>
          <td>${new Date(o.creado).toLocaleString()}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary" ${btnDisabled} onclick="avanzarEstado(${o.id})">Avanzar estado →</button>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  }catch(e){
    tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center py-4">${e.message}</td></tr>`;
  }
}

async function avanzarEstado(id){
  try{
    const res = await fetch(API_URL + '/ordenes/' + id + '/estado', { method:'PUT' });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'No se pudo actualizar el estado');
    cargarOrdenes();
  }catch(e){
    alert(e.message);
  }
}

(function init(){
  const saved = localStorage.getItem('cliente');
  if(saved){
    try{ const u = JSON.parse(saved); if(u && u.id) setSesion(u); } catch(_){}
  }
})();
