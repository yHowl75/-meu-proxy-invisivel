const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Gateway de Conexão Camuflada</title>
            <style>
                body { background-color: #0b0b0f; color: #f1f1f4; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .wrapper { text-align: center; max-width: 500px; width: 90%; padding: 40px 30px; background: #12121a; border-radius: 12px; border: 1px solid #1f1f2e; }
                .input-group { display: flex; gap: 8px; }
                input { flex: 1; padding: 14px 18px; border-radius: 8px; border: 1px solid #2a2a3d; background: #0b0b0f; color: #fff; font-size: 16px; outline: none; }
                button { padding: 14px 28px; background: #007bff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <h1>Redirecionamento Seguro</h1>
                <div class="input-group">
                    <input id="targetUrl" placeholder="Exemplo: poki.com">
                    <button onclick="executarGateway()">Conectar</button>
                </div>
            </div>
            <script>
                function executarGateway() {
                    let endpoint = document.getElementById('targetUrl').value.trim();
                    if (!endpoint) return;
                    endpoint = endpoint.replace(/^https?:\\/\\//i, '');
                    window.location.href = '/gateway/' + endpoint;
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/gateway/*any', async (req, res) => {
    const targetUrlRaw = req.originalUrl.substring(9); 
    let targetUrl = targetUrlRaw.startsWith('http') ? targetUrlRaw : 'https://' + targetUrlRaw;

    try {
        const response = await axios({
            method: 'get',
            url: targetUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        res.writeHead(response.status, { 'access-control-allow-origin': '*', 'content-type': response.headers['content-type'] });
        response.data.pipe(res);
    } catch (error) {
        res.status(502).send('Erro de gateway externo: ' + error.message);
    }
});

app.listen(PORT, () => console.log('Servidor ativo na nuvem.'));
