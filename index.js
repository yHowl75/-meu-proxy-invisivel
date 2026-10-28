const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

// Interface Visual com a Barra de Endereço
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Gateway de Conexão Camuflada</title>
            <style>
                body { background-color: #0b0b0f; color: #f1f1f4; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .wrapper { text-align: center; max-width: 500px; width: 90%; padding: 40px 30px; background: #12121a; border-radius: 12px; border: 1px solid #1f1f2e; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                h1 { color: #3b9eff; font-size: 24px; margin-bottom: 8px; }
                p { color: #76768a; font-size: 14px; margin-bottom: 28px; }
                .input-group { display: flex; gap: 8px; }
                input { flex: 1; padding: 14px 18px; border-radius: 8px; border: 1px solid #2a2a3d; background: #0b0b0f; color: #fff; font-size: 16px; outline: none; }
                button { padding: 14px 28px; background: #007bff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
                button:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <h1>Redirecionamento Seguro</h1>
                <p>Insira o domínio de destino para estabelecer a conexão proxy.</p>
                <div class="input-group">
                    <input id="targetUrl" placeholder="Exemplo: poki.com" onkeydown="if(event.key==='Enter') executarGateway()">
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

// SISTEMA CORRIGIDO: Captura o site de forma limpa usando parâmetros nomeados do Express
app.get('/gateway/:target*', async (req, res) => {
    // Pega o site principal (ex: poki.com) e junta com o resto do caminho que vier depois dele
    let targetSite = req.params.target + (req.params[0] || '');

    if (!targetSite) {
        return res.status(400).send('Erro: Nenhum site inserido.');
    }

    // Adiciona o protocolo seguro caso não tenha
    if (!targetSite.startsWith('http://') && !targetSite.startsWith('https://')) {
        targetSite = 'https://' + targetSite;
    }

    try {
        const parsedUrl = new URL(targetSite);

        // Faz o download camuflado da página simulando o Chrome
        const response = await axios({
            method: 'get',
            url: parsedUrl.href,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'host': parsedUrl.host
            },
            timeout: 15000
        });

        // Limpa todas as travas anti-iframe das escolas
        const headers = { ...response.headers };
        delete headers['content-security-policy'];
        delete headers['content-security-policy-report-only'];
        delete headers['x-frame-options'];
        headers['access-control-allow-origin'] = '*';

        res.writeHead(response.status, headers);
        response.data.pipe(res);

    } catch (error) {
        if (!res.headersSent) {
            res.status(502).send(`
                <html style="background:#111;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
                    <div style="text-align:center; max-width: 600px; padding: 20px;">
                        <h3 style="color: #ff4a4a;">Erro de Conexão no Servidor</h3>
                        <p style="color:#aaa;">Não foi possível mascarar este site específico.</p>
                        <p style="color:#777;font-size:13px; background: #222; padding: 10px; border-radius: 4px;">Detalhes: ${error.message}</p>
                        <button onclick="window.location.href='/'" style="padding:10px 20px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">Voltar</button>
                    </div>
                </html>
            `);
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR UNBLOCKER RODANDO NA PORTA ${PORT}`);
});
