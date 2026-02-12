<template>
    <div class="OrderDiv">
        <h1>Nasi Bakar Haya</h1>
        <DateTime/>
        <input v-model="nama" type="text" placeholder="Isi Nama Kamu" class="InputNama"> 
        <div class="ButtonMenu">
            <button v-for="menu in menus" :key="menu" @click="addOrder(menu)">
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
import { onMounted, ref } from 'vue';
import DateTime from '../components/DateTime.vue';
import { sendOrderToSheet } from "../services/orderService"
import { fetchTodayOrders } from "../services/orderService"


const nama = ref ("")
const menus = [
  "Nasi Bakar Ayam",
  "Nasi Bakar Jando",
  "Nasi Bakar Cumi",
  "Ketoprak",
  "Nasi Daun Jeruk Telor Barendo",
  "Nasi Daun Jeruk Ayam Goreng",
  "Nasi Daun Jeruk Ayam Bakar",
]

onMounted(async () => {
  const data = await fetchTodayOrders()
  console.log("DATA DARI API:", data)
  orders.value = data.map(order => ({
    ...order,
    isEditing: false
  }))
})

const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

const orders = ref ([])
const addOrder = async (menu) => {if (!nama.value) {alert("Nama harus diisi dulu!")}

  const orderData = {nama: nama.value,menu,notes: ""}
  await sendOrderToSheet(orderData)

//   const response = await sendOrderToSheet(orderData)


   const newOrder = {
    ...orderData,
    id: crypto.randomUUID(), 
    createdAt: getCurrentTime(),
    updatedAt: "-",
    status: "Belum Bayar",
    isEditing: false
  }

  orders.value.push(newOrder)

  nama.value = ""
}


const deleteOrder = (index) => {
    orders.value.splice(index, 1)
}

const editOrder = (index) => {
    const newName = prompt("Edit nama:", orders.value[index].nama)
    if (newName) {
        orders.value[index].nama = newName
    }
}

const saveOrder = async (order) => {
  order.isEditing = false

  await sendOrderToSheet({
    action: "update",
    id: order.id,
    notes: order.notes
  })

  order.updatedAt = getCurrentTime()
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