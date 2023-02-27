---
title: "Internacionalizando esse site"
author: "William Martins"
date: 2023-02-27T22:08:34-03:00
---

No momento que escrevo essa postagem, meu site pessoal usa Gatsby como gerador
de site estático. Há tempos que gostaria de escrever um pouco mais em português
por aqui, porém, nunca tive tempo e paciência para mexer nesse site de forma que
eu possa, com uma certa facilidade, escrever tanto em inglês quanto em
português.

Tirei um tempinho para tentar fazer isso de uma maneira simples. O que
encontrei, primeiramente, foram várias dependências desatualizadas e uma versão
de Gatsby que, aparentemente, só funciona em versões mais antigas de Node.js.
Minha primeira tarefa foi atualizar essas dependências, o que funcionou super
bem, porém, já vi que tenho vários _Warnings_ para olhar. O que me impressionou
muito foi o fato de tudo funcionar, mesmo passando por 3 atualizações _major_
(atualizando da versão 2 para 5)!

O próximo passo até que foi simples. Criei uma nova página chamada `pt-br` para
ser a versão em português desse site. Essa página faz duas coisas bastante
simples:

- Consulta todos os posts escritos em português (`content/post/pt-br`)
- Informa ao componente `Layout` que o mesmo deve renderizar em português
  - Lá, existe uma abstração bem simples para o menu em duas línguas

Isso por si só já fez várias coisas funcionar. Porém, os posts já escritos
passaram a ter o _slug_ com `en-us` em função de eu ter criado uma pasta para
posts de cada língua. A solução também acabou sendo bem simples: na função
[`createFilePath`](https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/?=files#createfilepath),
posso especificar que, caso a lingua seja `en-us`, o `basePath` passa a ser
`post/en-us`.

Um outro pequeno problema é o fato de que, quando fazia o acesso do post escrito
em português, o menu estava sendo renderizado em inglês. Resolver isso também é
relativamente simples. Adicionei um novo campo (`createNodeField`) para cada
post contendo a língua escrita. Esse valor é extraído com uma expressão regular
em cima do caminho do post. Com isso, quando fazemos a renderização do post,
agora sabemos a língua e podemos passar essa informação para o componente de
Layout.

_Voilà_, agora temos agora posts escritos em português.

Talvez essa não seja a melhor forma de fazer isso e entendo que existem plugins
que resolvem esse tipo de problema. Porém, os plugins normalmente fazem muitas
mágicas. Prefiro iniciar com algo que tenho controle e contexto e,
posteriormente, caso faça sentido, posso migrar para algum plugin.

Uma nota mental para mim mesmo para o futuro desse site é:

- Resolver os _warnings_
- Considerar migrar de Gatsby para Next
- Reorganizar os arquivos e pastas
- Considerar migrar a codebase para TypeScript
- Verificar como formatar as datas para as postagens também terem as datas internacionalizadas