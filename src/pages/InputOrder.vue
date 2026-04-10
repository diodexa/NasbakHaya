<template>
    <Loading :show="isSubmitting"/>
    <div class="OrderDiv">
        <h1>Nasi <span style="color: #F48B29;">Bakar</span> Haya</h1>
        <DateTime/>
        <input v-model="nama" type="text" placeholder="Isi Nama Kamu" class="InputNama"> 
        <div class="ButtonMenu">
            <button v-for="item in menus" :key="item.menu" @click="addOrder(item.menu)" :disabled="!isMenuActive(item.menu)" class="menu-button" :style="{backgroundImage: `url('${item.gambar}')`,backgroundSize: 'cover',backgroundPosition: 'center'}" >
                <span v-if="isSubmitting" class="mini-spinner"></span>
                <span v-if="!isMenuActive(item.menu)" class="overlay-text">Habis</span>
        
                {{ item.menu }} 
            </button>
        </div>

        <button @click="showModalList = true" class="buttonList" >
          <span class="icon-list"></span>
          <label class="Label">ListMenu</label>
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

        <Modal :show="showConfirmModal" @close="showConfirmModal = false">
          <h2>Konfirmasi Pesanan</h2>
          <p>Pesan <strong>{{ selectedMenu }}</strong>?</p>

          <div class="confirm-actions">
            <button @click="confirmOrder">Ya</button>
            <button @click="showConfirmModal = false">Batal</button>
          </div>
        </Modal>   

        <Modal :show="showThanksModal" @close="showThanksModal = false">
          <div class="thanks-modal">
            <img :src="gifUrl" />
            <p style="font-size: 2rem;">Terima kasih sudah memesan <strong>{{ lastNama }}</strong></p>
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
import Modal from '../components/ModalListOrder.vue'

const nama = ref("")
const orders = ref([])
const menuStatus = ref([])
const menus = ref([])
const isSubmitting = ref(false)
const showModalList = ref(false)
const isClosing = ref(false)
const showThanksModal = ref(false)
const lastNama = ref("")
const gifUrl = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3Rhd2l1bDZobXZjdDhqdmRhNjJ2bHJrZ3cxcnNhcjdhejFmdXZnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fREdWLtU5vTgjudo3I/giphy.gif"


/* ================= Malam ================= */

const MalamOrders = computed(() => {
  return orders.value.filter(order => {
    if (!order.createdAt) return false

    const [h, m] = order.createdAt.split(":").map(Number)
    const totalMinutes = h * 60 + m

    const start = 14 * 60    
    const end = 23 * 60 + 59  

    return totalMinutes >= start && totalMinutes <= end
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
      const [h, m] = time.split(":").map(Number)
      return h * 60 + m
    }

    return toMinutes(b.createdAt) - toMinutes(a.createdAt)
  })
})

/* ================= ADD ORDER ================= */

const addOrder = async (menu) => {

  if (!nama.value) {
    alert("Nama harus diisi dulu!")
    return
  }

    try {
        isSubmitting.value = true

        await sendOrderToSheet({
            nama: nama.value,
            menu,
            notes: ""
        })

        const data = await fetchTodayOrders()
        orders.value = data.map(order => ({
            ...order,isEditing: false
        }))

    } catch (err) {
    console.error("Gagal kirim:", err)
    } finally {
    isSubmitting.value = false
    }
    lastNama.value = nama.value
    nama.value = ""
    showThanksModal.value = true

  watch(showThanksModal, (val) => {
  if (val) {
    setTimeout(() => {
      showThanksModal.value = false
    }, 2000)
  }
})

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
.InputNama {
    font-size: 2rem;
    text-align: center;
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
    padding: 5rem 14px;
    justify-content: center;
    align-items: center;
    color: maroon;
    flex: 1 1 45%; 
    font-weight: 900;
    font-size: 2rem;
    text-shadow: 
    -1px -1px 0 white,
     1px -1px 0 white,
    -1px  1px 0 white,
     1px  1px 0 white;
}

.menu-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale();
}


.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  animation: spin 0.6s linear infinite;
}

.overlay-text {
    position: absolute;
    font-weight: bold;
    font-size: 0.9rem;
    color: red;
    z-index: 2;
    font-weight: 500;
    font-size: 10rem;
    filter:none
}

.buttonList {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: none;
  background-color: #F48B29;
  border: rgb(98, 95, 95) 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* icon list */
.icon-list {
  width: 20px;
  height: 2px;
  background: white;
  position: relative;
}

.icon-list::before,
.icon-list::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 2px;
  background: white;
  left: 0;
}

.icon-list::before {
  top: -6px;
}

.icon-list::after {
  top: 6px;
}

.modal.closing {
  transform: translate(150%, 150%) scale(0.2);
  opacity: 0;
}

.Label {
  position: absolute;
  bottom: 50px; 
  right: 0;
  background: black;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  transform: translateY(10px);
  transition: 0.2s ease;
  pointer-events: none;
}

.buttonList:hover .Label {
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

.thanks-modal h2 {
  color: #28a745;
  margin-bottom: 10px;
}

}


</style>