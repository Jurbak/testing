// Inisialisasi Supabase client
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Helper functions
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 5000);
}

function showLoading(element) {
  element.innerHTML = '<div class="loading">Memuat data...</div>';
}

function showEmpty(element, message = 'Belum ada data') {
  element.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">&#128230;</div>
      <p>${message}</p>
    </div>
  `;
}

// Authentication functions
async function login(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

// Telegram Bot functions
async function uploadToTelegram(file) {
  const formData = new FormData();
  formData.append('chat_id', CONFIG.TELEGRAM_CHAT_ID);
  formData.append('photo', file);
  formData.append('caption', `Bukti pembayaran - ${new Date().toISOString()}`);

  const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.ok) {
    return result.result.photo[result.result.photo.length - 1].file_id;
  } else {
    throw new Error(result.description || 'Gagal upload ke Telegram');
  }
}

async function getTelegramFileUrl(fileId) {
  const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
  const result = await response.json();

  if (result.ok) {
    return `https://api.telegram.org/file/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${result.result.file_path}`;
  } else {
    throw new Error(result.description || 'Gagal mendapatkan URL file');
  }
}

// Santri functions
async function getSantri() {
  const { data, error } = await supabaseClient
    .from('santri')
    .select('*')
    .order('nama');

  if (error) throw error;
  return data;
}

async function addSantri(nama, tanggalMasuk, keterangan = '') {
  const { data, error } = await supabaseClient
    .from('santri')
    .insert([{ nama, tanggal_masuk: tanggalMasuk, keterangan }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSantri(id, nama, tanggalMasuk, keterangan = '') {
  const { data, error } = await supabaseClient
    .from('santri')
    .update({ nama, tanggal_masuk: tanggalMasuk, keterangan })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteSantri(id) {
  const { error } = await supabaseClient
    .from('santri')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Pembayaran functions
async function getPembayaran(bulan, tahun) {
  const { data, error } = await supabaseClient
    .from('pembayaran')
    .select(`
      *,
      santri:santri_id (nama)
    `)
    .eq('bulan', bulan)
    .eq('tahun', tahun)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getAllPembayaran() {
  const { data, error } = await supabaseClient
    .from('pembayaran')
    .select(`
      *,
      santri:santri_id (nama)
    `)
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false });

  if (error) throw error;
  return data;
}

async function addPembayaran(santriId, bulan, tahun, jumlah, tanggalBayar, buktiGambarNama = '', keterangan = '') {
  const { data, error } = await supabaseClient
    .from('pembayaran')
    .insert([{
      santri_id: santriId,
      bulan,
      tahun,
      jumlah,
      tanggal_bayar: tanggalBayar,
      bukti_gambar_nama: buktiGambarNama,
      keterangan,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePembayaran(id, data) {
  const { data: result, error } = await supabaseClient
    .from('pembayaran')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function deletePembayaran(id) {
  const { error } = await supabaseClient
    .from('pembayaran')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Pengeluaran functions
async function getPengeluaran(bulan = null, tahun = null) {
  let query = supabaseClient
    .from('pengeluaran')
    .select('*')
    .order('tanggal', { ascending: false });

  if (bulan && tahun) {
    const startOfMonth = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const endOfMonth = `${tahun}-${String(bulan).padStart(2, '0')}-31`;
    query = query.gte('tanggal', startOfMonth).lte('tanggal', endOfMonth);
  } else if (tahun) {
    query = query.gte('tanggal', `${tahun}-01-01`).lte('tanggal', `${tahun}-12-31`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function addPengeluaran(kategori, jumlah, tanggal, buktiGambarNama = '', keterangan = '') {
  const { data, error } = await supabaseClient
    .from('pengeluaran')
    .insert([{ kategori, jumlah, tanggal, bukti_gambar_nama: buktiGambarNama, keterangan }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deletePengeluaran(id) {
  const { error } = await supabaseClient
    .from('pengeluaran')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Setting functions
async function getSetting() {
  const { data, error } = await supabaseClient
    .from('setting')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function updateSetting(jumlahKas, namaOrganisasi) {
  const { data, error } = await supabaseClient
    .from('setting')
    .update({ jumlah_kas_per_bulan: jumlahKas, nama_organisasi: namaOrganisasi })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Export to CSV
function exportToCSV(data, filename) {
  if (data.length === 0) {
    showAlert('Tidak ada data untuk diexport', 'warning');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Theme rotation
function applyRandomTheme() {
  const themes = ['sage', 'pastel-yellow', 'pastel-green', 'lavender', 'peach', 'sky', 'rose', 'mint'];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  document.documentElement.setAttribute('data-theme', randomTheme);
}

// Apply theme on load
applyRandomTheme();
