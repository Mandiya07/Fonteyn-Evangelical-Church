async function run() {
    console.log("Testing API...");
    try {
        const res = await fetch('http://localhost:3000/api/users');
        const data = await res.json();
        console.log("Users API count:", data.length);
    } catch(e) {
        console.error(e);
    }
}
run();
