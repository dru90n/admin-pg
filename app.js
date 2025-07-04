// Inisialisasi Supabase
const SUPABASE_URL = "https://zbunmfsedqalvvadwgkk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidW5tZnNlZHFhbHZ2YWR3Z2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjE2NTUsImV4cCI6MjA2NjgzNzY1NX0.wUEGv5FavNSQT3iNlo6WnW_d3TcDVxRTx8sI6xD-wxQ";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function checkPassword() {
  const pass = document.getElementById('password-input').value;
  if (pass === '123') {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('menu-section').style.display = 'block';
  } else {
    alert('Password salah!');
  }
}

async function showNewOrder() {
  let html = `
    <h3>New Order</h3>
    <input type="text" id="order_number" placeholder="Nomor Order" readonly />
    <input type="date" id="order_date" />
    <select id="room_category" onchange="updateRoomOptions()">
      <option value="">Pilih Kategori</option>
      <option value="Tulip">Tulip</option>
      <option value="Orchid">Orchid</option>
    </select>
    <input type="text" id="room_name" placeholder="Nama Talent" />
    <input type="number" id="vouchers" placeholder="Jumlah Voucher" oninput="updateRoomOptions()" />
    <input type="number" id="extra_hours" placeholder="Jam Tambahan" oninput="updateRoomOptions()" />
    <input type="text" id="total_bill" placeholder="Total Bill" readonly />
    <select id="payment_method">
      <option value="Cash">Cash</option>
      <option value="Transfer">Transfer</option>
      <option value="Pending Bill">Pending Bill</option>
    </select>
    <button onclick="simpanOrder()">Simpan</button>
  `;
  document.getElementById('content-section').innerHTML = html;
  document.getElementById('order_date').valueAsDate = new Date();

  const { data } = await supabase.from('orders').select('order_number').order('created_at', { ascending: false }).limit(1);

  let nextNumber = "ORD000001";
  if (data && data.length > 0) {
    const lastNumber = data[0].order_number;
    const lastDigits = parseInt(lastNumber.replace('ORD', '')) || 0;
    const newDigits = String(lastDigits + 1).padStart(6, '0');
    nextNumber = "ORD" + newDigits;
  }

  document.getElementById('order_number').value = nextNumber;
}

function updateRoomOptions() {
  const category = document.getElementById('room_category').value;
  const v = parseInt(document.getElementById('vouchers')?.value || 0);
  const h = parseInt(document.getElementById('extra_hours')?.value || 0);
  const totalInput = document.getElementById('total_bill');
  let total = 0;
  if (category === 'Tulip') total = v * 1000 + h * 350;
  else if (category === 'Orchid') total = v * 750 + h * 250;
  if (totalInput) totalInput.value = total;
}

async function simpanOrder() {
  const data = {
    order_number: document.getElementById("order_number").value,
    order_date: document.getElementById("order_date").value,
    room_category: document.getElementById("room_category").value,
    room_name: document.getElementById("room_name").value,
    vouchers: parseInt(document.getElementById("vouchers").value || 0),
    extra_hours: parseInt(document.getElementById("extra_hours").value || 0),
    total_bill: parseFloat(document.getElementById("total_bill").value || 0),
    payment_method: document.getElementById("payment_method").value,
    payment_status: document.getElementById("payment_method").value === "Pending Bill" ? "Belum Lunas" : "Lunas",
    created_at: new Date().toISOString()
  };
  const { error } = await supabase.from("orders").insert([data]);
  if (error) alert("Gagal simpan: " + error.message);
  else {
    alert("Berhasil disimpan!");
    document.getElementById("content-section").innerHTML = "";
  }
}

function showEditOrder() {
  const html = `
    <h3>Edit Order</h3>
    <label>Tanggal (YYYY-MM-DD):</label>
    <input type="date" id="search_date" />
    <label>No Order:</label>
    <input type="text" id="search_room" placeholder="Contoh: ORD0000XX" />
    <button onclick="cariOrder()">Cari</button>
    <div id="edit-result"></div>
  `;
  document.getElementById('content-section').innerHTML = html;
}

async function cariOrder() {
  const date = document.getElementById("search_date").value.trim();
  const room = document.getElementById("search_room").value.trim();
  if (!date || !room) return alert("Lengkapi tanggal dan No Order.");
  const { data } = await supabase.from("orders").select("*").eq("order_date", date).ilike("order_number", room);
  if (!data.length) return document.getElementById("edit-result").innerHTML = "Order tidak ditemukan.";
  const order = data[0];
  const html = `
    <p><b>Nomor:</b> ${order.order_number}</p>
    <p><b>Tanggal:</b> ${order.order_date}</p>
    <p><b>Nama:</b> ${order.room_name}</p>
    <p><b>Status Pembayaran:</b> ${order.payment_status}</p>
    <select id="new_payment_status">
      <option value="Lunas" ${order.payment_status === "Lunas" ? "selected" : ""}>Lunas</option>
      <option value="Belum Lunas" ${order.payment_status === "Belum Lunas" ? "selected" : ""}>Belum Lunas</option>
    </select>
    <button onclick="updateOrder('${order.order_number}')">Simpan Perubahan</button>
  `;
  document.getElementById("edit-result").innerHTML = html;
}

async function updateOrder(order_number) {
  const newStatus = document.getElementById("new_payment_status").value;
  const { error } = await supabase.from("orders").update({ payment_status: newStatus }).eq("order_number", order_number);
  if (error) alert("Gagal update: " + error.message);
  else {
    alert("Berhasil diperbarui!");
    document.getElementById("content-section").innerHTML = "";
  }
}

function showTarikData() {
  const html = `
    <h3>Tarik Data</h3>
    <label>Dari:</label>
    <input type="date" id="start_date" />
    <label>Sampai:</label>
    <input type="date" id="end_date" />
    <button onclick="tarikData()">Tarik</button>
    <div id="data-result"></div>
  `;
  document.getElementById('content-section').innerHTML = html;
}

async function tarikData() {
  const start = document.getElementById("start_date").value;
  const end = document.getElementById("end_date").value;
  if (!start || !end) return alert("Lengkapi kedua tanggal");
  const { data, error } = await supabase.from("orders").select("*").gte("order_date", start).lte("order_date", end);
  if (error) return alert("Gagal tarik: " + error.message);

  let html = `<p>Ditemukan ${data.length} data:</p>`;
  html += `<table border="1" id="export-table"><thead><tr>
    <th>No</th><th>Order</th><th>Tanggal</th><th>Kategori</th><th>Ruang</th>
    <th>Voucher</th><th>Jam</th><th>Total</th><th>Bayar</th><th>Status</th>
  </tr></thead><tbody>`;
  data.forEach((d, i) => {
    html += `<tr><td>${i + 1}</td><td>${d.order_number}</td><td>${d.order_date}</td><td>${d.room_category}</td><td>${d.room_name}</td><td>${d.vouchers}</td><td>${d.extra_hours}</td><td>${d.total_bill}</td><td>${d.payment_method}</td><td>${d.payment_status}</td></tr>`;
  });
  html += `</tbody></table><br/><button onclick="exportToExcel()">Export ke Excel (.xls)</button>`;
  document.getElementById("data-result").innerHTML = html;
}

function exportToExcel() {
  const table = document.getElementById("export-table").outerHTML;
  const blob = new Blob(["\ufeff" + table], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "orders_export.xls";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
