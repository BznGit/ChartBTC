
<template>
  <div class="header">
    <div class="items logo">
      <span>ChartBTC</span>
    </div>
    <div class="items">
     <h2>{{ name }}</h2>
    </div>
    <div class="items" @click="openLogin">
      <span>{{authStat}}</span>
    </div>
  </div>
  <div class="login" v-if="login">
    <div class="close" @click="closeLogin">close</div>
    <input id="login" type="text" placeholder="login"/>
    <input id="password" type="password" placeholder="password"/>
    <div class="button">
      <span>Login</span>
    </div>
    <div class="registr"@click="openReg" >
      <span >Registration</span>
    </div>
  </div>
  <div class="login reg" v-if="registr">
    <div class="close" @click="closeReg">close</div>
    <input id="name" type="text" placeholder="name"/>
    <input id="login" type="text" placeholder="login"/>
    <input id="password" type="password" placeholder="password"/>
    <input id="password" type="password" placeholder="Confirm password"/>
    <div class="button">
      <span>Login</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  let login = ref(false)
  let registr = ref(false)
  let authStat = ref('Login')
  let name = ref()

  function openLogin(){
    login.value = true
  }
  function closeLogin(){
    login.value = false
  }
  function openReg(){
    login.value = false
    registr.value = true
  }
  function closeReg(){
    registr.value = false
  }

</script>

