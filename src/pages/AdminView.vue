<template>
  <Notifikasi />

  <div class="OrderDiv">
    <!-- HEADER -->
    <section class="dashboard-header">
      <div>
        <p class="eyebrow">ADMIN DASHBOARD</p>
        <h1>Nasi Bakar Haya</h1>

      </div>
    </section>

    <!-- FILTER -->
    <section class="filter-card">
      <div class="filter-group">
        <label>Tanggal</label>
        <input
          v-model="selectedDate"
          type="date"
          @change="handleDateChange"
        />
      </div>

      <div class="filter-group">
        <label>Shift</label>
        <button
          class="shift-button"
          @click="toggleShift"
        >
          {{ activeShift === 'siang' ? '☀️ Siang' : '🌙 Malam' }}
        </button>
      </div>

      <div class="filter-group search-group">
        <label>Cari</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama, menu, notes..."
        />
      </div>
    </section>

    <!-- SUMMARY -->
    <section class="summary-section">
      <div class="summary-card total">
        <span>Total Pesanan</span>
        <strong>{{ searchedOrders.length }}</strong>
      </div>

     <div v-for="item in menuSummary" :key="item.menu" class="summary-card">
      <button  @click="toggleSummaryMenu(item.menu)">
        <span>{{ item.menu }}</span>
        <div><strong>{{ item.total }}</strong><i class="fa-solid fa-chevron-down" :class="{ rotate: openedMenu === item.menu }"></i></div>
      </button>
      <div v-if="openedMenu === item.menu" class="order-names">
        <p v-for="(order, index) in orders.filter(o => o.menu === item.menu && isOrderInShift(o))":key="order.id" class="order-name"><span>{{ index + 1 }}.</span> {{ order.nama }} {{ order.notes ? `(notes : ${order.notes}) ` : '' }} </p>
      </div>
    </div>
    </section>

    

    <!-- DETAIL PESANAN -->
    <section class="detail-section">
      <div class="section-header">
        <div>
          <h2>Detail Pesanan</h2>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="TabelOrder">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Menu</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(order, index) in sortedOrders"
              :key="order.id || index" :class="{'card-belum-bayar': order.status === 'Belum Bayar','card-sudah-bayar': order.status === 'Sudah Bayar' }">
              <td>{{ index + 1 }}</td>

              <td>
                <input v-if="order.isEditing"
                  v-model="order.nama"
                  class="table-input"/>
                <span v-else>{{ order.nama }}</span>
              </td>

              <td>
                <input
                  v-if="order.isEditing"
                  v-model="order.menu"
                  class="table-input"
                />
                <span v-else>{{ order.menu }}</span>
              </td>

              <td>
                <input
                  v-if="order.isEditing"
                  v-model="order.notes"
                  class="table-input"/>
                <span v-else>{{ order.notes || '-' }}</span>
              </td>

              <td>
                <select v-model="order.status"
                  class="status-select"
                  @change="updateStatus(order)">
                  <option>Belum Bayar</option>
                  <option>Cash</option>
                  <option>Haya</option>
                  <option>Dio</option>
                </select>
              </td>

              <td>{{ order.createdAt || '-' }}</td>
              <td>{{ order.updatedAt || '-' }}</td>

              <td>
                <div class="action-buttons">
                  <button
                    v-if="!order.isEditing"
                    class="btn-edit"
                    @click="order.isEditing = true"
                  >
                    Edit
                  </button>

                  <button  v-else
                    class="btn-save"
                    @click="saveOrder(order)">
                    Simpan
                  </button>

                  <button
                    class="btn-delete"
                    @click="deleteOrder(order)"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!sortedOrders.length">
              <td colspan="8" class="table-empty">
                Tidak ada data pesanan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MOBILE DETAIL -->
      <div class="mobile-detail-list">
        <div v-for="(order, index) in sortedOrders"
          :key="order.id || index"
          class="mobile-detail-card"  
          :class="{'card-belum-bayar': order.status === 'Belum Bayar', 'card-sudah-bayar': order.status !== 'Belum Bayar' }">
          <div class="mobile-detail-header">
            <div>
              <strong>{{ order.nama }}</strong>
              <span>{{ order.menu }}</span>
            </div>

            <select v-model="order.status" class="status-select" @change="updateStatus(order)">
              <option>Belum Bayar</option>
              <option>Cash</option>
              <option>Haya</option>
              <option>Dio</option>
            </select>
          </div>

          <div class="mobile-detail-content">
            <div>
              <small>Notes</small>

              <input  v-if="order.isEditing" v-model="order.notes" class="mobile-input" placeholder="Notes"/>

              <span v-else>{{ order.notes || '-' }}</span>
            </div>

            <div>
              <small>Created</small>
              <span>{{ order.createdAt || '-' }}</span>
            </div>

            <div>
              <small>Updated</small>
              <span>{{ order.updatedAt || '-' }}</span>
            </div>
          </div>

          <div class="mobile-action">
            <button
              v-if="!order.isEditing"
              class="btn-edit"
              @click="order.isEditing = true"
            >
              Edit
            </button>

            <button
              v-else
              class="btn-save"
              @click="saveOrder(order)"
            >
              Simpan
            </button>

            <button
              class="btn-delete"
              @click="deleteOrder(order)"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- MENU CONTROL -->
    <section class="menu-control-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">MENU MANAGEMENT</p>
          <h2>Menu Control</h2>
        </div>
        <span class="menu-status-info">Tap untuk mengubah status</span>
      </div>
      <div class="menu-control">
        <button v-for="menu in menuStatus" :key="menu.menu" :class="menu.aktif ? 'active-btn' : 'inactive-btn'" @click="toggleMenu(menu)">
          <span class="menu-control-icon">
            <i :class="menu.aktif ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
          </span>
          <span>{{ menu.menu }}</span>
          <small>{{ menu.aktif ? 'TERSEDIA' : 'HABIS' }}</small>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import {
  fetchMenuControl,
  sendOrderToSheet,
  fetchOrdersByDate
} from "../services/orderService"

