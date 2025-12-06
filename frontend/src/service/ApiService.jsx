import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Globe, MapPin, LogOut, Loader2 } from 'lucide-react';


const API_BASE = 'http://localhost:5000/api';



const authService = {
register: async (userData) => {
const res = await fetch(`${API_BASE}/user/register`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(userData),
credentials: 'include',
});
return res.json();
},


login: async (credentials) => {
const res = await fetch(`${API_BASE}/user/login`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(credentials),
credentials: 'include',
});
return res.json();
},


getProfile: async () => {
const res = await fetch(`${API_BASE}/user/profile`, {
method: 'GET',
credentials: 'include',
});
return res.json();
},


updateProfile: async (updates) => {
const res = await fetch(`${API_BASE}/user/profile`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
credentials: 'include',
body: JSON.stringify(updates),
});
return res.json();
},


logout: async () => {
const res = await fetch(`${API_BASE}/user/logout`, {
method: 'POST',
credentials: 'include',
});
return res.json();
},
};

export default authService;