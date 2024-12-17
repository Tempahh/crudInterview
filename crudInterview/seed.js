const express = require('express');
const User = require('./models/user');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcrypt');


//seed admin user
async function seedAdmin() {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        try {
            const adminUser = new User({
            name: 'Admin',
            firstName: 'Admin',
            email: 'admin@crud.com',
            country: 'Nigeria',
            password: 'titanium',
            role: 'admin',
            verified: true,
            })
            await adminUser.save();
            console.log('Admin user created');
        } catch (err) {
            console.error('Failed to create admin user', err);
}
}}

module.exports = seedAdmin;