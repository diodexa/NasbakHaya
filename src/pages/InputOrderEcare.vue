
<template>
  <Loading :show="isSubmitting" />
  <div class="OrderDiv">
    <!-- HEADER -->
    <header class="hero-header">
      <h1> Nasi <span>Bakar</span> Haya </h1>
    
      <div class="header-line"></div>
      <DateTime class="date-time" />
      <p class="header-subtitle">Harga Hemat Rasa Nikmat</p>
    </header>

    <!-- NAMA -->
    <section class="name-section">
      <label for="nama"><i class="fa-solid fa-user"></i> Nama kamu</label>
      <input id="nama" v-model="nama" type="text" placeholder="Masukkan nama..." class="InputNama" :disabled="isSubmitting" />
    </section>

    <!-- MENU -->
    <section class="menu-section">
      <div class="menu-header">
        <div class="menu-title">
          <div>
            <h2>Pilih Menu</h2>

          </div>
        </div>
      </div>
      <div class="ButtonMenu">
        <button v-for="item in menus" :key="item.menu" @click="addOrder(item.menu)" :disabled="!isMenuActive(item.menu) || isSubmitting" class="menu-button" :style="{ backgroundImage: `url('${item.gambar}')` }">
          <div class="menu-overlay"></div>
          <span v-if="!isMenuActive(item.menu)" class="overlay-text">HABIS</span>
          <span class="menu-name">{{ item.menu }}</span>
        </button>
      </div>
    </section>

    <!-- FLOATING BUTTON -->
    <div class="floating-actions">
      <button @click="showQris = true" class="floating-button qris-button">
        <i class="fa-solid fa-qrcode"></i>
        <span class="floating-label">QR Pembayaran</span>
      </button>
      <button @click="showModalList = true" class="floating-button list-button">
        <i class="fa-solid fa-clipboard-list"></i>
        <span class="floating-label">Order List</span>
      </button>
    </div>

    <!-- ORDER LIST -->
    <Modal :show="showModalList" @close="showModalList = false">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <span class="modal-icon"><i class="fa-solid fa-clipboard-list"></i></span>
            <div>
              <h2>List Pesanan</h2>
              <p>Pesanan hari ini</p>
            </div>
          </div>
        </div>
        <div v-if="MalamOrders.length > 0" class="table-wrapper">
          <table class="TabelOrder">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Menu</th>
                <th>Notes</th>
                <th>Action</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in sortedMalamOrders" :key="order.id">
                <td><strong>{{ order.nama }}</strong></td>
                <td><span class="menu-badge">{{ order.menu }}</span></td>
                <td>
                  <input v-if="order.isEditing" v-model="order.notes" class="notes-input" />
                  <span v-else>{{ order.notes || '-' }}</span>
                </td>
                <td>
                  <button v-if="!order.isEditing" @click="order.isEditing = true" class="icon-btn edit-btn"><i class="fa-solid fa-pen"></i></button>
                  <button v-if="order.isEditing" @click="saveOrder(order)" class="save-btn"><i class="fa-solid fa-check"></i></button>
                </td>
                <td><small>{{ order.createdAt }}</small></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-order">
          <i class="fa-solid fa-receipt"></i>
          <h3>Belum ada pesanan</h3>
          <p>Pesanan yang masuk akan muncul di sini.</p>
        </div>
      </div>
    </Modal>

    <!-- THANK YOU -->
    <Modal :show="showThanksModal" @close="showThanksModal = false">
      <div class="thanks-modal">
        <div class="thanks-image"><img :src="gifUrl" /></div>
        <div class="success-icon"><i class="fa-solid fa-check"></i></div>
        <h2>Pesanan diterima!</h2>
        <p class="thanks-name">Terima kasih sudah memesan, <strong>{{ lastNama }}</strong> ❤️</p>
        <div class="payment-info">
          <i class="fa-solid fa-circle-info"></i>
          <p>Jangan lupa melakukan pembayaran dan cek pesanan kamu melalui tombol di kanan bawah.</p>
        </div>
        <button class="thanks-button" @click="showThanksModal = false">Oke, siap!</button>
      </div>
    </Modal>

    <!-- QRIS -->
    <Modal :show="showQris" @close="showQris = false">
      <div class="qris-modal">
        <div class="qris-title">
          <span class="modal-icon"><i class="fa-solid fa-qrcode"></i></span>
          <div>
            <h2>QR Pembayaran</h2>
            <p>Scan untuk melakukan pembayaran</p>
          </div>
        </div>
        <div class="qris-image"><img src="/qrisHaya.png" /></div>
        <div class="qris-info">
          <i class="fa-solid fa-camera"></i>
          <p>Setelah pembayaran, japri bukti pembayarannya ya </p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import DateTime from '../components/DateTime.vue'
