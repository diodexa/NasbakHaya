<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue"
import { fetchTodayOrders } from "../services/orderService"

const intervalTime = 5000
let intervalId = null
const previousCount = ref(0)

const notificationSound = new Audio(import.meta.env.BASE_URL + 'NotifHaya.mp3')

const userInteracted = ref(false)

const activateSound = async () => {
  userInteracted.value = true
  try {
    await notificationSound.play()
    notificationSound.pause()
    notificationSound.currentTime = 0
  } catch (err) {
    console.log("Audio unlock gagal:", err)
  }
}

onMounted(async () => {
  const data = await fetchTodayOrders()
  previousCount.value = data.length

  intervalId = setInterval(async () => {
    const newData = await fetchTodayOrders()

    if (newData.length > previousCount.value) {
      notificationSound.play()
    }

    previousCount.value = newData.length
  }, intervalTime)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <!-- <div style="display:none;"></div> -->
  <button v-if="!userInteracted" @click="activateSound" style="position: absolute; right: 0; border: none; background: none; font-size: 5vw;">
    <i class="fa-solid fa-bell"></i>
  </button>
</template>
