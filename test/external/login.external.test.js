import { expect } from 'chai';
import 'dotenv/config';
import { api } from '../helpers/api.js';
import { comTokenDeAdmin } from '../helpers/auth.js';
import { novoAluno } from '../factories/alunosFactory.js';
import loginsInvalidos from '../fixtures/loginsInvalidos.json' with { type: 'json' };

describe('POST /api/auth/login', () => {
    it('deve logar como administrador e retornar 200 com token', async () => {
        const resposta = await api()
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: process.env.ADMIN_EMAIL,
                senha: process.env.ADMIN_SENHA
            });

        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.property('token');
        expect(resposta.body.usuario.role).to.equal('admin');
    });

    it('deve logar como aluno recém-cadastrado e retornar 200 com token', async () => {
        const tokenAdmin = await comTokenDeAdmin();
        const aluno = novoAluno();
        await api()
            .post('/api/admin/alunos')
            .set('Authorization', tokenAdmin)
            .send(aluno);

        const resposta = await api()
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({ email: aluno.email, senha: aluno.senha });

        expect(resposta.status).to.equal(200);
        expect(resposta.body).to.have.property('token');
        expect(resposta.body.usuario.role).to.equal('aluno');
    });

    // Data-Driven Testing: um mesmo teste executado para cada item do JSON
    loginsInvalidos.forEach((teste) => {
        it(teste.titulo, async () => {
            const resposta = await api()
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send(teste.credenciais);

            expect(resposta.status).to.equal(teste.statusCodeEsperado);
        });
    });
});
