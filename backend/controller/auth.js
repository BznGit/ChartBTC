const authService = require('../service/auth');

async function login(req, res) {
    const { email, passwordIn } = req.body;
    // perform payload validation
    // in prod, always use a validation library like joi
    // for this tutorial, we only do basic validation
    if (!email || !passwordIn) {
        return res.status(400).json('Bad request params - you need to provide an email and a password');
    }

    try {
        console.log('email, password>>', email, passwordIn)
        const user = await authService.login(email, passwordIn);
        console.log('user> ', user)
        req.session.user = user._id.toString();
        res.status(200);
        const obj = {
            name : user.name,
            data: user.data
        }
        res.json(obj)   
    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
}

async function logout(req, res) {
    try {
        if(req.session.user){
            req.session.destroy(()=>{});
            res.send('log out')
            res.status(204);  
        } else {
            req.sent('you not login')
            res.status(204);
        }

    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
}

async function regitrate(req, res) {
    const { email, passwordIn, nameIn } = req.body;
    // perform payload validation
    // in prod, always use a validation library like joi
    // for this tutorial, we only do basic validation
    if (!email || !passwordIn) {
        return res.status(400).json('Bad request params - you need to provide an email and a password');
    }

    try {
        const newUser = await authService.sigin(email, passwordIn, nameIn);
        req.session.user = newUser._id.toString();
        res.status(200);
        const obj = {
            name : newUser.name,
            data: newUser.data
        }
        res.json(obj)
    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
}

async function updateUser(req, res) {
    const { email, passwordIn, nameIn } = req.body;
    try {
        if(req.session.user){
            const updatedUser = await authService.updateUser(req.session.user, email, passwordIn, nameIn);
            const obj = {
                name : updatedUser.name,
                data: updatedUser.data
            }
            res.json(obj)
            res.status(204);  
        } else {
            res.send('updateted')
            res.status(204);
        }

    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
}

async function deleteUser(req, res) {
    try {
        if(req.session.user){
            const deleted = await authService.deleteUser(req.session.user);
            if(deleted){
                req.session.destroy(()=>{});
                res.send(deleted)
                res.status(204);  
            } else {
                res.send('you not deleted')
                res.status(204);
            }
  
        } else {
            res.send('you not login')
            res.status(204);
        }

    } catch(err) {
        console.error(err);
        res.status(401).json(err);
    }
}

module.exports = {
    login,
    logout,
    regitrate,
    updateUser,
    deleteUser
};