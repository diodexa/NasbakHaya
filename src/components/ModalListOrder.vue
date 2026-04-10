<template>
    <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <slot></slot>
            <button class="close-btn" @click="close">✖</button>
        </div>
    </div>
</template>

<script setup>
defineProps({
  show: Boolean
})

const emit = defineEmits(["close"])

const close = () => {
  emit("close")
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  position: relative;
  min-width: 300px;
  max-width: 90%;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

</style>