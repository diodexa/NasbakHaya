<template>
    <div >
        <p>
            {{ currentDate }}
        </p>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';


const currentDate = ref("")

const updateTime = ()=> {
    const now = new Date ()
    currentDate.value = now.toLocaleDateString("id-ID")
}
onMounted(()=>{
    updateTime()
    setInterval(updateTime,1000)
})
</script>

<style lang="scss" scoped>

</style>