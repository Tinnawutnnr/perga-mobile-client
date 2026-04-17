const axios = require('axios');
axios.post('http://localhost:8000/api/v1/auth/register', {
  email: 'test@example.com',
  username: 'testuser123',
  password: 'Password123!',
  role: 'caregiver'
}).catch(err => console.log(JSON.stringify(err.response.data, null, 2)));
