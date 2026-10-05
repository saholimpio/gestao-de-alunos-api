import { expect } from 'chai';
import { api } from '../helpers/api.js';
import { comTokenDeAdmin, comTokenDeAluno } from '../helpers/auth.js';
import { novoAluno } from '../factories/alunosFactory.js';
import { novaDisciplina } from '../factories/disciplinasFactory.js';
import trabalhos from '../fixtures/trabalhos.json' with { type: 'json' };
import trabalhosInvalidos from '../fixtures/trabalhosInvalidos.json' with { type: 'json' };

// Prepara o fluxo: login admin -> cadastra aluno -> cadastra disciplina -> matricula -> login aluno
async function prepararAlunoMatriculado() {
    const tokenAdmin = await comTokenDeAdmin();

    const dadosAluno = novoAluno();
    const alunoResposta = await api()
        .post('/api/admin/alunos')
        .set('Authorization', tokenAdmin)
        .send(dadosAluno);
    const alunoId = alunoResposta.body.id;

    const disciplinaResposta = await api()
        .post('/api/admin/disciplinas')
        .set('Authorization', tokenAdmin)
        .send(novaDisciplina());
    const disciplinaId = disciplinaResposta.body.id;

    await api()
        .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
        .set('Authorization', tokenAdmin)
        .send({ alunoId });

    const tokenAluno = await comTokenDeAluno(dadosAluno.email, dadosAluno.senha);

    return { alunoId, disciplinaId, tokenAluno };
}

describe('POST /api/alunos/:alunoId/trabalhos', () => {
    describe('Cenários positivos', () => {
        trabalhos.forEach((teste) => {
            it(teste.titulo, async () => {
                const { alunoId, disciplinaId, tokenAluno } = await prepararAlunoMatriculado();

                const resposta = await api()
                    .post(`/api/alunos/${alunoId}/trabalhos`)
                    .set('Authorization', tokenAluno)
                    .send({ disciplinaId, ...teste.dadosTrabalho });

                expect(resposta.status).to.equal(teste.statusCodeEsperado);
                expect(resposta.body.alunoId).to.equal(alunoId);
                expect(resposta.body.disciplinaId).to.equal(disciplinaId);
                expect(resposta.body.titulo).to.equal(teste.dadosTrabalho.titulo);
            });
        });
    });

    describe('Cenários negativos', () => {
        trabalhosInvalidos.forEach((teste) => {
            it(teste.titulo, async () => {
                const { alunoId, disciplinaId, tokenAluno } = await prepararAlunoMatriculado();

                const resposta = await api()
                    .post(`/api/alunos/${alunoId}/trabalhos`)
                    .set('Authorization', tokenAluno)
                    .send({ disciplinaId, ...teste.dadosTrabalho });

                expect(resposta.status).to.equal(teste.statusCodeEsperado);
            });
        });
    });
});
