// 1. Masukkan API URL SheetDB kamu di sini
const API_URL = "https://sheetdb.io/api/v1/38d9xtdt0nram"; 

// 2. Fungsi yang berjalan otomatis saat halaman dibuka
window.onload = () => {
    cekUser();
    tampilkanData('hari'); // Menampilkan data hari ini saat mulai
};

function cekUser() {
    let nama = localStorage.getItem('username');
    if (!nama) {
        nama = prompt("Siapa nama kamu?");
        localStorage.setItem('username', nama || "Hamba Allah");
    }
    const displayNama = document.getElementById("displayNama");
    if (displayNama) displayNama.innerText = nama || "Hamba Allah";
}

function gantiNama() {
    let namaBaru = prompt("Masukkan nama baru:");
    if (namaBaru) {
        localStorage.setItem('username', namaBaru);
        location.reload(); // Refresh halaman agar nama terupdate di semua tempat
    }
}

function tambahJurnal() {
    // Pastikan ID di HTML sama persis: "waktuSholat" dan "lokasi"
    const elWaktu = document.getElementById("waktuSholat");
    const elLokasi = document.getElementById("lokasi");

    if (!elWaktu || !elLokasi) {
        alert("Error: Elemen input tidak ditemukan di HTML!");
        return;
    }

    const waktuSholat = elWaktu.value;
    const lokasi = elLokasi.value;
    const namaUser = localStorage.getItem('username') || "Tamu";
    const sekarang = new Date();
    
    const dataBaru = {
        id: Date.now(),
        nama: namaUser,
        tanggal: "'" + sekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
        waktuSholat: waktuSholat,
        lokasi: lokasi,
        rawDate: sekarang.toISOString()
    };

    // Simpan ke LocalStorage
    let listJurnal = JSON.parse(localStorage.getItem('jurnalSholat')) || [];
    listJurnal.push(dataBaru);
    localStorage.setItem('jurnalSholat', JSON.stringify(listJurnal));

    // Kirim ke Google Sheets
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [dataBaru] })
    }).then(() => console.log("Berhasil ke Sheets"));

    alert("Alhamdulillah, sudah dicatat!");
    tampilkanData('hari');
}

function tampilkanData(mode) {
    const tabelBody = document.getElementById("tabelBody");
    if (!tabelBody) return; // Mencegah error jika tabel belum ada

    let listJurnal = JSON.parse(localStorage.getItem('jurnalSholat')) || [];
    const sekarang = new Date();

    // Filter Data
    if (mode === 'hari') {
        const hariIni = sekarang.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
        listJurnal = listJurnal.filter(item => item.tanggal.replace("'", "") === hariIni);
    } else if (mode === 'minggu') {
        const tujuhHariLalu = new Date();
        tujuhHariLalu.setDate(sekarang.getDate() - 7);
        listJurnal = listJurnal.filter(item => new Date(item.rawDate) >= tujuhHariLalu);
    }

    // Update Statistik
    const totalMasjid = listJurnal.filter(item => item.lokasi.includes("Masjid")).length;
    if(document.getElementById("totalSholat")) document.getElementById("totalSholat").innerText = listJurnal.length;
    if(document.getElementById("totalMasjid")) document.getElementById("totalMasjid").innerText = totalMasjid;

    // Render Tabel
    tabelBody.innerHTML = "";
    listJurnal.reverse().forEach(item => {
        const row = tabelBody.insertRow();
        row.innerHTML = `
            <td style="width: 60%">
                <div style="font-weight: 600; color: #333;">${item.waktuSholat}</div>
                <div style="font-size: 11px; color: #888;">${item.tanggal.replace("'", "")}</div>
            </td>
            <td style="text-align: right; color: #1b5e20; font-weight: 500;">
                ${item.lokasi}
            </td>
        `;
    });
}

function hapusSemua() {
    if(confirm("Hapus semua catatan?")) {
        localStorage.removeItem('jurnalSholat');
        tampilkanData('hari');
    }
}
