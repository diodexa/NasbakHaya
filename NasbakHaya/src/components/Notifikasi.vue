<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue"
import { fetchTodayOrders } from "@/services/orderService"

const intervalTime = 5000
let intervalId = null
const previousCount = ref(0)

const notificationSound = new Audio('/notification.mp3')

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
  <div style="display:none;"></div>
</template>
