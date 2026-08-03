# Funcionalidades do Finance App

Este documento descreve o comportamento atual do aplicativo, incluindo as
funções disponíveis na interface, os cálculos realizados e as operações de
dados executadas no Firebase.

## 1. Acesso e sessão

- **Entrar:** autentica um usuário com e-mail e senha pelo Firebase
  Authentication.
- **Redefinir senha:** envia para o e-mail informado o link de recuperação do
  Firebase.
- **Sair:** encerra a sessão e limpa todos os dados do usuário mantidos na
  memória do navegador.
- **Proteção de rotas:** sem uma sessão válida, qualquer página interna
  redireciona para o login.
- **Troca de usuário:** ao entrar com outra conta, transações, categorias,
  subcategorias, Cofre, mês selecionado e modais são reiniciados antes da nova
  carga.

Existe uma função interna de criação de conta, mas o aplicativo não oferece
autocadastro na interface. Os usuários são administrados no Firebase.

## 2. Navegação e preferências

- **Navegação responsiva:** menu superior no computador e menu inferior no
  celular.
- **Tema claro/escuro:** alterna o tema e mantém a escolha no navegador.
- **Ocultar valores:** substitui valores monetários por pontos e mantém a
  escolha no navegador. Enquanto os valores estão ocultos, as exportações de
  relatório ficam desabilitadas.
- **PWA:** o aplicativo pode ser instalado e mantém os arquivos da interface
  em cache. Os dados financeiros continuam vindo do Firebase.

## 3. Mês selecionado

- Ao abrir o aplicativo, o mês selecionado é o mês atual do dispositivo.
- As setas avançam ou retrocedem um mês.
- O calendário permite escolher diretamente um mês e um ano.
- Transações e objetivo de saldo são carregados separadamente para o mês
  selecionado.
- Ao trocar de usuário, o mês volta ao mês atual.

## 4. Painel mensal

O painel reúne os dados do mês selecionado:

- **Receitas:** soma dos lançamentos classificados como receita.
- **Gastos:** soma dos lançamentos classificados como despesa.
- **Saldo:** receitas menos gastos.
- **Saldo desejado:** valor que o usuário quer ver sobrando no fim do mês.
- **Progresso do objetivo:** `saldo atual / saldo desejado`, limitado entre
  0% e 100%.
- **Cofre:** mostra o saldo total do Cofre e abre seu histórico.
- **Categorias:** apresenta o total mensal de cada categoria de receita e
  despesa.

## 5. Objetivo de saldo

- É definido individualmente para cada mês.
- Representa quanto o usuário deseja que sobre depois de subtrair os gastos
  das receitas.
- Não movimenta dinheiro e não cria uma entrada no Cofre.
- Pode ser criado, atualizado ou removido.
- Um saldo negativo equivale a 0% do objetivo; um saldo acima do objetivo é
  exibido como 100%.

## 6. Categorias

- Cada usuário possui suas próprias categorias no Firestore.
- Se a conta ainda não tiver categorias, o conjunto inicial é carregado de
  `public/default-categories.json`.
- É possível criar uma categoria de receita ou despesa, escolhendo nome,
  ícone e cor.
- Nome, ícone e cor podem ser editados. O tipo não pode ser alterado depois da
  criação para não invalidar lançamentos existentes.
- A interface impede categorias duplicadas com o mesmo nome e tipo.
- Uma categoria não pode ser excluída enquanto possuir lançamentos,
  subcategorias ou planos parcelados.

## 7. Subcategorias

- Uma subcategoria pertence a uma categoria e vale para todos os meses.
- É criada dentro do detalhe da categoria.
- A interface impede nomes duplicados dentro da mesma categoria.
- Ao excluir uma subcategoria, seus lançamentos são preservados. Eles passam a
  aparecer como lançamentos gerais ou como referência a uma subcategoria
  removida nos relatórios.

## 8. Lançamentos

- Um lançamento pertence a uma categoria e, opcionalmente, a uma
  subcategoria.
- Guarda descrição, valor, data, observação e tipo.
- O mês do lançamento é calculado automaticamente a partir da data.
- A categoria define se o lançamento é receita ou despesa.
- A inclusão, edição e exclusão são feitas dentro do detalhe de uma categoria
  no painel.
- Gastos criados a partir de uma retirada do Cofre recebem a identificação
  **Pago com o Cofre** e permanecem vinculados à movimentação original.
- Ao editar um gasto pago com o Cofre, valor, descrição, data e observação da
  retirada são atualizados na mesma operação.
- Alterar a data para outro mês remove o lançamento da visão mensal atual e o
  faz aparecer no novo mês.
- A página **Lançamentos** consolida todas as receitas e despesas do mês, mas é
  uma visão somente de consulta.

