<template>
    <div v-if="isSubmitting" class="loading-overlay">
        <div class="loading-box">
            <div class="spinner"></div>
            <p>Loading</p>
        </div>
    </div>
    <div class="OrderDiv">
        <h1>Nasi <span style="color: red;">Bakar</span> Haya</h1>
        <DateTime/>
        <input v-model="nama" type="text" placeholder="Isi Nama Kamu" class="InputNama"> 
        <div class="ButtonMenu">
            <button v-for="menu in menus" :key="menu" @click="addOrder(menu)" :disabled="!isMenuActive(menu)" class="menu-button">
                <span v-if="isSubmitting" class="mini-spinner"></span>
                {{ menu }}
            </button>
        </div>

        <table v-if="orders.length > 0" class="TabelOrder">
            <thead>
                <tr>
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
const isSubmitting = ref(false)

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

// onMounted(async () => {

//   // load menu status
//   menuStatus.value = await fetchMenuControl()

//   // load today's orders
//   const data = await fetchTodayOrders()
//   orders.value = data.map(order => ({
//     ...order,
//     isEditing: false
//   }))
// })

onMounted(async () => {
  try {
    isSubmitting.value = true

    // 1 load menu status dulu
    menuStatus.value = await fetchMenuControl()

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
            ...order,
            isEditing: false
        }))

    } catch (err) {
    console.error("Gagal kirim:", err)
    } finally {
    isSubmitting.value = false
    }

//   const response = await sendOrderToSheet({
//     nama: nama.value,
//     menu,
//     notes: ""
//   })

//   // reload orders biar ID sinkron
//   const data = await fetchTodayOrders()
//   orders.value = data.map(order => ({
//     ...order,
//     isEditing: false
//   }))

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
    padding: 8px 14px;
    justify-content: center;
    align-items: center;
}


.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-box {
    background: white;
    padding: 30px 40px;
    border-radius: 10px;
    text-align: center;
}

.spinner {
    width: 35px;
    height: 35px;
    border: 4px solid #ddd;
    border-top: 4px solid #4caf50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .menu-button {
    padding: 8px 14px;
    flex: 1 1 45%; 
}


th,td {
    word-break: break-all;
}

.TabelOrder input {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 6px;
}


}


</style>