
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
  <div class="login reg" v-if="logoutOpen">
    <div class="close" @click="closeLogout">close</div>
    <div class="button"@click="letLogout" >
      <span>Logout</span>
    </div>
    <div class="button"@click="letDelete" >
      <span>Delete user</span>
    </div>
    <div class="button"@click="letUpdateOpen" >
      <span>Update user</span>
    </div>
  </div>
  <div class="login reg" v-if="updateOpen">
    <div class="close" @click="closeUpdate">close</div>
    <input id="name" v-model="nameUserUpdate" type="text" placeholder="name"/>
    <input id="login" v-model="emailUserUpdate" type="text" placeholder="email"/>
    <input id="password" v-model="passwordUserUpdate1" type="password" placeholder="password"/>
    <input id="password"  v-model="passwordUserUpdate2" type="password" placeholder="Confirm password"/>
    <div class="button" @click="letUpdate" >
      <span>Update</span>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  let authStat = ref('Login')
  let name = ref()

  onMounted(()=>{
    currentSession(); 
  })

  // Check current session ---------------------------------
  import {  checkSession } from '../api/index'
  import { useStore } from '../store/store'
  const store = useStore();

  async function currentSession(){
    let code = await checkSession()
    if(code !=204){
      authStat.value = 'Login';
        name.value = null;
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('email');
        store.setCurrUser(false)
    }else{
      if(sessionStorage.name){
        authStat.value = 'Logout';
        name.value = sessionStorage.name;
        store.setCurrUser(true)
      }
    }
  }

  // Login modal window open/close ------------------------------ 
  let loginOpen = ref(false);
  let registrOpen = ref(false);
  let logoutOpen = ref(false);
  let updateOpen = ref(false)

  import {  logoutUser } from '../api/index'

  async function openLogin(){
    console.log(authStat.value)
    if (authStat.value === 'Logout') logoutOpen.value = true;
    else loginOpen.value = true;
  }
  async function letLogout(){
    if (authStat.value === 'Logout'){
      const log = await logoutUser()
      if(log === 'out'){
        authStat.value = 'Login';
        name.value = null;
        sessionStorage.removeItem('name');
        sessionStorage.removeItem('email');
         store.setCurrUser(false)
        logoutOpen.value = false
      }
    } 
  }

  function closeLogout(){
    logoutOpen.value = false
  }
  function closeLogin(){
    loginOpen.value = false
  }
  function openReg(){
    registrOpen.value = true
  }
  function closeReg(){
    registrOpen.value = false
  }
  function closeUpdate(){
    updateOpen.value = false
  }

// Login handler -------------------------------------------------
import { loginUser } from '../api/index'

let emailUser = ref()
let passwordUser = ref()

async function letLogin(){
  const user = await loginUser(emailUser.value, passwordUser.value)
  if(!user.name){ 
    alert(user);

    return
  }else {
    authStat.value = 'Logout';
    name.value = user.name;
    sessionStorage.setItem('name', user.name); 
    sessionStorage.setItem('email', user.email); 
    store.setCurrUser(true)
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

  if(!passwordUserReg1.value || !passwordUserReg2.value) return alert('Passwords not seted')
  if(passwordUserReg1.value != passwordUserReg2.value) return alert('Passwords not match')
  const user = await regUser(nameUserReg.value, emailUserReg.value, passwordUserReg1.value)
  if(user){
    authStat.value = 'Logout';
    name.value = user.name;
    sessionStorage.setItem('name', user.name); 
    sessionStorage.setItem('email', user.email); 
    store.setCurrUser(true)
    closeLogin();
    closeReg(); 
  }
}
// Delete user handler -------------------------------------------------
import { deleteUser } from '../api/index'

async function letDelete(){
    const del = await deleteUser()
    if(del === 'deleted'){
      authStat.value = 'Login';
      name.value = null;
      sessionStorage.removeItem('name');
      sessionStorage.removeItem('email');
      store.setCurrUser(false)
      logoutOpen.value = false
    }
}
// Update user handler -------------------------------------------------
import { updateUser } from '../api/index'

let nameUserUpdate = ref()
let emailUserUpdate = ref()
let passwordUserUpdate1 = ref()
let passwordUserUpdate2 = ref()

 function letUpdateOpen(){
  updateOpen.value = true;
  nameUserUpdate.value = sessionStorage.name;
  emailUserUpdate.value = sessionStorage.email;

 }
async function letUpdate(){
  console.log(passwordUserUpdate1.value)
  if(!passwordUserUpdate1.value || !passwordUserUpdate2.value) return alert('Passwords not seted')
  if(passwordUserUpdate1.value != passwordUserUpdate2.value) return alert('Passwords not match')
  const user = await updateUser(nameUserUpdate.value, emailUserUpdate.value, passwordUserUpdate1.value)
  if(user){
    authStat.value = 'Logout';
    name.value = user.name;
    sessionStorage.setItem('name', user.name); 
    sessionStorage.setItem('email', user.email); 
    store.setCurrUser(true)
    closeUpdate(); 
    closeLogout();
  }
}

</script>

