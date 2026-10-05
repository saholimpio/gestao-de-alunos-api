import { api } from './api.js';
import 'dotenv/config';

let tokenEmCache = null;

// Helper de login do ADMIN: usa as credenciais do .env e guarda o token em cache.
export async function comTokenDeAdmin() {
    if (!tokenEmCache) {
        const loginResposta = await api()
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: process.env.ADMIN_EMAIL,
                senha: process.env.ADMIN_SENHA
            });

        tokenEmCache = loginResposta.body.token;
    }

    return `Bearer ${tokenEmCache}`;
}

// Retorna apenas o token (sem o prefixo Bearer) para o e-mail e senha informados.
export async function getToken(emailUser, passUser) {
    const loginResposta = await api()
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            email: emailUser,
            senha: passUser
        });

    return loginResposta.body.token;
}

// Helper de login do USUARIO (aluno): pronto para usar no .set('Authorization', ...).
export async function comTokenDeAluno(emailAluno, senhaAluno) {
    const token = await getToken(emailAluno, senhaAluno);
    return `Bearer ${token}`;
}
