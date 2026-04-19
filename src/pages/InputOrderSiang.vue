<template>
    <Loading :show="isSubmitting"/>
    <div class="OrderDiv">
        <h1>Nasi <span style="color: #F48B29;">Bakar</span> Haya</h1>
        <DateTime style="font-family: fantasy; mix-blend-mode: difference; filter: invert(1);"> </DateTime>
        <input v-model="nama" type="text" placeholder="Isi Dulu Nama Kamu...." class="InputNama"> 
        <div class="ButtonMenu">
            <button v-for="item in menus" :key="item.menu" @click="addOrder(item.menu)" :disabled="!isMenuActive(item.menu) || isSubmitting" class="menu-button" :style="{backgroundImage: `url('${item.gambar}')`}" >
                <span v-if="!isMenuActive(item.menu)" class="overlay-text">HABIS</span>
        
                {{ item.menu }} 
            </button>
        </div>

        <button @click="showModalList = true" class="buttonList" >
          <span class="icon-list"> 
            <i class="fa-solid fa-clipboard-list" style="font-size: 2rem;"></i>
          </span>
          <label class="Label">Order List</label>
        </button>
        <Modal :show="showModalList" @close="showModalList = false">
          <h2>List Pesanan</h2>
          <table v-if="MalamOrders.length > 0" class="TabelOrder">
              <thead>
                  <tr>
                      <th>Nama</th>
                      <th>Menu</th>
                      <th>Notes</th>
                      <th>Action</th>
                      <th>Created</th>
                      <!-- <th>Updated</th> -->
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="(order, index) in sortedMalamOrders" :key="order.id">
                      <td style="display:none">{{ order.id }}</td>
  
                      <td>{{ order.nama }}</td>
                      
  
                      <!-- MENU -->
                      <td>
                      <!-- <div v-if="order.isEditing">
                          <select v-model="order.menu">
                          <option v-for="menu in menus" :key="menu" :value="menu">
                              {{ menu }}
                          </option>
                          </select>
                      </div> -->
                      <div >
                          {{ order.menu }}
                      </div>
                      </td>
  
                      <!-- NOTES -->
                      <td>
                      <div v-if="order.isEditing">
                          <input v-model="order.notes" />
                      </div>
                      <div v-else>
                          {{ order.notes || '-' }}
                      </div>
                      </td>
                      <td>   
                          <button v-if="!order.isEditing" @click="order.isEditing = true" class="icon-btn">
                              <i class="fa-solid fa-pen " ></i>
                          </button>
                          <button v-if="order.isEditing" @click="saveOrder(order)">
                              Save
                          </button>
  <!-- 
                          <button @click="deleteOrder(index)">
                              Hapus
                          </button> -->
                      </td>
                      <td>{{ order.createdAt }}</td>
                      <!-- <td>{{ order.updatedAt }}</td> -->
                  </tr>
              </tbody>
          </table>
        </Modal>

        
        <Modal :show="showThanksModal" @close="showThanksModal = false">
          <div class="thanks-modal">
            <img :src="gifUrl" />
            <p style="font-size: 2rem;">Terima kasih sudah memesan <strong>{{ lastNama }}</strong></p>
            <strong style="font-size: 1.5rem; color: maroon;">Pembayaran dan cek pesanan di tombol kanan bawah ya </strong>
          </div>
        </Modal>

        <button @click="showQris = true" class="Qris-modal" >
          <i class="fa-solid fa-qrcode" style="font-size: 2rem;"></i>
          <label class="Label">QR Pembayaran</label>
        </button>

        <Modal :show="showQris" @close="showQris = false">
          <div class="thanks-modal">
            <img src="/qrisHaya.png" />
            <p style="font-size: 2rem;">Japri untuk bukti bayarnya ya</p>
          </div>
        </Modal>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DateTime from '../components/DateTime.vue'
import { 
  sendOrderToSheet,
  fetchTodayOrders,
  fetchMenuControl
} from "../services/orderService"
import Loading from '../components/Loading.vue'
import Modal from '../components/Modal.vue'

const nama = ref("")
const orders = ref([])
const menuStatus = ref([])
const menus = ref([])
const isSubmitting = ref(false)
const isClosing = ref(false)
const showModalList = ref(false)
const showThanksModal = ref(false)
const showQris = ref(false)
const lastNama = ref("")
const gifUrl = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3Rhd2l1bDZobXZjdDhqdmRhNjJ2bHJrZ3cxcnNhcjdhejFmdXZnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fREdWLtU5vTgjudo3I/giphy.gif"


