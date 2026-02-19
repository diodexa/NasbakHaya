<template>
    <Loading :show="isSubmitting"/>
    <div class="OrderDiv">
        <h1>Nasi <span style="color: red;">Bakar</span> Haya</h1>
        <DateTime/>
        <input v-model="nama" type="text" placeholder="Isi Nama Kamu" class="InputNama"> 
        <div class="ButtonMenu">
            <button v-for="menu in menus" :key="menu" @click="addOrder(menu)" :disabled="!isMenuActive(menu)" class="menu-button">
                <span v-if="isSubmitting" class="mini-spinner"></span>
                <span v-if="!isMenuActive(menu)" class="overlay-text">Habis</span>
                {{ menu }}
            </button>
        </div>

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
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import DateTime from '../components/DateTime.vue'
import { 
  sendOrderToSheet,
  fetchTodayOrders,
  fetchMenuControl
} from "../services/orderService"
import Loading from '../components/Loading.vue'

const nama = ref("")
const orders = ref([])
const menuStatus = ref([])
const isSubmitting = ref(false)

const menus = [
  "Nasi Bakar Ayam 16K",
  "NDJ Telor Barendo 13K",
  "Nasi Bakar Cumi 18K",
  "NDJ Ayam Goreng 18K",
  "Nasi Bakar Jando 17K",
  "NDJ Ayam Bakar 18K",
  "Ketoprak 15K",
]



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
    ...order, isEditing: false
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
    color: black;
    flex: 1 1 45%; 
}

.menu-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: gray;
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
    color: rgb(245, 245, 245);
    opacity: 0.8;
    z-index: 2;
    bottom: 0;
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


}


</style>