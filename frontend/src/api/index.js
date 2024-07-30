async function loginUser(email, password){
     const user = await fetch('/login',{
        method: 'post',
        body: JSON.stringify({email: email, password: password}),
        headers: {
            'content-type': 'application/json'
        } 
    }).then(res =>{ return res.json()})
    return user
} 

async function logoutUser(){
    const log = await fetch('/logout').then(res =>{return res.text()})
   return log
} 

async function regUser(name, email, password){
    const user = await fetch('/registrate',{
       method: 'post',
       body: JSON.stringify({ email: email, password: password, name: name}),
       headers: {
           'content-type': 'application/json'
       } 
   }).then(res =>{ return res.json()})
   return user
} 

async function deleteUser(){
    const del = await fetch('/deleteuser').then(res =>{return res.text()})
   return del
} 

async function updateUser(name, email, password){
    const user = await fetch('/updateuser',{
       method: 'post',
       body: JSON.stringify({ email: email, password: password, name: name}),
       headers: {
           'content-type': 'application/json'
       } 
   }).then(res =>{ return res.json()})
   return user
} 

async function checkSession(){
    const code = await fetch('/session').then(res =>{ return res.status})
   return code
} 

async function saveChartsData(data){
    const save = await fetch('/savechart',{
       method: 'post',
       body: JSON.stringify(data),
       headers: {
           'content-type': 'application/json'
       } 
   }).then(res =>{ return res.text()})
   return save
} 

export  {
    loginUser,
    logoutUser,
    regUser,
    deleteUser,
    updateUser,
    checkSession,
    saveChartsData
} 