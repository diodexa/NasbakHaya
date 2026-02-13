<template>
    <!-- <Notifikasi/> -->
    <div class="OrderDiv">
        <h1>Nasi Bakar Haya</h1>
        <DateTime />
        <div class="SummaryBox">
            <div v-for="(total, menu) in menuSummary" :key="menu">
                {{ menu }} : <strong>{{ total }}</strong>
            </div>
        </div>
        
        <!-- ================= ORDER TABLE ================= -->
        <h2>Today Orders</h2>
        
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
            <tr v-for="(order, index) in orders":key="order.id":class="{ Lunas: order.status === 'Lunas' }">
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
                <button v-if="!order.isEditing" @click="order.isEditing = true">Edit</button>
                
                <button v-else @click="saveOrder(order)">Save</button>
            </td>
        
        <td>{{ order.createdAt }}</td>
        <td>{{ order.updatedAt }}</td>
        
        <!-- STATUS -->
        <td>
                <select v-model="order.status" @change="updateStatus(order)">
                    <option value="Belum Bayar">Belum Bayar</option>
                    <option value="Lunas">Lunas</option>
                </select>
            </td>
            </tr>
        </tbody>
        </table>
        <h2>Menu Control</h2>
        <table>
        <thead>
            <tr>
            <th>Menu</th>
            <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="menu in menuStatus" :key="menu.menu">
            <td>{{ menu.menu }}</td>
            <td>
                <select v-model="menu.aktif" @change="updateMenu(menu)">
                <option :value="true">Aktif</option>
                <option :value="false">Nonaktif</option>
                </select>
            </td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {fetchTodayOrders,fetchMenuControl,sendOrderToSheet} from "../services/orderService"
import DateTime from '../components/DateTime.vue'
// import Notifikasi from '../components/Notifikasi.vue'

const orders = ref([])
const menuStatus = ref([])


onMounted(async () => {
  const orderData = await fetchTodayOrders()

  orders.value = orderData.map(order => ({
    ...order,
    isEditing: false
  }))

  const menuData = await fetchMenuControl()
  menuStatus.value = menuData
})

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
</script>

<style>
.OrderDiv {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.TabelOrder {
  width: 100%;
  border-collapse: collapse;
}

.TabelOrder th,
.TabelOrder td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: center;
}

.Lunas {
  background-color: #d4edda;
  opacity: 0.7;
}
</style>