import Notifikasi from '../components/Notifikasi.vue'

const orders = ref([])
const menuStatus = ref([])

const activeShift = ref('malam')
const searchQuery = ref('')

const openedMenu = ref(null)
const toggleSummaryMenu = (menu) => {
  openedMenu.value = openedMenu.value === menu ? null : menu
}

const getLocalDate = () => {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const selectedDate = ref(getLocalDate())

let intervalId = null

const intervalTime = 5000

const loadOrders = async () => {
  try {
    const data = await fetchOrdersByDate(selectedDate.value)

    orders.value = data.map(order => ({
      ...order,
      isEditing: false
    }))
  } catch (error) {
    console.error("Gagal mengambil orders:", error)
  }
}

const loadMenu = async () => {
  try {
    menuStatus.value = await fetchMenuControl()
  } catch (error) {
    console.error("Gagal mengambil menu:", error)
  }
}

onMounted(async () => {
  await loadOrders()
  await loadMenu()

  intervalId = setInterval(async () => {
    try {
      const latestOrders = await fetchOrdersByDate(selectedDate.value)

      orders.value = latestOrders.map(order => {
        const existing = orders.value.find(item => item.id === order.id)

        return {
          ...order,
          isEditing: existing?.isEditing || false
        }
      })
    } catch (error) {
      console.error("Gagal polling orders:", error)
    }
  }, intervalTime)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const handleDateChange = async () => {
  await loadOrders()
}

const toggleShift = () => {
  activeShift.value =
    activeShift.value === 'siang'
      ? 'malam'
      : 'siang'
}

const isOrderInShift = order => {
  if (!order.createdAt) return false

  const [hour] = order.createdAt
    .split(':')
    .map(Number)

  if (activeShift.value === 'siang') {
    return hour >= 1 && hour < 13
  }

  return hour >= 13 || hour < 1
}

const filteredOrders = computed(() => {
  return orders.value.filter(order =>
    isOrderInShift(order)
  )
})

const searchedOrders = computed(() => {
  const query = searchQuery.value
    .trim()
    .toLowerCase()

  if (!query) {
    return filteredOrders.value
  }

  return filteredOrders.value.filter(order => {
    return (
      String(order.nama || '')
        .toLowerCase()
        .includes(query) ||

      String(order.menu || '')
        .toLowerCase()
        .includes(query) ||

      String(order.notes || '')
        .toLowerCase()
        .includes(query) ||

      String(order.status || '')
        .toLowerCase()
        .includes(query)
    )
  })
})

/*
|--------------------------------------------------------------------------
| GROUP PESANAN BERDASARKAN MENU
|--------------------------------------------------------------------------
*/

const menuOrderList = computed(() => {
  const grouped = {}

  searchedOrders.value.forEach(order => {
    if (!order.menu || order.menu === '-') {
      return
    }

    if (!grouped[order.menu]) {
      grouped[order.menu] = []
    }

    grouped[order.menu].push(order)
  })

  const result = Object.entries(grouped).map(
    ([menu, orders]) => ({
      menu,
      orders
    })
  )

  // Ikuti urutan menu dari Menu Control
  result.sort((a, b) => {
    const indexA = menuStatus.value.findIndex(
      item => item.menu === a.menu
    )

    const indexB = menuStatus.value.findIndex(
      item => item.menu === b.menu
    )

    if (indexA === -1 && indexB === -1) {
      return a.menu.localeCompare(b.menu)
    }

    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })

  return result
})

const menuSummary = computed(() => {
  const result = {}

  searchedOrders.value.forEach(order => {
    if (!order.menu || order.menu === '-') {
      return
    }

    if (!result[order.menu]) {
      result[order.menu] = 0
    }

    result[order.menu]++
  })

  return Object.entries(result).map(
    ([menu, total]) => ({
      menu,
      total
    })
  )
})

/*
|--------------------------------------------------------------------------
| SORT DETAIL ORDER
|--------------------------------------------------------------------------
*/

const sortKey = ref("createdAt")
const sortOrder = ref("desc")

const sortedOrders = computed(() => {
  const data = [...searchedOrders.value]

  return data.sort((a, b) => {
    let valueA = a[sortKey.value]
    let valueB = b[sortKey.value]

    if (
      sortKey.value === 'createdAt' ||
      sortKey.value === 'updatedAt'
    ) {
      const parseTime = value => {
        if (!value) return 0

        const [hour, minute] = value
          .split(':')
          .map(Number)

        return hour * 60 + minute
      }

      valueA = parseTime(valueA)
      valueB = parseTime(valueB)
    }

    if (valueA < valueB) {
      return sortOrder.value === 'asc' ? -1 : 1
    }

    if (valueA > valueB) {
      return sortOrder.value === 'asc' ? 1 : -1
    }

    return 0
  })
})

const handleSort = key => {
  if (sortKey.value === key) {
    sortOrder.value =
      sortOrder.value === 'asc'
        ? 'desc'
        : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

/*
|--------------------------------------------------------------------------
| ORDER ACTION
|--------------------------------------------------------------------------
*/

const updateStatus = async order => {
  try {
    await sendOrderToSheet({
      action: 'update',
      id: order.id,
      nama: order.nama,
      menu: order.menu,
      notes: order.notes,
      status: order.status
    })
  } catch (error) {
    console.error("Gagal update status:", error)
  }
}

const saveOrder = async order => {
  try {
    await sendOrderToSheet({
      action: 'update',
      id: order.id,
      nama: order.nama,
      menu: order.menu,
      notes: order.notes,
      status: order.status
    })

    order.isEditing = false

  } catch (error) {
    console.error("Gagal menyimpan order:", error)
  }
}

const deleteOrder = async order => {
  const confirmed = confirm(
    `Hapus pesanan ${order.nama}?`
  )

  if (!confirmed) return

  try {
    await sendOrderToSheet({
      action: 'delete',
      id: order.id
    })

    orders.value = orders.value.filter(
      item => item.id !== order.id
    )

  } catch (error) {
    console.error("Gagal menghapus order:", error)
  }
}

/*
|--------------------------------------------------------------------------
| MENU CONTROL
|--------------------------------------------------------------------------
*/

const toggleMenu = async menu => {
  const oldStatus = menu.aktif

  menu.aktif = !menu.aktif

  try {
    await sendOrderToSheet({
      action: 'updateMenu',
      menu: menu.menu,
      aktif: menu.aktif
    })
  } catch (error) {
    console.error("Gagal update menu:", error)

    menu.aktif = oldStatus
  }
}

/*
|--------------------------------------------------------------------------
| STATUS CLASS
|--------------------------------------------------------------------------
*/

const getStatusClass = status => {
  switch (status) {
    case 'Cash':
      return 'status-cash'

    case 'Haya':
      return 'status-haya'

    case 'Dio':
      return 'status-dio'

    default:
      return 'status-unpaid'
  }
}
</script>

<style scoped>
.OrderDiv {
  width: 100%;
  min-height: 100vh;
  padding: 32px;
  background: #fffaf6;
  color: #321b1b;
  box-sizing: border-box;
}

.dashboard-header {
  background: #641919;
  color: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  opacity: .65;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
}


.filter-card {
  display: grid;
  grid-template-columns: 180px 180px 1fr;
  gap: 16px;
  background: white;
  padding: 20px;
  border: 1px solid #eaded8;
  border-radius: 18px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #806f68;
}

.filter-group input,
.shift-button {
  width: 100%;
  height: 42px;
  padding: 0 13px;
  box-sizing: border-box;
  border: 1px solid #ded1cb;
  border-radius: 10px;
  background: white;
  color: #321b1b;
  font-size: 14px;
  outline: none;
}

.filter-group input:focus {
  border-color: #641919;
}

.shift-button {
  cursor: pointer;
  font-weight: 700;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  align-items: stretch;
  
}

.summary-card {
  position: relative;
  border: 1px solid #eaded8;
  border-radius: 16px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.summary-card > button {
  width: 100%;
  height: 100%;
  min-height: 75px;
  padding: 18px;
  margin: 0;
  border: none;
  border-radius: 16px;
  background: transparent;
  box-sizing: border-box;
  background: rgb(219, 161, 47);
  color: white;
}

.order-names {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  z-index: 20;
  padding: 8px 12px;
  box-sizing: border-box;
  background: white;
  border: 1px solid #eaded8;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,.12);
}



.summary-card span {
  font-size: 12px;
}

.summary-card strong {
  color: #641919;
  font-size: 25px;
}

.summary-card.total {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #641919;
  display: flex;
  align-items: center;
  justify-content: center;
}


.summary-card.total span,
.summary-card.total strong {
  color: white;
}



.menu-orders-section,
.detail-section,
.menu-control-section {
  border: 1px solid #eaded8;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 21px;
  color: #321b1b;
}

.section-count {
  padding: 7px 12px;
  border-radius: 999px;
  background: #fff1e5;
  color: #b65a16;
  font-size: 12px;
  font-weight: 700;
}

.menu-order-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.menu-order-card {
  border: 1px solid #eaded8;
  border-radius: 16px;
  overflow: hidden;
  background: #fffdfb;
}

.menu-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px;
  background: #fff7f1;
  border-bottom: 1px solid #eaded8;
}

.menu-card-header h3 {
  margin: 0;
  font-size: 17px;
  color: #641919;
}

.menu-card-header span {
  display: block;
  margin-top: 3px;
  color: #8b7770;
  font-size: 12px;
}

.menu-total {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #641919;
  color: white;
  font-size: 14px;
  font-weight: 800;
}

.customer-list {
  padding: 8px 0;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #f0e8e4;
}

.customer-item:last-child {
  border-bottom: 0;
}

.customer-number {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #f4ebe6;
  color: #806f68;
  font-size: 11px;
  font-weight: 700;
}

.customer-info {
  min-width: 0;
  flex: 1;
}

.customer-info strong {
  display: block;
  font-size: 14px;
  color: #321b1b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-info small {
  display: block;
  margin-top: 2px;
  color: #927e76;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-status {
  flex-shrink: 0;
  padding: 4px 7px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.status-unpaid {
  background: #fff0ed;
  color: #c23d29;
}

.status-cash {
  background: #edf9f0;
  color: #258443;
}

.status-haya {
  background: #fff3df;
  color: #b66b09;
}

.status-dio {
  background: #eeeaff;
  color: #6652c4;
}

.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #806f68;
  text-align: center;
}

.empty-icon {
  font-size: 42px;
  margin-bottom: 10px;
}

.empty-state strong {
  color: #321b1b;
  font-size: 16px;
}

.empty-state span {
  margin-top: 5px;
  font-size: 13px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.TabelOrder {
  width: 100%;
  min-width: 950px;
  border-collapse: collapse;
}

.TabelOrder th {
  padding: 12px;
  text-align: left;
  background: #faf4f0;
  color: #806f68;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
}

.TabelOrder td {
  padding: 12px;
  border-bottom: 1px solid #eee5e1;
  font-size: 13px;
  vertical-align: middle;
}

.table-input,
.status-select {
  width: 100%;
  min-height: 34px;
  box-sizing: border-box;
  border: 1px solid #ded1cb;
  border-radius: 7px;
  padding: 0 8px;
  background: white;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-buttons button,
.mobile-action button {
  border: 0;
  border-radius: 7px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.btn-edit {
  background: #fff1e5;
  color: #b65a16;
}

.btn-save {
  background: #eaf7ed;
  color: #278144;
}

.btn-delete {
  background: #fff0ed;
  color: #c23d29;
}

.table-empty {
  text-align: center;
  padding: 35px !important;
  color: #8b7770;
}

.mobile-detail-list {
  display: none;
}

.menu-control {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.menu-control button {
  display: grid;
  grid-template-columns: 35px 1fr;
  grid-template-rows: 1fr 1fr;
  align-items: center;
  column-gap: 8px;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: .2s ease;
}

.menu-control button:hover {
  transform: translateY(-2px);
}

.menu-control-icon {
  grid-row: 1 / 3;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
}

.menu-control button span:nth-child(2) {
  font-size: .85rem;
  font-weight: 800;
}

.menu-control button small {
  font-size: .55rem;
  opacity: .8;
  font-weight: 700;
}

.active-btn {
  background: #278c48;
}

.inactive-btn {
  background: #c93636;
}

.mobile-edit-fields {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.mobile-input {
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  box-sizing: border-box;
  border: 1px solid #ded1cb;
  border-radius: 8px;
  background: white;
  color: #321b1b;
  font-size: 14px;
  outline: none;
}

.mobile-input:focus {
  border-color: #641919;
}

.card-belum-bayar {
  background: #f6b5a8;
}

.card-sudah-bayar {
  background: white;
}

@media (max-width: 1000px) {
  .OrderDiv {
    padding: 20px;
  }

  .summary-section {
    grid-template-columns: repeat(3, 1fr);
  }

  .menu-order-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .menu-control-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .OrderDiv {
    padding: 12px;
  }

  .dashboard-header {
    padding: 22px;
    border-radius: 16px;
  }

  .dashboard-header h1 {
    font-size: 25px;
  }

  .filter-card {
    grid-template-columns: 1fr 1fr;
    padding: 15px;
    border-radius: 15px;
  }

  .search-group {
    grid-column: 1 / -1;
  }





  .summary-card strong {
    font-size: 21px;
  }

  .menu-orders-section,
  .detail-section,
  .menu-control-section {
    padding: 15px;
    border-radius: 16px;
  }

  .menu-order-grid {
    grid-template-columns: 1fr;
  }

  .menu-card-header {
    padding: 14px;
  }

  .customer-item {
    padding: 10px 12px;
  }

  .table-wrapper {
    display: none;
  }

  .mobile-detail-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mobile-detail-card {
    border: 1px solid #eaded8;
    border-radius: 13px;
    padding: 13px;
  }

  .mobile-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .mobile-detail-header strong {
    display: block;
    font-size: 14px;
  }

  .mobile-detail-header span:not(.customer-status) {
    display: block;
    margin-top: 3px;
    color: #806f68;
    font-size: 12px;
  }

  .mobile-detail-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 13px;
    padding-top: 12px;
    border-top: 1px solid #eee5e1;
  }

  .mobile-detail-content div:first-child {
    grid-column: 1 / -1;
  }

  .mobile-detail-content small,
  .mobile-detail-content span {
    display: block;
  }

  .mobile-detail-content small {
    margin-bottom: 3px;
    color: #927e76;
    font-size: 10px;
    text-transform: uppercase;
  }

  .mobile-detail-content span {
    font-size: 12px;
  }

  .mobile-action {
    display: flex;
    gap: 7px;
    margin-top: 12px;
  }

  .mobile-action button {
    flex: 1;
  }

  .menu-control-grid {
    grid-template-columns: 1fr;
  }

  .menu-control-card {
    padding: 12px;
  }
}

@media (max-width: 400px) {
  .filter-card {
    grid-template-columns: 1fr;
  }

  .search-group {
    grid-column: auto;
  }

 
  .customer-status {
    font-size: 8px;
  }
}
</style>
