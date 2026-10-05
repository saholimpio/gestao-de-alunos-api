import { expect } from 'chai';
import { api } from '../helpers/api.js';
import { comTokenDeAdmin } from '../helpers/auth.js';
import { novoAluno } from '../factories/alunosFactory.js';

describe('POST /api/admin/alunos', () => {
    it('deve cadastrar um aluno como administrador e retornar 201', async () => {
        const tokenAdmin = await comTokenDeAdmin();
        const aluno = novoAluno();

        const resposta = await api()
            .post('/api/admin/alunos')
            .set('Authorization', tokenAdmin)
            .send(aluno);

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.email).to.equal(aluno.email);
        expect(resposta.body).to.not.have.property('senha');
    });
});
