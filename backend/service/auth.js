const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../db/models/user');

async function login(email, passwordIn) {
    try {
        const user = await User.findOne({email: email })
        console.log(user)
     
        const match = await bcrypt.compare( passwordIn, user.password);
        if (match) {
            return user
        } else {
            return Promise.reject('wrong username or password');
        }
    } catch(err) {
        return Promise.reject('user not found');
    }
}

async function registrate(email, password, name) {
    try {
        const user = await User.findOne({ email: email })
        console.log('new>>', email, password, name)
        console.log('user>>', user)
        if (!user) {
            console.log('set')
            
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                name: name,
                email: email,
                password: password
            })
            await user.save()
            return user
        } else {
            return Promise.reject(`User whith login '${email}' already exist! `);
        }
    } catch(err) {
        return Promise.reject('user not found');
    }
}

async function updateUser(id, email, password, name) {
    try {
        console.log(id, login, password, name)
        await User.updateOne({_id: id}, 
            {
               $set: {
                    name: name,
                    login: email,
                    password: password
                }
            }
        )
        const updatedUser = await User.findOne({_id: id})
        console.log('updateUser>', updatedUser)

        if (updatedUser) {
            return updatedUser
        } else {
            return Promise.reject('wrong updated id');
        }
    } catch(err) {
        return Promise.reject('user not updated', err );
    }
}

async function deleteUser(id) {
    try {
        const deleted = await User.deleteOne({_id: id+1})

        if (deleted.deletedCount) {
            return true
        } else {
            return Promise.reject('wrong deleted id');
        }
    } catch(err) {
        return Promise.reject('user not deleted', err);
    }
}

module.exports = {
    login,
    registrate,
    updateUser,
    deleteUser
};