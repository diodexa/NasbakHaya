<template>
    <!-- <Notifikasi/> -->
    <div class="OrderDiv">
      <h1>Nasi <span style="color: red;">Bakar</span> Haya</h1>
      <div class="FilterDate">
        <label> Tanggal:  </label>
        <input type="date" v-model="selectedDate" @change="handleDateChange" />
      </div>
        <div class="SummaryBox">
            <div v-for="(total, menu) in menuSummary" :key="menu" style="font-weight: 700;">
                {{ menu }} : <strong>{{ total }}</strong>
            </div>
        </div>
        
        <!-- ================= ORDER TABLE ================= -->
        
        <table class="TabelOrder">
            <thead>
                <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Menu</th>
                <th>Notes</th>
            <th>Action</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Status</th>
        </tr>
        </thead>

        <tbody>
            <tr v-for="(order, index) in orders":key="order.id" :class="{ BelumBayar: order.status === 'Belum Bayar' ,Gajadi: order.menu === '-'}" >
            <td>{{ index + 1 }}</td>
            
            <td>{{ order.nama }}</td>
            
            <!-- MENU -->
            <td>
                <div v-if="order.isEditing">
                    <select v-model="order.menu">
                        <option v-for="menu in menuStatus":key="menu.menu" :value="menu.menu":disabled="!menu.aktif">
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
                  <i class="fa-solid fa-pen " ></i>
                </button>
                
                <button v-else @click="saveOrder(order)">Save</button>

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
import { ref, onMounted, computed } from 'vue'
import {fetchTodayOrders,fetchMenuControl,sendOrderToSheet,fetchOrdersByDate} from "../services/orderService"
import DateTime from '../components/DateTime.vue'
// import Notifikasi from '../components/Notifikasi.vue'

const orders = ref([])
const menuStatus = ref([])
const isLoading = ref(false)
const getLocalDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const selectedDate = ref(getLocalDate())



onMounted(async () => {
  const orderData = await fetchTodayOrders()

  orders.value = orderData.map(order => ({
    ...order,
    isEditing: false
  }))

  const menuData = await fetchMenuControl()
  menuStatus.value = menuData
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

  orders.value.forEach(order => {
    if (!result[order.menu]) {
      result[order.menu] = 0
    }
    result[order.menu]++
  })

  return result
})

const toggleMenu = async (menu) => {
  menu.aktif = !menu.aktif

  await sendOrderToSheet({
    action: "updateMenu",
    menu: menu.menu,
    aktif: menu.aktif
  })
}
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
}

.TabelOrder {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: smaller;
  background-color: white;
}


.TabelOrder th,
.TabelOrder td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: center;
  word-break: break-all;
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

.active-btn {
  background-color: #28a745;
}

.inactive-btn {
  background-color: #dc3545;
}

.menu-control button:hover {
  transform: scale(1.03);
}

</style>
