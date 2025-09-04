const fetch = require("node-fetch");

async function fetchStock(parm) {
    try {

        const res = await fetch(parm);
        const contentType = res.headers.get('content-type') || '';

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Non-JSON response:', text.slice(0, 500));
            throw new Error('Response is not JSON');
        }
        
        const data = await res.json();
        return data; 
    } catch (err) {
        console.error('Error fetching stock:', err.message);
        return null; 
    }
}

module.exports = fetchStock;

