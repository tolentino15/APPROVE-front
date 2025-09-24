<script setup lang="ts">
function showAlert() {
  window.alert('Botão Vuetify!')
}
</script>

<template>
  <v-app>
    <v-btn color="primary" @click="showAlert">Botão Vuetify</v-btn>
    <v-main>
      <v-container class="py-4">
        <h1>Vue + Vuetify funcionando!</h1>
        <v-btn color="primary" @click="showAlert">Botão Vuetify</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped></style>
