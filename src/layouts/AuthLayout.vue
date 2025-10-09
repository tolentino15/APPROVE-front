<template>
  <v-app>
    <div class="auth-bg">
      <div class="auth-wrap">
        <!-- Logo do public/Logo.png -->
        <v-img src="/Logo.png" width="220" height="56" contain class="mb-6" />

        <!-- Onde a página de login será renderizada -->
        <slot />
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-bg {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #2f6fe2 0%, #102230 100%);
  display: grid;
  place-items: center;
  padding: 24px;
}
.auth-wrap {
  width: 100%;
  max-width: 520px; /* controla a largura máxima do card de login */
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
