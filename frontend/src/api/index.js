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

async function logoutUser(email, password){
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

export  {
    loginUser,
    logoutUser,
    regUser
} 