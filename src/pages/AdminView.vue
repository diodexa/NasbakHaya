<template>
    <Notifikasi/>
    <div class="OrderDiv">
      <h1>Nasi <span style="color: #F48B29;">Bakar</span> Haya</h1>
      <div class="FilterDate">
        <label> Tanggal:  </label>
        <div class="date-wrapper">
          <input 
            type="date" v-model="selectedDate" @change="handleDateChange"class="date-input"/>
        </div>
      </div>
      <div class="ShiftToggle">
        <button class="ShiftButton" @click="toggleShift">
          {{ activeShift === 'siang' ? '🌤  Siang' : '🌙  Malam' }}
        </button>
        <input v-model="searchQuery" type="text" placeholder="Search" class="search-input"/>
        <Modal :show="showModalList" @close="showModalList = false"></Modal>
      </div>     
      <p>Total : {{ orders.length }}</p>
      <div style=" margin: 0; display: flex;">
          <div v-for="item in menuSummary" :key="item[0]" style="font-weight:700;" class="Totaltable">
            {{ item[0] }} : <br/> <p style="font-size: larger;">{{ item[1] }}</p>
          </div>
      </div>


        
        <!-- ================= ORDER TABLE ================= -->
        
        <table class="TabelOrder">
          <thead>
              <tr>
                <th @click="handleSort('no')">No</th>
                <th @click="handleSort('nama')">Nama</th>
                <th @click="handleSort('menu')">Menu</th>
                <th @click="handleSort('notes')">Notes</th>
                <th @click="handleSort('action')">Action</th>
                <th @click="handleSort('created')">Created</th>
                <th @click="handleSort('updated')">Updated</th>
                <th @click="handleSort('status')">Status</th>
              </tr>
          </thead>

          <tbody>
              <tr v-for="(order, index) in sortedOrders" :key="order.id" :class="{ BelumBayar: order.status === 'Belum Bayar' ,Gajadi: order.menu === '-'}" >
              <td>{{ index + 1 }}</td>
              
              <td>{{ order.nama }}</td>
              
              <!-- MENU -->
              <td>
                  <div v-if="order.isEditing">
                      <select v-model="order.menu">
                          <option v-for="menu in menuStatus" :key="menu.menu" :value="menu.menu" :disabled="!menu.aktif">
                              {{ menu.menu }}
                          </option>
                      </select>
                  </div>
                  
                  <div v-else>
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
          
              <!-- ACTION -->
              <td>
                <button v-if="!order.isEditing" @click="order.isEditing = true" class="icon-btn">
                  <i class="fa-solid fa-pen"></i>
                </button>

                <button v-if="!order.isEditing" @click="deleteOrder(order)" class="icon-btn delete-btn">
                  <i class="fa-solid fa-trash"></i>
                </button>
                
                <button v-else @click="saveOrder(order)">
                  Save
                </button>
              </td>

          
              <td>{{ order.createdAt }}</td>
              <td>{{ order.updatedAt }}</td>
              
              <!-- STATUS -->
              <td v-if="order.menu !== '-'">
                  <select v-model="order.status" @change="updateStatus(order)">
                      <option value="Belum Bayar">Belum Bayar</option>
                      <option value="Cash">Cash</option>
                      <option value="Haya">Haya</option>
                      <option value="Dio">Dio</option>
                      
                  </select>
              </td>
              </tr>
          </tbody>
        </table>
        <h2>Menu Control</h2>
     
          <div class="menu-control">
            <button v-for="menu in menuStatus" :key="menu.menu" :class="menu.aktif ? 'active-btn' : 'inactive-btn'"@click="toggleMenu(menu)">
              {{ menu.menu }}
            </button>
          </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount } from 'vue'
import {fetchTodayOrders,fetchMenuControl,sendOrderToSheet,fetchOrdersByDate} from "../services/orderService"
import DateTime from '../components/DateTime.vue'
import Notifikasi from '../components/Notifikasi.vue'
import Modal from '../components/Modal.vue'


const orders = ref([])
const menuStatus = ref([])
const isLoading = ref(false)
const activeShift = ref('malam')
const sortKey = ref("createdAt") 
const sortOrder = ref("desc")
const searchQuery = ref("")


const getLocalDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const selectedDate = ref(getLocalDate())

const intervalTime = 5000
let intervalId = null
const previousCount = ref(0)


onMounted(async () => {
  // 🔹 load pertama kali
  const orderData = await fetchOrdersByDate(selectedDate.value)
  orders.value = orderData.map(o => ({ ...o, isEditing: false }))
  previousCount.value = orderData.length

  // 🔹 load menu (cukup sekali)
  const menuData = await fetchMenuControl()
  menuStatus.value = menuData

  // 🔹 mulai polling
  intervalId = setInterval(async () => {
    try {
      const newData = await fetchOrdersByDate(selectedDate.value)
      const existingIds = orders.value.map(o => o.id) 
      const addedOrders = newData.filter(o => !existingIds.includes(o.id))

      if (addedOrders.length) {
        // push order baru ke array reactive
        orders.value.push(...addedOrders.map(o => ({ ...o, isEditing: false })))

        // mainkan sound notifikasi
        notificationSound.currentTime = 0
        notificationSound.play().catch(() => {})
      }

      // update previousCount supaya sound tetap akurat
      previousCount.value = newData.length

    } catch (err) {
      console.error("Polling orders gagal:", err)
    }
  }, intervalTime)
})

onBeforeMount(() => {
  if (intervalId) clearInterval(intervalId)
})

/* ================= TANGGAL ================= */

const handleDateChange = async () => {
  try {
    const data = await fetchOrdersByDate(selectedDate.value)

    orders.value = data.map(order => ({
      ...order,
      isEditing: false
    }))

  } catch (err) {
    console.error("Gagal fetch tanggal:", err)
  }
}

/* ================= UPDATE ORDER ================= */

const updateStatus = async (order) => {
  await sendOrderToSheet({
    action: "update",
    id: order.id,
    nama: order.nama,
    menu: order.menu,
    notes: order.notes,
    status: order.status
  })
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
}

// =============filter siang/malam======================================
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (!order.createdAt) return false

    const [h, m] = order.createdAt.split(":").map(Number)
    const totalMinutes = h * 60 + m

    const siangStart = 1 * 60
    const siangEnd = 12 * 60 + 59

    if (activeShift.value === 'siang') {
      return totalMinutes >= siangStart && totalMinutes <= siangEnd
    } else {
      return totalMinutes < siangStart || totalMinutes > siangEnd
    }
  })
})
/* ================= button ================= */

const toggleShift = () => {
  activeShift.value = activeShift.value === 'malam' ? 'siang' : 'malam'
}



/* ================= UPDATE MENU CONTROL ================= */

const updateMenu = async (menu) => {
  await sendOrderToSheet({
    action: "updateMenu",
    menu: menu.menu,
    aktif: menu.aktif
  })
}

const menuSummary = computed(() => {
  const result = {}

  filteredOrders.value.forEach(order => {
    if (!result[order.menu]) {
      result[order.menu] = 0
    }
    result[order.menu]++
  })

  return Object.entries(result).sort((a, b) => a[0].localeCompare(b[0]))
})

// =================SummaryEcare =============
const ecareOrders = computed(() =>
  orders.value.filter(order =>
    order.nama?.toLowerCase().includes("ecare -")
  )
)

const ecareSummary = computed(() => {
  const result = {}

  ecareOrders.value.forEach(order => {
    if (!result[order.menu]) {
      result[order.menu] = 0
    }
    result[order.menu]++
  })

  return result
})
// ===========================================


const sortedOrders = computed(() => {
  return [...searchedOrders.value].sort((a, b) => {

    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (sortKey.value === "createdAt" || sortKey.value === "updatedAt") {
      const toMinutes = (time) => {
        if (!time || time === "-") return 0
        const [h = 0, m = 0] = time.split(":").map(Number)
        return h * 60 + m
      }

      valA = toMinutes(valA)
      valB = toMinutes(valB)
    }

    if (typeof valA === "string") {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }

    if (valA < valB) return sortOrder.value === "asc" ? -1 : 1
    if (valA > valB) return sortOrder.value === "asc" ? 1 : -1
    return 0
  })
})