import { sendOrderToSheet, fetchTodayOrders, fetchMenuControl } from "../services/orderService"
import Loading from '../components/Loading.vue'
import Modal from '../components/Modal.vue'

const nama = ref("")
const orders = ref([])
const menuStatus = ref([])
const menus = ref([])
const isSubmitting = ref(false)
const showModalList = ref(false)
const showThanksModal = ref(false)
const showQris = ref(false)
const lastNama = ref("")
const gifUrl = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3Rhd2l1bDZobXZjdDhqdmRhNjJ2bHJrZ3cxcnNhcjdhejFmdXZnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fREdWLtU5vTgjudo3I/giphy.gif"

const MalamOrders = computed(() => {
    return orders.value.filter(order => {
      if (!order.createdAt) return false
  
      const [h = 0, m = 0] = (order.createdAt || "0:0").split(":").map(Number)
      const totalMinutes = h * 60 + m
      
      const start = 14 * 60    
      const end = 23 * 60 + 59  
  
      const malam = totalMinutes >= start && totalMinutes <= end
      const isEcare = order.nama?.toLowerCase().startsWith("ecare - ")
  
      return malam && isEcare
    })
  })
  
  
  onMounted(async () => {
    try {
      isSubmitting.value = true
      
      // 1 load menu status dulu
      menuStatus.value = await fetchMenuControl()
      menus.value = menuStatus.value
      
      
      // 2️ load orders
      const data = await fetchTodayOrders()
      orders.value = data.map(order => ({
        ...order,
        isEditing: false
      }))
      
    } catch (err) {
      console.error("Gagal fetch:", err)
    } finally {
      isSubmitting.value = false
    }
  })
  
  
  // =================urutan tabel ==============
  // const sortedOrders = computed(() => {
    //   return [...orders.value].sort((a, b) => {
      //     const toMinutes = (time) => {
        //       if (!time) return 0
        //       const [h, m] = time.split(":").map(Number)
        //       return h * 60 + m
        //     }
  
  //     return toMinutes(b.createdAt) - toMinutes(a.createdAt)
  //   })
  // })
  
  const sortedMalamOrders = computed(() => {
    return [...MalamOrders.value].sort((a, b) => {
      const toMinutes = (time) => {
        if (!time) return 0
        const [h = 0, m = 0] = time.split(":").map(Number)
        return h * 60 + m
      }
  
      return toMinutes(b.createdAt) - toMinutes(a.createdAt)
    })
  })
  
  const addOrder = async (menu) => {
    const targetNama = "ecare - "+ nama.value
    const targetMenu = menu
    const targetTime = new Date().toTimeString().slice(0,5)
  
    if (isSubmitting.value) return 
  
    if (!nama.value.trim()) {
      alert("Nama harus diisi dulu!")
      return
    }
  
      try {
          isSubmitting.value = true
  
          await sendOrderToSheet({
              nama: targetNama,
              menu: targetMenu,
              notes: "",
              createdAt: targetTime,
              isEditing: false
          })
  
          const fetchWithRetry = async (retry = 3) => {
  
            for (let i = 0; i < retry; i++) {
              const data = await fetchTodayOrders()
  
              const found = data.find(o =>
                o.nama === targetNama &&
                o.createdAt === targetTime &&
                o.menu === targetMenu
              )
  
              if (found) return data
  
              await new Promise(r => setTimeout(r, 300))
            }
  
            return await fetchTodayOrders()
          }
          const data = await fetchWithRetry()
  
          orders.value = data.map(order => ({
            ...order,
            isEditing: false
          }))
  
  
  
      } catch (err) {
      console.error("Gagal kirim:", err)
      alert("Maaf ada kesalahan sistem, silakan input ulang ya :) ")
      } finally {
      isSubmitting.value = false
      }
      lastNama.value = nama.value
      nama.value = ""
      showThanksModal.value = true
  
  }

