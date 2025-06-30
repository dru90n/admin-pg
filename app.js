// Inisialisasi Supabase
const SUPABASE_URL = "https://zbunmfsedqalvvadwgkk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidW5tZnNlZHFhbHZ2YWR3Z2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjE2NTUsImV4cCI6MjA2NjgzNzY1NX0.wUEGv5FavNSQT3iNlo6WnW_d3TcDVxRTx8sI6xD-wxQ";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Fungsi login pakai password
function checkPassword() {
  const pass = document.getElementById('password-input').value;
  if (pass === 'default123') {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('menu-section').style.display = 'block';
  } else {
    alert('Password salah!');
  }
}

// Menampilkan form New Order
function showNewOrder() {
  const html = `
    <h3>New Order</h3>
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

    <button onclick="simpanOrder()">Simpan</button>
  `;
  document.getElementById('content-section').innerHTML = html;
  document.getElementById('order_number').value = 'ORD' + Date.now();
  document.getElementById('order_date').valueAsDate = new Date();
}

// Mengupdate total bill otomatis saat input berubah
function updateRoomOptions() {
  const category = document.getElementById('room_category').value;
  const totalInput = document.getElementById('total_bill');
  const v = parseInt(document.getElementById('vouchers').value || 0);
  const h = parseInt(document.getElementById('extra_hours').value || 0);
  let total = 0;

  if (category === 'Tulip') {
    total = v * 1000 + h * 350;
  } else if (category === 'Orchid') {
    total = v * 750 + h * 250;
  }

  totalInput.value = total;
}

// Fungsi simpan ke Supabase
async function simpanOrder() {
  const orderNumber = document.getElementById("order_number").value;
  const orderDate = document.getElementById("order_date").value;
  const roomCategory = document.getElementById("room_category").value;
  const roomName = document.getElementById("room_name").value;
  const vouchers = parseInt(document.getElementById("vouchers").value);
  const extraHours = parseInt(document.getElementById("extra_hours").value);
  const totalBill = parseFloat(document.getElementById("total_bill").value);
  const paymentMethod = document.getElementById("payment_method").value;
  const paymentStatus = paymentMethod === "Pay Later" ? "Belum Lunas" : "Lunas";

  const { data, error } = await supabase.from("orders").insert([
    {
      order_number: orderNumber,
      order_date: orderDate,
      room_category: roomCategory,
      room_name: roomName,
      vouchers,
      extra_hours: extraHours,
      total_bill: totalBill,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      created_at: new Date().toISOString()
    }
  ]);

  if (error) {
    alert("Gagal menyimpan: " + error.message);
    console.error(error);
  } else {
    alert("Order berhasil disimpan!");
    document.getElementById("content-section").innerHTML = "";
  }
}
