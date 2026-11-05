const MENU=[
 {n:'Classic Espresso',d:'Rich, dark, and intense single shot of our premium house blend.',p:120,c:'hot',img:'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=500&auto=format&fit=crop'},
 {n:'Caramel Macchiato',d:'Freshly steamed milk with vanilla-flavored syrup marked with espresso.',p:160,c:'hot',img:'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=500&auto=format&fit=crop'},
 {n:'Velvet Mocha',d:'Our signature dark chocolate melted into freshly pulled espresso shots.',p:180,c:'hot',img:'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=500&auto=format&fit=crop'},
 {n:'Iced Latte',d:'Chilled espresso over cold milk and ice. Smooth and refreshing.',p:150,c:'iced',e:'🧊'},
 {n:'Cold Brew',d:'Steeped for 18 hours for a naturally sweet, low-acid finish.',p:170,c:'iced',e:'🥤'},
 {n:'Iced Matcha Latte',d:'Ceremonial matcha whisked with milk over ice.',p:165,c:'iced',e:'🍵'},
 {n:'Butter Croissant',d:'Flaky, golden, and baked fresh every morning.',p:95,c:'pastry',e:'🥐'},
 {n:'Choco Muffin',d:'Soft muffin loaded with dark chocolate chunks.',p:85,c:'pastry',e:'🧁'},
 {n:'Ensaymada',d:'Sweet buttery brioche topped with sugar and cheese.',p:75,c:'pastry',e:'🥯'}
];
const CATS=[['all','All'],['hot','Hot'],['iced','Iced'],['pastry','Pastries'],['fav','♥ Favorites']];
const SIZES={S:0,M:20,L:40};
let cart=[],discount=0,filter='all',query='',favs=new Set(),sizes={},loggedIn=null;
const $=id=>document.getElementById(id);
const peso=v=>'₱'+v.toFixed(2);

function toast(msg){
  const t=document.createElement('div');
  t.className='toast gold-bg px-5 py-2 rounded-full text-sm font-semibold shadow-lg';
  t.textContent=msg;$('toasts').appendChild(t);
  setTimeout(()=>t.remove(),2200);
}
function renderChips(){
  $('chips').innerHTML=CATS.map(([k,l])=>`<button onclick="setFilter('${k}')" class="chip ${filter===k?'on':''} border border-gray-700 px-4 py-2 rounded-full hover:border-[#d4af37] transition">${l}</button>`).join('');
}
function renderMenu(){
  const list=MENU.filter(m=>(filter==='all'||(filter==='fav'?favs.has(m.n):m.c===filter))&&(m.n+m.d).toLowerCase().includes(query.toLowerCase()));
  $('noRes').classList.toggle('hidden',list.length>0);
  $('noRes').textContent=filter==='fav'&&!favs.size?'No favorites yet. Tap the heart on a drink to save it.':'Nothing matches your search. Try another word or pick All.';
  $('grid').innerHTML=list.map(m=>{
    const i=MENU.indexOf(m),sz=sizes[m.n]||'M',price=m.p+(m.c==='pastry'?0:SIZES[sz]);
    return `<div class="card border border-gray-800 rounded-xl hover:border-[#d4af37] bg-white/5 overflow-hidden flex flex-col text-left">
      <div class="relative">${m.img?`<img src="${m.img}" alt="${m.n}" class="w-full h-56 object-cover">`:`<div class="w-full h-56 flex items-center justify-center text-7xl bg-gradient-to-br from-[#2a2110] to-black">${m.e}</div>`}
        <button onclick="toggleFav(${i})" aria-label="Favorite ${m.n}" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-xl ${favs.has(m.n)?'text-red-500':'text-white'} hover:scale-110 transition">${favs.has(m.n)?'♥':'♡'}</button></div>
      <div class="p-6 flex-grow flex flex-col justify-between">
        <div><h3 class="text-xl font-bold mb-2 text-white">${m.n}</h3><p class="text-sm text-gray-400 mb-4">${m.d}</p>
        ${m.c==='pastry'?'':`<div class="flex gap-2 mb-2">${Object.keys(SIZES).map(s=>`<button onclick="setSize(${i},'${s}')" class="size ${s===sz?'on':''} border border-gray-600 w-9 h-9 rounded-full text-xs font-bold hover:border-[#d4af37] transition">${s}</button>`).join('')}</div>`}</div>
        <div class="flex justify-between items-center mt-4"><span class="gold-text font-bold text-lg">${peso(price)}</span>
        <button onclick="addToCart(${i})" class="border border-[#d4af37] text-[#d4af37] px-4 py-2 rounded-full text-xs font-bold hover:bg-[#d4af37] hover:text-black transition">Add to Cart</button></div>
      </div></div>`;
  }).join('');
}
function setFilter(k){filter=k;renderChips();renderMenu()}
function setQuery(v){query=v;renderMenu()}
function setSize(i,s){sizes[MENU[i].n]=s;renderMenu()}
function showFavsOnly(){filter='fav';renderChips();renderMenu();$('menu').scrollIntoView({behavior:'smooth'})}
function toggleFav(i){
  const n=MENU[i].n;
  if(favs.has(n)){favs.delete(n);toast('Removed from favorites')}else{favs.add(n);toast('♥ Saved '+n)}
  $('favCount').textContent='('+favs.size+')';renderMenu();
}

