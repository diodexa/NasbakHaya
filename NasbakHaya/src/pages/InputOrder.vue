<template>
    <div class="OrderDiv">
        <h1>Nasi Bakar Haya</h1>
        <DateTime/>
        <input v-model="nama" type="text" placeholder="Isi Nama Kamu" class="InputNama"> 
        <div class="ButtonMenu">
            <button v-for="menu in menus" :key="menu" @click="addOrder(menu)" :disabled="!isMenuActive(menu)">
                {{ menu }}
            </button>
        </div>

        <table v-if="orders.length > 0" class="TabelOrder">
            <thead>
                <tr>
                    <th>Nomor</th>
                    <th>Nama</th>
                    <th>Menu</th>
                    <th>Notes</th>
                    <th>Action</th>
                    <th>Created</th>
                    <th>Updated</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(order, index) in orders" :key="index">
                    <td style="display:none">{{ order.id }}</td>

                    <td>{{ index+1 }}</td>
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
                        <button v-if="!order.isEditing" @click="order.isEditing = true">
                            Edit
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
                    <td>{{ order.updatedAt }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import DateTime from '../components/DateTime.vue'
import { 
  sendOrderToSheet,
  fetchTodayOrders,
  fetchMenuControl
} from "../services/orderService"

const nama = ref("")
const orders = ref([])
const menuStatus = ref([])

const menus = [
  "Nasi Bakar Ayam",
  "Nasi Bakar Jando",
  "Nasi Bakar Cumi",
  "Ketoprak",
  "NDJ Telor Barendo",
  "NDJ Ayam Goreng",
  "NDJ Ayam Bakar",
]

/* ================= LOAD DATA ================= */

onMounted(async () => {

  // load menu status
  menuStatus.value = await fetchMenuControl()

  // load today's orders
  const data = await fetchTodayOrders()
  orders.value = data.map(order => ({
    ...order,
    isEditing: false
  }))
})

/* ================= ADD ORDER ================= */

const addOrder = async (menu) => {

  if (!nama.value) {
    alert("Nama harus diisi dulu!")
    return
  }

  const response = await sendOrderToSheet({
    nama: nama.value,
    menu,
    notes: ""
  })

  // reload orders biar ID sinkron
  const data = await fetchTodayOrders()
  orders.value = data.map(order => ({
    ...order,
    isEditing: false
  }))

  nama.value = ""
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
    ...order,
    isEditing: false
  }))
}

/* ================= CHECK MENU ACTIVE ================= */

const isMenuActive = (menu) => {
  const found = menuStatus.value.find(m => m.menu === menu)
  return found ? found.aktif : true
}
</script>

<style scoped>
.OrderDiv {
    display: flex;
    gap: 5px;
    flex-direction: column;
}
.InputNama {
    font-size: 2rem;
    text-align: center;
}
.ButtonMenu {
    display: flex;
    gap: 10px;
}
.TabelOrder {
    
    justify-content: center;
    align-items: center;
 
}

</style>