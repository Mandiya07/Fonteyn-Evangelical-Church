const fs = require('fs');
const fetch = require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://localhost:3000/api/members');
    const data = await res.json();
    console.log("Local Members:", data.length);
  } catch (e) {
    console.error("Local error:", e.message);
  }
}
check();