function addToCart(i){
  const m=MENU[i],sz=m.c==='pastry'?'':(sizes[m.n]||'M'),price=m.p+(sz?SIZES[sz]:0);
  const ex=cart.find(x=>x.name===m.n&&x.size===sz);
  if(ex)ex.qty++;else cart.push({name:m.n,size:sz,price,qty:1});
  updateCartUI();toast('Added '+m.n+(sz?' ('+sz+')':''));
  const c=$('cartCount');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');
}
function changeQty(i,d){cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);updateCartUI()}
function removeFromCart(i){cart.splice(i,1);updateCartUI()}
function clearCart(){if(!cart.length)return;cart=[];discount=0;$('promoMsg').textContent='';updateCartUI();toast('Cart cleared')}
function updateCartUI(){
  $('cartCount').innerText=cart.reduce((s,x)=>s+x.qty,0);
  $('checkoutBtn').disabled=!cart.length;
  $('cartItems').innerHTML=cart.length?cart.map((x,i)=>`
    <div class="flex justify-between items-center bg-white/5 p-3 rounded border border-gray-800">
      <div><p class="text-white font-bold text-sm">${x.name}${x.size?' <span class="text-gray-400 font-normal">('+x.size+')</span>':''}</p><p class="gold-text text-xs">${peso(x.price*x.qty)}</p></div>
      <div class="flex items-center gap-2">
        <button onclick="changeQty(${i},-1)" aria-label="Less" class="w-7 h-7 rounded-full border border-gray-600 hover:border-[#d4af37]">−</button>
        <span class="text-sm w-4 text-center">${x.qty}</span>
        <button onclick="changeQty(${i},1)" aria-label="More" class="w-7 h-7 rounded-full border border-gray-600 hover:border-[#d4af37]">+</button>
        <button onclick="removeFromCart(${i})" aria-label="Remove" class="text-red-500 hover:text-red-400 text-xl ml-1">&times;</button>
      </div></div>`).join(''):'<p class="text-gray-500 text-center mt-10 italic">Your cart is empty. Add a drink from the menu.</p>';
  const sub=cart.reduce((s,x)=>s+x.price*x.qty,0),disc=sub*discount;
  $('subtotalPrice').innerText=peso(sub);
  $('discRow').classList.toggle('hidden',!discount);$('discPrice').innerText='−'+peso(disc);
  $('totalPrice').innerText=peso(sub-disc);
}
function applyPromo(){
  const ok=$('promoCode').value.trim().toUpperCase()==='VELVET20',m=$('promoMsg');
  discount=ok?0.2:0;
  m.textContent=ok?'Promo applied: 20% off.':'That code isn’t valid. Try VELVET20.';
  m.className='text-xs mb-3 h-4 '+(ok?'text-green-400':'text-red-400');
  updateCartUI();
}
function toggleCart(){
  const o=$('cartSidebar').classList.toggle('open');
  $('overlay').classList.toggle('hidden',!o);
}

let timers=[];
function checkout(){
  if(!cart.length)return;
  const pay=document.querySelector('input[name="payment"]:checked').value;
  const total=$('totalPrice').innerText;
  toggleCart();cart=[];discount=0;$('promoCode').value='';$('promoMsg').textContent='';updateCartUI();
  startTracking(pay,total);
}
function startTracking(pay,total){
  timers.forEach(clearTimeout);timers=[];
  $('trackingModal').classList.remove('hidden');
  $('trackingId').innerText=`Order #VLV-${Math.floor(Math.random()*100000)} • via ${pay}`;
  $('trackingTotal').innerText='Total: '+total+(pay==='COD'?' (pay on delivery)':'');
  ['processing','transit','delivered'].forEach(s=>$('step-'+s).classList.remove('active'));
  $('step-processing').classList.add('active');
  $('bar').style.width='15%';$('rateBtn').classList.add('hidden');
  $('trackingMessage').innerText='Preparing your delicious coffee…';
  timers.push(setTimeout(()=>{$('step-transit').classList.add('active');$('bar').style.width='55%';$('trackingMessage').innerText='Your rider is on the way!'},3000));
  timers.push(setTimeout(()=>{$('step-delivered').classList.add('active');$('bar').style.width='100%';$('trackingMessage').innerText='Enjoy your Velvet Roast coffee!';$('rateBtn').classList.remove('hidden');toast('Order delivered ☕')},7000));
}
function closeTracking(){$('trackingModal').classList.add('hidden')}

function openModal(t){$('modalTitle').innerText=t;$('modalBtn').innerText=t;$('authModal').classList.remove('hidden');$('authEmail').focus()}
function closeModal(){$('authModal').classList.add('hidden')}
function doAuth(){
  const t=$('modalTitle').innerText,name=$('authEmail').value.split('@')[0];
  closeModal();$('authPass').value='';
  loggedIn=name;
  $('loginBtn').textContent='Hi, '+name;$('signBtn').textContent='Log Out';
  $('signBtn').setAttribute('onclick','logout()');
  toast(t==='Sign Up'?'Welcome, '+name+'!':'Welcome back, '+name+'!');
}
function logout(){
  loggedIn=null;$('loginBtn').textContent='Log In';$('signBtn').textContent='Sign Up';
  $('signBtn').setAttribute('onclick',"openModal('Sign Up')");toast('Logged out');
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeTracking();if($('cartSidebar').classList.contains('open'))toggleCart()}
});
addEventListener('scroll',()=>$('topBtn').classList.toggle('hidden',scrollY<600));
renderChips();renderMenu();updateCartUI();
