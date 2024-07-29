
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
  <div class="login" v-if="loginOpen">
    <div class="close" @click="closeLogin">close</div>
    <input id="login" v-model="emailUser" type="text" placeholder="email"/>
    <input id="password" v-model="passwordUser" type="password" placeholder="password"/>
    <div class="button" @click="letLogin">
      <span>Login</span>
    </div>
    <div class="registr"@click="openReg" >
      <span >Registration</span>
    </div>
  </div>
  <div class="login reg" v-if="registrOpen">
    <div class="close" @click="closeReg">close</div>
    <input id="name" type="text" placeholder="name"/>
    <input id="login" type="text" placeholder="email"/>
    <input id="password" type="password" placeholder="password"/>
    <input id="password" type="password" placeholder="Confirm password"/>
    <div class="button">
      <span>Login</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  
  // Login modal window open/close ------------------------------ 
  let loginOpen = ref(false)
  let registrOpen = ref(false)
 
  function openLogin(){
    loginOpen.value = true
  }
  function closeLogin(){
    loginOpen.value = false
  }
  function openReg(){
    loginOpen.value = false
    registrOpen.value = true
  }
  function closeReg(){
    registrOpen.value = false
  }

// Login handler -------------------------------------------------
import { loginUser } from '../api/index'
let authStat = ref('Login')
let name = ref()
let emailUser = ref()
let passwordUser = ref()

function letLogin(){
  const user = loginUser(emailUser.value, passwordUser.value)
  console.log(user)
}



</script>