## 9. Parcelamentos

- Recebe categoria, subcategoria opcional, descrição, data da compra, valor
  total, quantidade de parcelas e observação.
- A primeira parcela é criada no dia 1 do mês seguinte à compra.
- Todas as parcelas futuras são criadas de uma vez no Firestore.
- O valor total é distribuído em centavos, garantindo que a soma das parcelas
  seja exatamente igual ao total informado.
- O limite atual é de 360 parcelas e nenhuma parcela pode ser menor que
  R$ 0,01.
- A criação do plano e de todas as parcelas é atômica: ou tudo é salvo ou nada
  é salvo.
- O projeto possui funções internas para listar e excluir um plano completo,
  mas ainda não há uma tela para administrar os planos já criados.

## 10. Cofre

- O Cofre é um controle separado das receitas e despesas mensais.
- **Depósito:** aumenta o saldo do Cofre.
- **Retirada:** reduz o saldo do Cofre.
- Ao retirar, o usuário escolhe entre **Pagar uma despesa** e **Apenas retirar
  do Cofre**.
- Em **Pagar uma despesa**, categoria e subcategoria são informadas e o
  sistema cria o gasto mensal e a retirada em uma única gravação atômica.
- Em **Apenas retirar**, nenhuma receita ou despesa mensal é criada.
- O saldo é a soma dos depósitos menos a soma das retiradas.
- A interface impede uma retirada maior que o saldo apresentado.
- Cada movimentação guarda descrição, valor, data e observação.
- Movimentações podem ser criadas ou excluídas; retiradas vinculadas são
  atualizadas ao editar o gasto correspondente.
- Ao excluir uma retirada vinculada, o usuário decide se o gasto também será
  excluído. Se mantido, ele se torna um gasto comum.
- Ao excluir um gasto vinculado, o usuário decide se a retirada também será
  removida, devolvendo o valor ao saldo do Cofre. Se mantida, ela se torna uma
  retirada comum.
- Depositar ou retirar não cria automaticamente um lançamento mensal.
  A exceção é quando o destino **Pagar uma despesa** é escolhido.

## 11. Relatórios

- O usuário seleciona o mês inicial e o mês final.
- O aplicativo busca todas as transações do período e monta um centro de
  custos hierárquico: categoria e subcategoria.
- Exibe totais de receitas, gastos e saldo.
- Mostra separadamente quanto dos gastos foi pago com o Cofre, sem retirar
  esse valor do total de gastos.
- Exibe gráfico de barras do resumo e gráfico de gastos por categoria.
- Categorias sem movimentação no período não aparecem.
- Lançamentos de uma subcategoria excluída continuam contabilizados.
- **PDF:** exporta resumo e centro de custos.
- **Excel:** exporta resumo, receitas, gastos e transações detalhadas. As
  transações usam os nomes de categoria e subcategoria, não os identificadores
  internos do banco, e informam se a origem foi o Cofre ou o saldo do mês.

## 12. Estado e mensagens

- Zustand mantém em memória os dados necessários para a tela atual.
- Inclusões, alterações e exclusões atualizam a tela sem exigir uma nova carga
  completa.
- Indicadores de carregamento bloqueiam ações duplicadas durante gravações.
- Notificações informam sucesso, aviso ou falha nas operações.
- Modais prendem o foco, fecham com `Esc` e impedem a rolagem da página ao
  fundo.

## 13. Organização dos dados

Cada conta utiliza documentos abaixo de `users/{uid}`:

- `categories`: categorias do usuário;
- `subcategories`: subcategorias;
- `transactions`: receitas e despesas;
- `savingsGoals`: objetivos mensais de saldo;
- `installmentPlans`: planos de parcelamento;
- `vault`: movimentações do Cofre.

As regras do Firestore exigem autenticação e permitem que cada usuário acesse
somente os documentos sob o próprio `uid`.

## 14. Funções internas sem interface própria

- Criação de usuário por e-mail e senha.
- Consulta de subcategorias de uma única categoria diretamente no Firestore.
- Listagem e exclusão completa de planos parcelados.
- Utilitários para listas extensas de meses e formatos curtos de mês.
- Componente genérico de cartão.

Essas funções podem apoiar telas futuras, mas atualmente não são acionadas
diretamente pelo usuário.

## 15. Melhorias futuras recomendadas

- Criar uma tela de gerenciamento de parcelamentos, com consulta e exclusão do
  plano completo.
- Permitir editar diretamente as movimentações comuns do Cofre.
- Adicionar filtros e ações de edição diretamente na página Lançamentos.
- Adicionar Firebase App Check para reduzir chamadas feitas por clientes não
  autorizados.
- Criar testes integrados contra o Firebase Emulator Suite.
