async function loginUser(email, password){
     const user = await fetch('/login',{
        method: 'post',
        body: JSON.stringify({email: email, password: password}),
        headers: {
            'content-type': 'application/json'
        } 
    })
    return user
} 

export  {
    loginUser
} 