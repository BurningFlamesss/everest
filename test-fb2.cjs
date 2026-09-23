const fs = require('fs');
fetch('https://www.facebook.com/eebssbutwal', {
  headers: {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
  }
})
  .then(res => res.text())
  .then(text => fs.writeFileSync('fb.html', text))
  .catch(console.error);
