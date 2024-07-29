
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
    <input id="name" v-model="nameUserReg" type="text" placeholder="name"/>
    <input id="login" v-model="emailUserReg" type="text" placeholder="email"/>
    <input id="password" v-model="passwordUserReg1" type="password" placeholder="password"/>
    <input id="password"  v-model="passwordUserReg2" type="password" placeholder="Confirm password"/>
    <div class="button"@click="letReg" >
      <span>Login</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  
  let authStat = ref('Login')
  let name = ref()

  onMounted(()=>{
    if(sessionStorage.name){
      authStat.value = 'logout';
      name.value = sessionStorage.name;
    }
  })


  // Login modal window open/close ------------------------------ 
  let loginOpen = ref(false)
  let registrOpen = ref(false)
 
  import {  logoutUser } from '../api/index'

  async function openLogin(){
    console.log('****',authStat.value)
    if (authStat.value === 'logout'){
      const log = await logoutUser()
      if(log === 'out'){
        authStat.value = 'login';
        name.value = null;
        sessionStorage.removeItem('name'); 
      }
    } else loginOpen.value = true
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

let emailUser = ref()
let passwordUser = ref()

async function letLogin(){
  
  const user = await loginUser(emailUser.value, passwordUser.value)
  console.log(user)
  if(user){
    authStat.value = 'logout';
    name.value = user.name;
    sessionStorage.setItem('name', user.name); 
    closeLogin();
   
  }

  
}


// Registartion handler -------------------------------------------------
import { regUser } from '../api/index'

let nameUserReg = ref()
let emailUserReg = ref()
let passwordUserReg1 = ref()
let passwordUserReg2 = ref()

async function letReg(){
  if(passwordUserReg1.value != passwordUserReg2.value) return console.log('Passwords not match')
  
  const user = await regUser(nameUserReg.value, emailUserReg.value, passwordUserReg1.value)
  if(user){
    authStat.value = 'logout';
    name.value = user.name;
    sessionStorage.setItem('name', user.name); 
    closeReg();
   
  }
}


</script>

