import axios from 'axios'
import React from 'react'

const Api=axios.create({
    baseURL:"https://localhost:8000/api/v1/users"
})
