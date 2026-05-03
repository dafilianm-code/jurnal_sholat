window.onload = () => {
    cekUser();
    tampilkanData('hari');
};

function cekUser() {
    let nama = localStorage.getItem('username');
    if (!nama) {
        nama = prompt("Siapa nama kamu?");
        if (nama) {
            localStorage.setItem('username', nama);
        } else {
            nama = "Hamba Allah";
        }
    }
    document.getElementById("displayNama").innerText = nama;
}

function gantiNama() {
    let namaBaru = prompt("Masukkan nama baru:");
    if (namaBaru) {
        localStorage.setItem('username', namaBaru);
        document.getElementById("displayNama").innerText = namaBaru;
        tampilkanData('hari'); // Refresh tampilan
    }
}

function tambahJurnal() {
    const waktuSholat = document.getElementById("waktu Sholat").value;
    const lokasi = document.getElementById("lokasi").value;
    const namaUser = localStorage.getItem('username') || "Tamu";
    const sekarang = new Date();
    
    const dataBaru = {
        id: Date.now(),
        nama: namaUser, // Menyimpan nama user di setiap baris data
        tanggal: sekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
        rawDate: sekarang.toISOString(),
        waktuSholat: waktuSholat,
        lokasi: lokasi
    };

    let listJurnal = JSON.parse(localStorage.getItem('jurnalSholat')) || [];
    listJurnal.push(dataBaru);
    localStorage.setItem('jurnalSholat', JSON.stringify(listJurnal));
    
    alert(`Data ${waktuSholat} untuk ${namaUser} berhasil disimpan!`);
    tampilkanData('hari');
}

function tampilkanData(mode) {
    // Ganti bagian looping di fungsi tampilkanData(mode) menjadi:
tabelBody.innerHTML = "";
listJurnal.reverse().forEach(item => {
    const row = tabelBody.insertRow();
    row.innerHTML = `
        <td style="width: 60%">
            <div style="font-weight: 600; color: #333;">${item.waktuSholat}</div>
            <div style="font-size: 11px; color: #888;">${item.tanggal}</div>
        </td>
        <td style="text-align: right; color: var(--primary); font-weight: 500;">
            ${item.lokasi}
        </td>
    `;
});


    const tabelBody = document.getElementById("tabelBody");
    let listJurnal = JSON.parse(localStorage.getItem('jurnalSholat')) || [];
    const sekarang = new Date();

    // Logika Filter
    if (mode === 'hari') {
        const hariIni = sekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
        listJurnal = listJurnal.filter(item => item.tanggal === hariIni);
    } else if (mode === 'minggu') {
        const tujuhHariLalu = new Date();
        tujuhHariLalu.setDate(sekarang.getDate() - 7);
        listJurnal = listJurnal.filter(item => new Date(item.rawDate) >= tujuhHariLalu);
    }

    tabelBody.innerHTML = "";
    listJurnal.reverse().forEach(item => {
        const row = tabelBody.insertRow();
        // Menampilkan nama di dalam tabel jika melihat laporan mingguan
        row.insertCell(0).innerHTML = `<b>${item.nama}</b><br><small>${item.tanggal}</small>`;
        row.insertCell(1).innerHTML = item.waktuSholat;
        row.insertCell(2).innerHTML = item.lokasi;
    });
}

function hapusSemua() {
    if(confirm("Hapus semua catatan?")) {
        localStorage.removeItem('jurnalSholat');
        tampilkanData('hari');
    }
}
// Ganti dengan API URL milikmu dari SheetDB
const API_URL = "https://sheetdb.io/api/v1/38d9xtdt0nram";

function tambahJurnal() {
    const waktuSholat = document.getElementById("waktu Sholat").value;
    const lokasi = document.getElementById("lokasi").value;
    const namaUser = localStorage.getItem('username') || "Tamu";
    const sekarang = new Date();
    
    const dataBaru = {
        id: Date.now(),
        nama: namaUser,
        tanggal: sekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
        waktuSholat: waktuSholat,
        lokasi: lokasi
    };

    // 1. Simpan ke LocalStorage (sebagai backup di HP)
    let listJurnal = JSON.parse(localStorage.getItem('jurnalSholat')) || [];
    listJurnal.push(dataBaru);
    localStorage.setItem('jurnalSholat', JSON.stringify(listJurnal));

    // 2. Kirim ke Google Sheets (Excel)
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: [dataBaru]
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Berhasil tersimpan ke Excel:', data);
        alert("Data berhasil masuk ke Jurnal & Excel!");
        tampilkanData('hari');
    })
    .catch(error => {
        console.error('Gagal kirim ke Excel:', error);
        alert("Tersimpan di HP, tapi gagal kirim ke Excel (Cek internet)");
    });
}
