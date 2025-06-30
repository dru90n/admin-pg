// Inisialisasi Supabase
const SUPABASE_URL = "https://zbunmfsedqalvvadwgkk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidW5tZnNlZHFhbHZ2YWR3Z2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjE2NTUsImV4cCI6MjA2NjgzNzY1NX0.wUEGv5FavNSQT3iNlo6WnW_d3TcDVxRTx8sI6xD-wxQ";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function checkPassword() {
  const pass = document.getElementById('password-input').value;
  if (pass === 'default123') {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('menu-section').style.display = 'block';
  } else {
    alert('Password salah!');
  }
}

function showNewOrder() {
  const html = `
    <h3>New Order</h3>
    <form id="order-form">
      <input type="text" id="order_number" placeholder="Nomor Order" readonly />
      <input type="date" id="order_date" />
      <select id="room_category" onchange="updateRoomOptions()">
        <option value="">Pilih Kategori</option>
        <option value="Tulip">Tulip</option>
        <option value="Orchid">Orchid</option>
      </select>
      <input type="text" id="room_name" placeholder="Nama Ruang" />
      <input type="number" id="vouchers" placeholder="Jumlah Voucher" />
      <input type="number" id="extra_hours" placeholder="Jam Tambahan" />
      <input type="text" id="total_bill" placeholder="Total Bill" readonly />
      <select id="payment_method">
        <option value="Cash">Cash</option>
        <option value="Transfer">Transfer</option>
        <option value="Pay Later">Pay Later</option>
      </select>
      <button type="submit">Simpan</button>
    </form>
  `;
  document.getElementById('content-section').innerHTML = html;

  const now = new Date();
  document.getElementById('order_date').value = now.toISOString().split('T')[0];
  document.getElementById('order_number').value = "ORD" + now.getTime();

  document.getElementById('order-form').onsubmit = async function (e) {
    e.preventDefault();
    const category = document.getElementById("room_category").value;
    const vouchers = parseInt(document.getElementById("vouchers").value || "0");
    const hours = parseInt(document.getElementById("extra_hours").value || "0");

    let total = 0;
    if (category === "Tulip") total = (vouchers * 1000) + (hours * 350);
    else if (category === "Orchid") total = (vouchers * 750) + (hours * 250);

    document.getElementById("total_bill").value = total;

    const { error } = await supabase.from("orders").insert([{
      order_number: document.getElementById("order_number").value,
      order_date: document.getElementById("order_date").value,
      room_category: category,
      room_name: document.getElementById("room_name").value,
      vouchers,
      extra_hours: hours,
      total_bill: total,
      payment_method: document.getElementById("payment_method").value,
      payment_status: document.getElementById("payment_method").value === "Pay Later" ? "Belum Lunas" : "Lunas"
    }]);

    if (error) alert("Gagal simpan: " + error.message);
    else alert("Berhasil disimpan!");
  };
}

function showEditOrder() {
  const html = `
    <h3>Edit Order</h3>
    <input type="text" id="search_order" placeholder="Cari Nomor Order" />
    <button onclick="findOrder()">Cari</button>
    <div id="edit-result"></div>
  `;
  document.getElementById('content-section').innerHTML = html;
}

async function findOrder() {
  const keyword = document.getElementById('search_order').value;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike('order_number', `%${keyword}%`);

  if (data.length === 0) {
    document.getElementById("edit-result").innerHTML = "Order tidak ditemukan.";
    return;
  }

  const order = data[0];
  const html = `
    <p>Order: ${order.order_number}</p>
    <select id="edit_payment">
      <option ${order.payment_status === "Belum Lunas" ? "selected" : ""}>Belum Lunas</option>
      <option ${order.payment_status === "Lunas" ? "selected" : ""}>Lunas</option>
    </select>
    <button onclick="saveEdit('${order.id}')">Simpan</button>
  `;
  document.getElementById("edit-result").innerHTML = html;
}

async function saveEdit(id) {
  const status = document.getElementById("edit_payment").value;
  const { error } = await supabase.from("orders").update({ payment_status: status }).eq('id', id);
  if (error) alert("Gagal update: " + error.message);
  else alert("Berhasil diupdate.");
}

function showFetchData() {
  const html = `
    <h3>Tarik Data</h3>
    <input type="date" id="start_date" />
    <input type="date" id="end_date" />
    <button onclick="fetchData()">Tarik</button>
    <div id="data-result"></div>
  `;
  document.getElementById('content-section').innerHTML = html;
}

async function fetchData() {
  const start = document.getElementById("start_date").value;
  const end = document.getElementById("end_date").value;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .gte("order_date", start)
    .lte("order_date", end);

  const list = data.map(o => `<li>${o.order_number} - ${o.room_name} - ${o.total_bill}</li>`).join("");
  document.getElementById("data-result").innerHTML = `<ul>${list}</ul>`;
}
