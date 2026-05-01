// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const session = await checkAuth();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Tab navigation
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Populate month/year selectors
  function populateMonthSelect(selectId, defaultMonth = currentMonth) {
    const select = document.getElementById(selectId);
    namaBulan.forEach((bulan, index) => {
      const option = document.createElement('option');
      option.value = index + 1;
      option.textContent = bulan;
      if (index + 1 === defaultMonth) option.selected = true;
      select.appendChild(option);
    });
  }

  function populateYearSelect(selectId, defaultYear = currentYear) {
    const select = document.getElementById(selectId);
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === defaultYear) option.selected = true;
      select.appendChild(option);
    }
  }

  ['filterBulan', 'pembayaranBulan', 'filterPengeluaranBulan', 'laporanBulan'].forEach(id => populateMonthSelect(id));
  ['filterTahun', 'filterPengeluaranTahun', 'laporanTahun'].forEach(id => populateYearSelect(id));

  document.getElementById('pembayaranTahun').value = currentYear;
  document.getElementById('pembayaranTanggal').valueAsDate = now;
  document.getElementById('pengeluaranTanggal').valueAsDate = now;

  // Load settings
  async function loadSettings() {
    try {
      const setting = await getSetting();
      document.getElementById('settingNamaOrganisasi').value = setting.nama_organisasi || '';
      document.getElementById('settingJumlahKas').value = setting.jumlah_kas_per_bulan || 0;
      document.getElementById('pembayaranJumlah').value = setting.jumlah_kas_per_bulan || 0;

      if (setting.nama_organisasi) {
        document.getElementById('logoText').innerHTML = setting.nama_organisasi.split(' ')[0] + ' <span>' + setting.nama_organisasi.split(' ').slice(1).join(' ') + '</span>';
        document.title = setting.nama_organisasi + ' - Dashboard';
      }
    } catch (e) {
      console.error('Gagal load settings:', e);
    }
  }

  // Dashboard
  async function loadDashboard() {
    try {
      const [santriList, pembayaranList, pengeluaranList] = await Promise.all([
        getSantri(),
        getPembayaran(currentMonth, currentYear),
        getPengeluaran(currentMonth, currentYear)
      ]);

      const totalPemasukan = pembayaranList.reduce((sum, p) => sum + parseFloat(p.jumlah), 0);
      const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + parseFloat(p.jumlah), 0);
      const sisaKas = totalPemasukan - totalPengeluaran;

      const pembayaranMap = {};
      pembayaranList.forEach(p => { pembayaranMap[p.santri_id] = true; });

      const belumBayarList = santriList.filter(s => !pembayaranMap[s.id]);

      document.getElementById('statPemasukan').textContent = formatRupiah(totalPemasukan);
      document.getElementById('statPengeluaran').textContent = formatRupiah(totalPengeluaran);
      document.getElementById('statSisa').textContent = formatRupiah(sisaKas);
      document.getElementById('statBelumBayar').textContent = belumBayarList.length;

      if (belumBayarList.length === 0) {
        document.getElementById('tabelBelumBayar').innerHTML = '<tr><td colspan="3" class="empty-state">Semua santri sudah bayar &#127881;</td></tr>';
      } else {
        document.getElementById('tabelBelumBayar').innerHTML = belumBayarList.map((santri, i) => `
          <tr>
            <td data-label="No">${i + 1}</td>
            <td data-label="Nama">${santri.nama}</td>
            <td data-label="Keterangan">${santri.keterangan || '-'}</td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  }

  // Load Santri
  async function loadSantri() {
    try {
      const santriList = await getSantri();
      const tbody = document.getElementById('tabelSantri');

      if (santriList.length === 0) {
        showEmpty(tbody, 'Belum ada data santri. Klik "Tambah Santri" untuk menambah.');
        return;
      }

      tbody.innerHTML = santriList.map((santri, i) => `
        <tr>
          <td data-label="No">${i + 1}</td>
          <td data-label="Nama">${santri.nama}</td>
          <td data-label="Tanggal Masuk">${formatDate(santri.tanggal_masuk)}</td>
          <td data-label="Keterangan">${santri.keterangan || '-'}</td>
          <td data-label="Aksi">
            <div class="action-btns">
              <button class="action-btn action-btn-edit" onclick="editSantri('${santri.id}')" title="Edit">&#9998;</button>
              <button class="action-btn action-btn-delete" onclick="hapusSantri('${santri.id}')" title="Hapus">&#128465;</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading santri:', error);
    }
  }

  // Modal Santri
  const modalSantri = document.getElementById('modalSantri');
  const formSantri = document.getElementById('formSantri');

  document.getElementById('btnTambahSantri').addEventListener('click', () => {
    document.getElementById('modalSantriTitle').textContent = 'Tambah Santri';
    document.getElementById('santriId').value = '';
    formSantri.reset();
    modalSantri.classList.add('active');
  });

  document.getElementById('closeModalSantri').addEventListener('click', () => {
    modalSantri.classList.remove('active');
  });

  modalSantri.addEventListener('click', (e) => {
    if (e.target === modalSantri) modalSantri.classList.remove('active');
  });

  formSantri.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('santriId').value;
    const nama = document.getElementById('santriNama').value;
    const tanggalMasuk = document.getElementById('santriTanggalMasuk').value;
    const keterangan = document.getElementById('santriKeterangan').value;

    try {
      if (id) {
        await updateSantri(id, nama, tanggalMasuk, keterangan);
        showAlert('Data santri berhasil diupdate');
      } else {
        await addSantri(nama, tanggalMasuk, keterangan);
        showAlert('Santri berhasil ditambahkan');
      }
      modalSantri.classList.remove('active');
      loadSantri();
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  });

  // Global functions for onclick handlers
  window.editSantri = async (id) => {
    const santriList = await getSantri();
    const santri = santriList.find(s => s.id === id);
    if (!santri) return;

    document.getElementById('modalSantriTitle').textContent = 'Edit Santri';
    document.getElementById('santriId').value = santri.id;
    document.getElementById('santriNama').value = santri.nama;
    document.getElementById('santriTanggalMasuk').value = santri.tanggal_masuk;
    document.getElementById('santriKeterangan').value = santri.keterangan || '';
    modalSantri.classList.add('active');
  };

  window.hapusSantri = async (id) => {
    if (!confirm('Yakin ingin menghapus santri ini? Data pembayaran terkait juga akan terhapus.')) return;

    try {
      await deleteSantri(id);
      showAlert('Santri berhasil dihapus');
      loadSantri();
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Load Pembayaran
  async function loadPembayaran() {
    try {
      const bulan = parseInt(document.getElementById('filterBulan').value);
      const tahun = parseInt(document.getElementById('filterTahun').value);
      const pembayaranList = await getPembayaran(bulan, tahun);
      const tbody = document.getElementById('tabelPembayaran');

      if (pembayaranList.length === 0) {
        showEmpty(tbody, 'Belum ada pembayaran untuk bulan ini.');
        return;
      }

      tbody.innerHTML = pembayaranList.map((p, i) => `
        <tr>
          <td data-label="No">${i + 1}</td>
          <td data-label="Nama">${p.santri?.nama || '-'}</td>
          <td data-label="Bulan/Tahun">${namaBulan[p.bulan - 1]} ${p.tahun}</td>
          <td data-label="Jumlah">${formatRupiah(p.jumlah)}</td>
          <td data-label="Tanggal">${formatDate(p.tanggal_bayar)}</td>
          <td data-label="Bukti">${p.bukti_gambar_nama ? `<button class="action-btn action-btn-view" onclick="lihatBukti('${p.bukti_gambar_nama}', 'Pembayaran ${namaBulan[p.bulan - 1]} ${p.tahun}')">&#128065;</button>` : '-'}</td>
          <td data-label="Aksi">
            <div class="action-btns">
              <button class="action-btn action-btn-delete" onclick="hapusPembayaran('${p.id}')" title="Hapus">&#128465;</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading pembayaran:', error);
    }
  }

  // Modal Pembayaran
  const modalPembayaran = document.getElementById('modalPembayaran');
  const formPembayaran = document.getElementById('formPembayaran');

  async function populateSantriSelect() {
    const santriList = await getSantri();
    const select = document.getElementById('pembayaranSantri');
    select.innerHTML = '<option value="">Pilih santri...</option>' +
      santriList.map(s => `<option value="${s.id}">${s.nama}</option>`).join('');
  }

  document.getElementById('btnTambahPembayaran').addEventListener('click', async () => {
    await populateSantriSelect();
    formPembayaran.reset();
    document.getElementById('pembayaranTahun').value = currentYear;
    document.getElementById('pembayaranTanggal').valueAsDate = now;
    const setting = await getSetting();
    document.getElementById('pembayaranJumlah').value = setting.jumlah_kas_per_bulan || 0;
    modalPembayaran.classList.add('active');
  });

  document.getElementById('closeModalPembayaran').addEventListener('click', () => {
    modalPembayaran.classList.remove('active');
  });

  modalPembayaran.addEventListener('click', (e) => {
    if (e.target === modalPembayaran) modalPembayaran.classList.remove('active');
  });

  formPembayaran.addEventListener('submit', async (e) => {
    e.preventDefault();

    const santriId = document.getElementById('pembayaranSantri').value;
    const bulan = parseInt(document.getElementById('pembayaranBulan').value);
    const tahun = parseInt(document.getElementById('pembayaranTahun').value);
    const jumlah = parseFloat(document.getElementById('pembayaranJumlah').value);
    const tanggalBayar = document.getElementById('pembayaranTanggal').value;
    const buktiFile = document.getElementById('pembayaranBukti').files[0];
    const keterangan = document.getElementById('pembayaranKeterangan').value;

    if (!buktiFile) {
      showAlert('Bukti pembayaran wajib diupload', 'danger');
      return;
    }

    const submitBtn = formPembayaran.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengupload...';

    try {
      const buktiGambarNama = await uploadToTelegram(buktiFile);
      await addPembayaran(santriId, bulan, tahun, jumlah, tanggalBayar, buktiGambarNama, keterangan);
      showAlert('Pembayaran berhasil dicatat');
      modalPembayaran.classList.remove('active');
      loadPembayaran();
      loadDashboard();
    } catch (error) {
      showAlert(error.message, 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan';
    }
  });

  document.getElementById('btnFilterPembayaran').addEventListener('click', loadPembayaran);

  window.hapusPembayaran = async (id) => {
    if (!confirm('Yakin ingin menghapus data pembayaran ini?')) return;

    try {
      await deletePembayaran(id);
      showAlert('Pembayaran berhasil dihapus');
      loadPembayaran();
      loadDashboard();
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Load Pengeluaran
  async function loadPengeluaran() {
    try {
      const bulan = parseInt(document.getElementById('filterPengeluaranBulan').value);
      const tahun = parseInt(document.getElementById('filterPengeluaranTahun').value);
      const pengeluaranList = await getPengeluaran(bulan, tahun);
      const tbody = document.getElementById('tabelPengeluaran');

      if (pengeluaranList.length === 0) {
        showEmpty(tbody, 'Belum ada pengeluaran untuk bulan ini.');
        return;
      }

      tbody.innerHTML = pengeluaranList.map((p, i) => `
        <tr>
          <td data-label="No">${i + 1}</td>
          <td data-label="Kategori">${p.kategori}</td>
          <td data-label="Jumlah">${formatRupiah(p.jumlah)}</td>
          <td data-label="Tanggal">${formatDate(p.tanggal)}</td>
          <td data-label="Bukti">${p.bukti_gambar_nama ? `<button class="action-btn action-btn-view" onclick="lihatBukti('${p.bukti_gambar_nama}', '${p.kategori}')">&#128065;</button>` : '-'}</td>
          <td data-label="Keterangan">${p.keterangan || '-'}</td>
          <td data-label="Aksi">
            <div class="action-btns">
              <button class="action-btn action-btn-delete" onclick="hapusPengeluaran('${p.id}')" title="Hapus">&#128465;</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading pengeluaran:', error);
    }
  }

  // Modal Pengeluaran
  const modalPengeluaran = document.getElementById('modalPengeluaran');
  const formPengeluaran = document.getElementById('formPengeluaran');

  document.getElementById('btnTambahPengeluaran').addEventListener('click', () => {
    formPengeluaran.reset();
    document.getElementById('pengeluaranTanggal').valueAsDate = now;
    modalPengeluaran.classList.add('active');
  });

  document.getElementById('closeModalPengeluaran').addEventListener('click', () => {
    modalPengeluaran.classList.remove('active');
  });

  modalPengeluaran.addEventListener('click', (e) => {
    if (e.target === modalPengeluaran) modalPengeluaran.classList.remove('active');
  });

  formPengeluaran.addEventListener('submit', async (e) => {
    e.preventDefault();

    const kategori = document.getElementById('pengeluaranKategori').value;
    const jumlah = parseFloat(document.getElementById('pengeluaranJumlah').value);
    const tanggal = document.getElementById('pengeluaranTanggal').value;
    const buktiFile = document.getElementById('pengeluaranBukti').files[0];
    const keterangan = document.getElementById('pengeluaranKeterangan').value;

    if (!buktiFile) {
      showAlert('Bukti pengeluaran wajib diupload', 'danger');
      return;
    }

    const submitBtn = formPengeluaran.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengupload...';

    try {
      const buktiGambarNama = await uploadToTelegram(buktiFile);
      await addPengeluaran(kategori, jumlah, tanggal, buktiGambarNama, keterangan);
      showAlert('Pengeluaran berhasil dicatat');
      modalPengeluaran.classList.remove('active');
      loadPengeluaran();
      loadDashboard();
    } catch (error) {
      showAlert(error.message, 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan';
    }
  });

  document.getElementById('btnFilterPengeluaran').addEventListener('click', loadPengeluaran);

  window.hapusPengeluaran = async (id) => {
    if (!confirm('Yakin ingin menghapus data pengeluaran ini?')) return;

    try {
      await deletePengeluaran(id);
      showAlert('Pengeluaran berhasil dihapus');
      loadPengeluaran();
      loadDashboard();
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  };

  // Lihat Bukti
  window.lihatBukti = async (fileId, info) => {
    const modal = document.getElementById('modalBukti');
    const img = document.getElementById('buktiImage');
    const infoText = document.getElementById('buktiInfo');

    img.src = '';
    infoText.textContent = 'Memuat gambar...';
    modal.classList.add('active');

    try {
      const url = await getTelegramFileUrl(fileId);
      img.src = url;
      infoText.textContent = info;
    } catch (error) {
      infoText.textContent = 'Gagal memuat gambar: ' + error.message;
    }
  };

  document.getElementById('closeModalBukti').addEventListener('click', () => {
    document.getElementById('modalBukti').classList.remove('active');
  });

  document.getElementById('modalBukti').addEventListener('click', (e) => {
    if (e.target.id === 'modalBukti') document.getElementById('modalBukti').classList.remove('active');
  });

  // Laporan
  async function loadLaporan() {
    try {
      const bulan = parseInt(document.getElementById('laporanBulan').value);
      const tahun = parseInt(document.getElementById('laporanTahun').value);

      const [pembayaranList, pengeluaranList, santriList] = await Promise.all([
        getPembayaran(bulan, tahun),
        getPengeluaran(bulan, tahun),
        getSantri()
      ]);

      const totalPemasukan = pembayaranList.reduce((sum, p) => sum + parseFloat(p.jumlah), 0);
      const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + parseFloat(p.jumlah), 0);
      const sisaKas = totalPemasukan - totalPengeluaran;

      const pembayaranMap = {};
      pembayaranList.forEach(p => { pembayaranMap[p.santri_id] = true; });
      const belumBayar = santriList.filter(s => !pembayaranMap[s.id]);

      const content = document.getElementById('laporanContent');
      content.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card success">
            <div class="stat-label">Total Pemasukan</div>
            <div class="stat-value">${formatRupiah(totalPemasukan)}</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-label">Total Pengeluaran</div>
            <div class="stat-value">${formatRupiah(totalPengeluaran)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Sisa Kas</div>
            <div class="stat-value">${formatRupiah(sisaKas)}</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Belum Bayar</div>
            <div class="stat-value">${belumBayar.length} santri</div>
          </div>
        </div>

        <h4 style="margin: 1.5rem 0 0.75rem;">Detail Pemasukan (${namaBulan[bulan - 1]} ${tahun})</h4>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Nama</th><th>Jumlah</th><th>Tanggal</th></tr>
            </thead>
            <tbody>
              ${pembayaranList.map(p => `
                <tr>
                  <td>${p.santri?.nama || '-'}</td>
                  <td>${formatRupiah(p.jumlah)}</td>
                  <td>${formatDate(p.tanggal_bayar)}</td>
                </tr>
              `).join('')}
              ${pembayaranList.length === 0 ? '<tr><td colspan="3" class="empty-state">Tidak ada data</td></tr>' : ''}
            </tbody>
          </table>
        </div>

        <h4 style="margin: 1.5rem 0 0.75rem;">Detail Pengeluaran (${namaBulan[bulan - 1]} ${tahun})</h4>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Kategori</th><th>Jumlah</th><th>Tanggal</th><th>Keterangan</th></tr>
            </thead>
            <tbody>
              ${pengeluaranList.map(p => `
                <tr>
                  <td>${p.kategori}</td>
                  <td>${formatRupiah(p.jumlah)}</td>
                  <td>${formatDate(p.tanggal)}</td>
                  <td>${p.keterangan || '-'}</td>
                </tr>
              `).join('')}
              ${pengeluaranList.length === 0 ? '<tr><td colspan="4" class="empty-state">Tidak ada data</td></tr>' : ''}
            </tbody>
          </table>
        </div>

        ${belumBayar.length > 0 ? `
          <h4 style="margin: 1.5rem 0 0.75rem;">Santri Belum Bayar</h4>
          <div class="table-container">
            <table>
              <thead><tr><th>Nama</th><th>Keterangan</th></tr></thead>
              <tbody>
                ${belumBayar.map(s => `<tr><td>${s.nama}</td><td>${s.keterangan || '-'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      `;

      // Store data for export
      window._exportData = { pembayaranList, pengeluaranList, belumBayar };
    } catch (error) {
      console.error('Error loading laporan:', error);
    }
  }

  document.getElementById('btnTampilkanLaporan').addEventListener('click', loadLaporan);

  document.getElementById('exportPembayaran').addEventListener('click', () => {
    if (!window._exportData) {
      showAlert('Tampilkan laporan terlebih dahulu', 'warning');
      return;
    }

    const data = window._exportData.pembayaranList.map(p => ({
      nama: p.santri?.nama || '-',
      jumlah: p.jumlah,
      tanggal_bayar: p.tanggal_bayar,
      keterangan: p.keterangan || '',
    }));

    const bulan = document.getElementById('laporanBulan').value;
    const tahun = document.getElementById('laporanTahun').value;
    exportToCSV(data, `pembayaran_${namaBulan[bulan - 1]}_${tahun}.csv`);
  });

  document.getElementById('exportPengeluaran').addEventListener('click', () => {
    if (!window._exportData) {
      showAlert('Tampilkan laporan terlebih dahulu', 'warning');
      return;
    }

    const data = window._exportData.pengeluaranList.map(p => ({
      kategori: p.kategori,
      jumlah: p.jumlah,
      tanggal: p.tanggal,
      keterangan: p.keterangan || '',
    }));

    const bulan = document.getElementById('laporanBulan').value;
    const tahun = document.getElementById('laporanTahun').value;
    exportToCSV(data, `pengeluaran_${namaBulan[bulan - 1]}_${tahun}.csv`);
  });

  // Pengaturan
  document.getElementById('formPengaturan').addEventListener('submit', async (e) => {
    e.preventDefault();

    const namaOrganisasi = document.getElementById('settingNamaOrganisasi').value;
    const jumlahKas = parseFloat(document.getElementById('settingJumlahKas').value);

    try {
      await updateSetting(jumlahKas, namaOrganisasi);
      showAlert('Pengaturan berhasil disimpan');
      loadSettings();
    } catch (error) {
      showAlert(error.message, 'danger');
    }
  });

  // Logout
  document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  const mainNav = document.getElementById('mainNav');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('header')) {
        mainNav.classList.remove('open');
      }
    });
  }

  // Initial load
  loadSettings();
  loadDashboard();
  loadSantri();
  loadPembayaran();
  loadPengeluaran();
});