const saveOrder = async (order) => {
  order.isEditing = false
  await sendOrderToSheet({
    action: "update",
    id: order.id,
    nama: order.nama,
    menu: order.menu,
    notes: order.notes,
    status: order.status
  })
  const data = await fetchTodayOrders()
  orders.value = data.map(order => ({ ...order, isEditing: false }))
}

const isMenuActive = (menu) => {
  const found = menuStatus.value.find(m => m.menu === menu)
  return found ? found.aktif : true
}
</script>

<style scoped>
.OrderDiv {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 100vh;
  margin: 0;
  padding-bottom: 110px;
  box-sizing: border-box;
  overflow-x: hidden;
  outline: 5px solid red;
}
.hero-header {
  text-align: center;
  padding: 30px 20px 20px;
}

.hero-header h1 {
  margin: 0;
  font-family: "RiceBall";
  font-weight:900;
  letter-spacing: -2px;
  font-size: clamp(2rem, 7vw, 4rem);
  line-height: 1;
  color: #641919;
  text-shadow: 2px 2px 0 #fff, 3px 3px 0 rgba(0,0,0,.08);
}
.hero-header h1 span {
  color: #f48b29;
}
.header-line {
  width: 250px;
  height: 3px;
  margin: 12px auto 8px;
  border-radius: 10px;
  background: #f48b29;
}
.date-time {
  font-size: .9rem;
  color: #7d4b32;
}
.header-subtitle {
  font-size: .85rem;
  color: #695448;
  font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.name-section {
  padding: 5px 18px 18px;
  display: flex;
  flex-direction: column;
}
.name-section label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
  font-size: .9rem;
  font-weight: 700;
  color: #f48b29;
  
}
.name-section label i {
  color: #f48b29;
}
.InputNama {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 17px;
  border: 2px solid #f1d3b0;
  border-radius: 14px;
  background: rgba(255,255,255,.85);
  color: #4d1717;
  font-size: 1rem;
  outline: none;
  transition: .2s ease;
  box-shadow: 0 4px 15px rgba(80,40,10,.05);
}
.InputNama:focus {
  border-color: #f48b29;
  box-shadow: 0 0 0 4px rgba(244,139,41,.12);
}
.InputNama::placeholder {
  color: #b39a88;
}
.menu-section {
  padding: 0 14px;
}
.menu-header {
  padding: 5px 5px 13px;
}
.menu-title {
  display: flex;
  align-items: center;
  gap: 10px;
  
}
.menu-title h2 {
  margin: 0;
  font-family: "RiceBall";
  font-size: 1.5rem;
  color: #f48b29;
}
.menu-title p {
  margin: 2px 0 0;
  font-size: .75rem;
  color: #a08878;
}
.ButtonMenu {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
}
.menu-button {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  min-height: 175px;
  flex: 1 1 calc(30% - 8px);
  padding: 18px;
  overflow: hidden;
  border: none;
  border-radius: 18px;
  background-size: 80%;
  background-position: center;
  background-repeat: no-repeat;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(60,30,10,.16);
  transition: transform .2s ease, box-shadow .2s ease;
}