const toggleMenu = async (menu) => {
  menu.aktif = !menu.aktif

  await sendOrderToSheet({
    action: "updateMenu",
    menu: menu.menu,
    aktif: menu.aktif
  })
}

// =============Delete ======================
const deleteOrder = async (order) => {
  const confirmDelete = confirm(`Hapus order ${order.nama}?`)
  if (!confirmDelete) return

  await sendOrderToSheet({
    action: "delete",
    id: order.id
  })

  // hapus dari state frontend
  orders.value = orders.value.filter(o => o.id !== order.id)
}

// sort head tabel

const handleSort = (key) => {
  if (sortKey.value === key) {
    // kalau klik kolom yang sama → toggle
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
  } else {
    // kalau kolom baru → set key + default asc
    sortKey.value = key
    sortOrder.value = "asc"
  }
}

//           Search

const searchedOrders = computed(() => {
  if (!searchQuery.value) return filteredOrders.value

  const q = searchQuery.value.toLowerCase()

  return filteredOrders.value.filter(order => {
    return (
      order.nama?.toLowerCase().includes(q) ||
      order.menu?.toLowerCase().includes(q) ||
      order.notes?.toLowerCase().includes(q) ||
      order.status?.toLowerCase().includes(q)
    )
  })
})
</script>

<style>
.OrderDiv {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: black;
}
h1 {
  font-size: clamp(1.8rem, 9vw, 4rem);
  text-shadow: 
    -3px -3px 0 white,
     3px -3px 0 white,
    -3px  3px 0 white,
     3px  3px 0 white;
}


label {
  mix-blend-mode: difference; 
  filter: invert(1);
}

.search-input {
 width: 80%;
 text-align: center;
}

.Totaltable {
  display: flex;
  flex-direction: column;
  flex: auto;
  justify-content: space-between;
  border: 1px solid;
  padding: 3px;
}

.Totaltable:nth-child(1) {
  background-color: #e2c670;
}
.Totaltable:nth-child(2) {
  background-color: #abe270;
}
.Totaltable:nth-child(3) {
  background-color: #70e2ba;
}
.Totaltable:nth-child(4) {
  background-color: #70dee2;
}
.Totaltable:nth-child(5) {
  background-color: #70ade2;
}
.Totaltable:nth-child(6) {
  background-color: #b270e2;
}
.Totaltable:nth-child(7) {
  background-color: #e270c5;
}

.FilterDate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.date-wrapper {
  position: relative;
}

.date-input {
  appearance: none;
  -webkit-appearance: none;
  padding: 10px 40px 10px 12px;
  border: 1px solid #E3D2C3;
  border-radius: 8px;
  background-color: #f9f6f3;
  font-size: 14px;
  transition: all 0.3s ease;
}

/* focus effect */
.date-input:focus {
  outline: none;
  border-color: #c5a880;
  box-shadow: 0 0 0 2px rgba(197, 168, 128, 0.2);
}

/* sembunyikan icon bawaan */
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 10px;
  cursor: pointer;
}

/* icon custom */
.date-wrapper::after {
  content: "📅";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 16px;
}

.TabelOrder {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: smaller;
  background-color: white;
}

.TabelOrder input {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 6px;
}

.TabelOrder th,
.TabelOrder td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: center;
  word-break: break-all;
}

.TabelOrder th {
  cursor: pointer;
}

select {
  width: 100%;
}

.icon-btn {
  background: none;
  border: none;
}

.BelumBayar {
  background-color: red;
  color: white;
  opacity: 0.7;
}

.Gajadi {
    background-color: black;
}

option {
  justify-content: center;
  align-items: center;
  text-align: center;
}

.menu-control {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.menu-control button {
  flex: 1 1 45%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.active-btn {
  background-color: #28a745;
}

.inactive-btn {
  background-color: #dc3545;
}

.menu-control button:hover {
  transform: scale(1.03);
}

.ShiftToggle {
  display: flex;
  gap: 10px;
}

.ShiftButton {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s ease;
}

.ShiftButton:hover {
  opacity: 0.8;
}

@media (max-width: 600px) {
  .search-input {
   width: 63%;
  }

}

</style>
