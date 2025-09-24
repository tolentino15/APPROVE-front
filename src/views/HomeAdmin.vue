<template>
  <v-container>
    <h1>Home Admin</h1>
    <v-btn color="primary" @click="goToCadastroCliente">Ir para Cadastro Cliente</v-btn>
  </v-container>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goToCadastroCliente() {
  router.push({ name: 'CadastroCliente' })
}
</script>
