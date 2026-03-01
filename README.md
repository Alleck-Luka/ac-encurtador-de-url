# Encurtador de URL

API simples para encurtar URL, junto de uma implementação de front para testá-la.
Possui os métodos:

- Encurtar dada URL;
- Retornar URL original por id de encurtamento;
- Retornar todas as URLs encurtadas por dada data;
- Redirecionar para URL original a partir de URL encurtada.

### Como rodar

```bash
git clone https://github.com/Alleck-Luka/ac-encurtador-de-url.git
cd ac-encurtador-de-url
docker compose up -d
```

## Endpoints

- localhost:3000/ //Frontend
- (post) localhost:3000/shorten //Encurtador
- (get) localhost:3000/id/:id //Redirecionar via id
- (get) localhost:3000/date/:date //Retorna todas as urls por data
