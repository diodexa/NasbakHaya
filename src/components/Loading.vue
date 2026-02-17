<template>
  <div v-if="show" class="loading-overlay">
    <div class="loading-box">
      <div class="spinner"></div>
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: "Loading..."
  }
})
</script>

<style scoped>
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
</style>