/* ================= Malam ================= */

const MalamOrders = computed(() => {
  return orders.value.filter(order => {
    if (!order.createdAt) return false

    const [h = 0, m = 0] = (order.createdAt || "0:0").split(":").map(Number)
    const totalMinutes = h * 60 + m

    const start = 1 * 60    
    const end = 12 * 60 + 59  

    const malam = totalMinutes >= start && totalMinutes <= end
    const isNotEcare = !order.nama?.toLowerCase().includes("ecare -")

    return malam && isNotEcare
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
console.log(menus.value)

console.log(showQris)

watch(showThanksModal, (val) => {
if (val) {
  setTimeout(() => {
    showThanksModal.value = false
  }, 2000)
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

/* ================= ADD ORDER ================= */

const addOrder = async (menu) => {
  const targetNama = nama.value
  const targetMenu = menu
  const targetTime = new Date().toTimeString().slice(0,5)

  if (!nama.value) {
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
    alert("Maaf ada kesalahan, silakan input ulang ya :) ")
    } finally {
    isSubmitting.value = false
    }
    lastNama.value = nama.value
    nama.value = ""
    showThanksModal.value = true


}

/* ================= SAVE NOTES ================= */

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
  orders.value = data.map(order => ({
    ...order, isEditing: false
  }))
}

/* ================= CHECK MENU ACTIVE ================= */

const isMenuActive = (menu) => {
  const found = menuStatus.value.find(m => m.menu === menu)
  return found ? found.aktif : true
}

// ============ Animasi  ==========================

const handleClose = () => {
  isClosing.value = true

  setTimeout(() => {
    showModal.value = false
    isClosing.value = false
  }, 300);
}
</script>

<style scoped>
.OrderDiv {
    display: flex;
    flex-direction: column;
}

.OrderDiv h1 {
  text-shadow: 
    -3px -3px 0 white,
     3px -3px 0 white,
    -3px  3px 0 white,
     3px  3px 0 white;
}
.InputNama {
    font-size: 2rem;
    text-align: center;
    border-radius: 10px;
}
.ButtonMenu {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 8px 14px;
}

.TabelOrder {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background: white;
  overflow-y: auto;
}

.TabelOrder th,
.TabelOrder td {
  border: 1px solid #000;
  padding: 8px;
  text-align: center;
}



.menu-button {
    display: flex;
    flex-wrap: wrap;
    position: relative;
    padding: 2rem 14px;
    justify-content: center;
    align-items: center;
    color: maroon;
    flex: 1 1 45%; 
    font-weight: 900;
    font-size: 2rem;
    font-family: fantasy;
    background-size: cover;
    background-position: center; 
    text-shadow: 
    -1px -1px 0 white,
     1px -1px 0 white,
    -1px  1px 0 white,
     1px  1px 0 white;

}

.menu-button:disabled {
  cursor: not-allowed;
  filter:grayscale();
}



.overlay-text {
    position: absolute;
    font-weight: bold;
    color: red;
    z-index: 2;
    font-weight: 500;
    font-size: clamp(4rem, 9vw, 4rem);
}

.buttonList,
.Qris-modal {
  position: fixed;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f42929;
  border: rgb(142, 142, 142) 5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transform: scale(1.5);
  animation: heartpump 2s infinite;
  color: white;
}

.buttonList {
  bottom: 20px;
}

.Qris-modal {
  bottom: 120px;
}



.modal.closing {
  transform: translate(150%, 150%) scale(0.2);
  opacity: 0;
}

.buttonList .Label,
.Qris-modal .Label {
  position: absolute;
  bottom: 50px; 
  background: black;
  color: white;
  padding: 5px 10px;
  text-wrap-mode: nowrap;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: 0.2s ease;
  pointer-events: none;
}

.Qris-modal .Label {
  right: -20px;
}

.buttonList:hover .Label,
.Qris-modal:hover .Label
 {
  opacity: 1;
  transform: translateY(0);
}




@media (max-width: 600px) {
  /* .menu-button {
    padding: 8px 14px;
    flex: 1 1 45%; 
} */



th,td {
    word-break: break-all;
}

.TabelOrder input {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 6px;
}

.thanks-modal {
  text-align: center;
  padding: 20px;
}



}

@keyframes heartpump {
  0%, 100% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.2);
  }
  60% {
    transform: scale(1);
  }
}



</style>