.menu-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 11px 25px rgba(60,30,10,.22);
}
.menu-button:not(:disabled):active {
  transform: scale(.97);
}
.menu-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(35,10,5,.78), rgba(35,10,5,.08));
}
.menu-name {
  position: relative;
  z-index: 2;
  font-size: 1rem;
  line-height: 1;
  text-align: left;
  text-shadow: 0 2px 5px rgba(0,0,0,.5);
}
.menu-arrow {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 3;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,.9);
  color: #8a3518;
  font-size: .8rem;
}
.menu-button:disabled {
  cursor: not-allowed;
  filter: grayscale(1);
}
.overlay-text {
  position: absolute;
  z-index: 5;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-12deg);
  padding: 7px 20px;
  border: 3px solid #fff;
  border-radius: 7px;
  background: rgba(180,20,20,.85);
  color: #fff;
  font-size: clamp(1.3rem, 8vw, 2.5rem);
  font-weight: 900;
  letter-spacing: 3px;
}
.floating-actions {
  position: fixed;
  right: 16px;
  bottom: 20px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.floating-button {
  position: relative;
  width: 58px;
  height: 58px;
  border: 4px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,.22);
  transition: transform .2s ease;
}
.floating-button:hover {
  transform: scale(1.08);
}
.floating-button i {
  font-size: 1.35rem;
}
.qris-button {
  background: #f48b29;
}
.list-button {
  background: #641919;
}
.floating-label {
  position: absolute;
  right: 68px;
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 7px;
  background: #241313;
  color: #fff;
  font-size: .7rem;
  opacity: 0;
  transform: translateX(8px);
  pointer-events: none;
  transition: .2s ease;
}
.floating-button:hover .floating-label {
  opacity: 1;
  transform: translateX(0);
}
.modal-header {
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.modal-header > div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff0dc;
  color: #e8781a;
}
.modal-header h2,
.qris-title h2 {
  margin: 0;
  color: #641919;
}
.modal-header p,
.qris-title p {
  margin: 3px 0 0;
  color: #999;
  font-size: .75rem;
}
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-top: 15px;
}
.TabelOrder {
  max-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #eee;
  border-radius: 10px;
  font-size: .75rem;
}
.TabelOrder th {
  padding: 10px 8px;
  background: #641919;
  color: #fff;
}
.TabelOrder td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #eee;

}
.TabelOrder tr:last-child td {
  border-bottom: none;
}
.menu-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 20px;
  background: #fff0dc;
  color: #a64d16;
  font-weight: 700;
}
.notes-input {
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.icon-btn,
.save-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.edit-btn {
  background: #fff0dc;
  color: #d16d19;
}
.save-btn {
  background: #641919;
  color: #fff;
}
.empty-order {
  text-align: center;
  padding: 40px 20px;
  color: #a58e80;
}
.empty-order i {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #e7cbb1;
}
.empty-order h3 {
  margin: 0 0 5px;
  color: #641919;
}
.empty-order p {
  margin: 0;
  font-size: .8rem;
}
.thanks-modal {
  text-align: center;
  padding: 5px 10px 10px;
}
.thanks-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 5px;
  border-radius: 50%;
  overflow: hidden;
}
.thanks-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.success-icon {
  width: 48px;
  height: 48px;
  margin: -5px auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e9f8ed;
  color: #2d9a4b;
}
.thanks-modal h2 {
  margin: 5px 0;
  color: #641919;
  font-size: 1.7rem;
}
.thanks-name {
  color: #765c4d;
  line-height: 1.5;
}
.thanks-name strong {
  color: #e8781a;
}
.payment-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 15px;
  padding: 12px;
  text-align: left;
  border-radius: 12px;
  background: #fff6e9;
  color: #79543d;
}
.payment-info i {
  color: #e8781a;
  margin-top: 3px;
}
.payment-info p {
  margin: 0;
  font-size: .8rem;
  line-height: 1.5;
}
.thanks-button {
  width: 100%;
  margin-top: 18px;
  padding: 13px;
  border: none;
  border-radius: 12px;
  background: #641919;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.qris-modal {
  text-align: center;
}
.qris-title {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  margin-bottom: 18px;
}
.qris-image {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 15px;
  background: #fff;
}
.qris-image img {
  display: block;
  width: 100%;
  max-width: 350px;
  margin: auto;
}
.qris-info {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
  padding: 12px;
  border-radius: 10px;
  background: #fff6e9;
  color: #79543d;
  text-align: left;
}
.qris-info i {
  color: #f48b29;
}
.qris-info p {
  margin: 0;
  font-size: .8rem;
}


@media (max-width: 600px) {
  .hero-header {
    padding-top: 25px;
  }
  

  .menu-button {
  flex: 1 1 calc(50% - 6px);
  }


  .floating-button {
    width: 55px;
    height: 55px;
  }
  .floating-label {
    display: none;
  }

  .menu-badge {
    font-size: 8px;
    padding: 2px 5px;
  }

   .table-wrapper td:nth-child(5) {
    display: none;
  }

  .table-wrapper th:nth-child(5) {
    display: none;
  }

}

</style>




  