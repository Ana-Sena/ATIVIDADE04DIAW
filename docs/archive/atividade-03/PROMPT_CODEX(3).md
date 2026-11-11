# Prompt para gerar o projeto

Implemente uma Pokédex acadêmica completa em React + Vite com JavaScript/JSX. Leia PLANO_IMPLEMENTACAO.md, GUIA_VISUAL.md, ATIVIDADE 03.md, pokedex-data.json e referência visual quando fornecida. Priorize decisões do plano, requisitos acadêmicos, dados originais e referência visual. Não copie valores ilustrativos do mockup.

O repositório será novo. Inspecione diretório e instruções locais, preservando trabalho existente. Crie código completo, configuração Vite, componentes, CSS, fallbacks, package.json, lockfile e README. Sem backend/banco. Se JSON faltar, solicite o material; não invente dados ou os substitua pela API.

Implemente:
1. Abas Pokémon/Treinadores e layout responsivo de álbum de cartas.
2. JSON original preservado em src/data como fonte textual.
3. Busca por nome parcial/ID exato (25, 025, #025), filtro por tipo, ordenação por ID/nome/seis atributos crescente/decrescente, combinados e com estado vazio.
4. Frente Pokémon com ID/imagem/nome/tipos; verso com seis atributos, números e barras em escala global comum.
5. Clique/Enter/Espaço vira/desvira; várias cartas viradas; hover só destaca; sem botão Voltar.
6. Único painel flutuante referente ao último Pokémon virado. X/Escape fecha só painel. Desvirar carta vinculada fecha painel; outra não altera. Sem retorno automático a perfil anterior. Ocultar carta vinculada por filtro ou trocar aba fecha painel. Seguir tabela do plano.
7. Painel não modal com todos os treinadores associados e equipes, sem desaparecer sozinho ou bloquear cartas; parte inferior no celular. Mensagem se não houver treinador.
8. Doze cards de treinador: retrato/nome na frente, quantidade de insígnias/equipe no verso. Vários virados. Não abrir painel ao virar treinador. Preservar ordem/duplicatas em pokemonIds, com chaves por posição.
9. Imagens official-artwork da PokéAPI por ID, com URLs validadas e fallback. API só para imagens, com cache, sem substituir JSON. Retratos locais por ID, avatar provisório quando faltar; não bloquear código por falta deles.
10. Tema claro inicial, escuro alternável, escolha persistida; teclado, foco, labels, faces ocultas inacessíveis, contraste e redução de movimento.

Use componentes funcionais, props, useState, map e eventos com clareza para estudantes. Derive listas e relações sem estados redundantes. Prefira CSS a bibliotecas extras. Sem favoritos, comparação dedicada, login ou edição.

Conclua e valide build, lint se disponível, filtros/ordenação, cartas independentes, transições do painel, duplicatas, tipo vazio, falha de imagem, tema e celular/desktop. Testes úteis se necessários, sem declarar verificações não executadas.

README: instalação, execução, endereço local, build/preview, dados, estrutura, fontes, dependências e comportamentos. Campos de autoria da dupla sem inventar contribuições. Não publicar, criar remoto ou fazer push sem solicitação.

Ao concluir, explique como executar, validações reais e retratos ainda provisórios.


## Histórico Git e Conventional Commits — obrigatório

A avaliação acadêmica considera o histórico de desenvolvimento. Faça commits locais ao longo da implementação, após concluir e verificar cada unidade coerente de trabalho. Não deixe todo o código para um único commit final e não implemente tudo primeiro para depois repartir artificialmente o histórico.

Antes de começar, inspecione git status e o histórico existente. Se a pasta do novo projeto ainda não for um repositório, inicialize Git nela. Configure .gitignore antes do primeiro commit, excluindo node_modules, dist, arquivos temporários e segredos. Inclua o lockfile. Não inclua mudanças alheias à tarefa nem sobrescreva trabalho existente.

Formato: tipo(escopo): descrição curta em português, por exemplo feat(pokemon): adiciona pesquisa por nome e ID. Escopo pode ser omitido quando não ajudar. Tipos: feat para funcionalidade, fix para correção, style apenas para formatação de código sem alterar comportamento, refactor para reorganização sem alterar comportamento, docs para documentação, test para testes e chore para configuração/manutenção. Mudanças visuais de produto usam feat(ui) ou fix(ui), não style.

Sequência orientativa, adaptada ao trabalho real:
1. chore(setup): configura projeto React com Vite e gitignore
2. feat(data): integra JSON e resolve equipes dos treinadores
3. feat(pokemon): exibe cartas com imagens e tipos
4. feat(search): adiciona pesquisa e filtro por tipo
5. feat(sort): adiciona ordenação por nome ID e atributos
6. feat(cards): implementa virada independente e atributos
7. feat(trainers): adiciona perfil flutuante contextual
8. feat(trainers): implementa cartas e equipes dos treinadores
9. feat(theme): adiciona temas claro e escuro com persistência
10. feat(ui): adapta layout para dispositivos móveis e teclado
11. fix(...): corrige problemas concretos encontrados na validação
12. docs(readme): documenta execução dados e fontes

Esta sequência não é uma quota: não criar commits vazios, correções inventadas ou alterações triviais apenas para aumentar a contagem. Cada commit precisa registrar progresso real e coerente. É aceitável combinar etapas inseparáveis ou dividir uma etapa grande em entregas menores.

Antes de cada commit, revisar git diff, selecionar explicitamente arquivos relacionados e executar a verificação adequada à etapa. Após existir uma aplicação compilável, confirmar build nas etapas relevantes; não comitar falhas conhecidas como se estivessem concluídas. Correções posteriores ficam em novos commits.

Os commits locais durante a implementação estão autorizados por este prompt. Não aguardar autorização a cada etapa. Isso não autoriza criar repositório remoto, publicar ou fazer push. Não executar squash, amend, rebase ou reescrever o histórico para fabricar evolução; preservar os commits incrementais. Não inventar datas, autores ou participação da dupla. Se a identidade Git estiver ausente, informar o bloqueio e solicitar nome/e-mail, sem inventá-los ou alterar configuração global.

Ao finalizar, apresentar resumo dos commits reais com hash curto e mensagem, verificações executadas e estado do diretório de trabalho. Não afirmar que commits foram criados se não foram.

