const https = require('https');

https.get('https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Feebssbutwal&tabs=timeline&width=500&height=5000&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status code:', res.statusCode);
        console.log('Size:', data.length);
        const fs = require('fs');
        fs.writeFileSync('fb-plugin.html', data);
    });
});
