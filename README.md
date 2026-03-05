## Visão Geral

A tela de login do BusTap possui os seguintes elementos funcionais:

- Campo de CPF (texto, inputmode numérico, máx. 14 chars)
- Campo de Senha (password)
- Botão **ENTRAR** — chama `irParaHome()`
- Link **"Clique aqui"** — navega para `/cadastro`
- Texto "Esqueceu a senha?" (visual apenas, sem ação implementada)

Validações implementadas no componente:

- CPF e senha não podem estar vazios
- CPF passa por validação de dígitos verificadores
- Em caso de erro, exibe toast com mensagem
- Em caso de sucesso, redireciona para `/home`

---

## Casos de Teste

---

### CT-01 — Renderização da tela de login

**Tipo:** Funcional / Smoke  
**Prioridade:** Alta  
**Pré-condição:** Aplicação rodando; usuário acessa `/login`

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Abrir `http://localhost:8100/login` | Página carrega sem erros |
| 2 | Verificar campo CPF | Campo com placeholder "CPF" visível |
| 3 | Verificar campo Senha | Campo com placeholder "Senha" visível |
| 4 | Verificar botão ENTRAR | Botão "ENTRAR" visível e clicável |
| 5 | Verificar link de cadastro | Texto "Clique aqui" visível |
| 6 | Verificar background | Imagem de fundo `planodefundologin.png` aplicada |

**Resultado:** ✅ / ❌

---

### CT-02 — Login com campos vazios

**Tipo:** Validação negativa  
**Prioridade:** Alta  
**Pré-condição:** Tela de login aberta, campos vazios

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Não preencher nenhum campo | Campos permanecem vazios |
| 2 | Clicar em "ENTRAR" | Nenhuma requisição ao backend |
| 3 | Observar feedback | Toast de aviso: *"Preencha CPF e Senha!"* com cor `warning` |
| 4 | Verificar URL | Usuário permanece em `/login` |

**Resultado:** ✅ / ❌

---

### CT-03 — Login com apenas CPF preenchido

**Tipo:** Validação negativa  
**Prioridade:** Alta  
**Pré-condição:** Tela de login aberta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Preencher CPF com `000.000.000-00` | CPF inserido no campo |
| 2 | Deixar campo Senha vazio | Campo permanece vazio |
| 3 | Clicar em "ENTRAR" | Nenhuma requisição ao backend |
| 4 | Observar feedback | Toast: *"Preencha CPF e Senha!"* |

**Resultado:** ✅ / ❌

---

### CT-04 — Login com apenas Senha preenchida

**Tipo:** Validação negativa  
**Prioridade:** Alta  
**Pré-condição:** Tela de login aberta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Deixar campo CPF vazio | Campo permanece vazio |
| 2 | Preencher Senha com `123456` | Senha inserida (mascarada) |
| 3 | Clicar em "ENTRAR" | Nenhuma requisição ao backend |
| 4 | Observar feedback | Toast: *"Preencha CPF e Senha!"* |

**Resultado:** ✅ / ❌

---

### CT-05 — Login com CPF inválido (formato incorreto)

**Tipo:** Validação negativa  
**Prioridade:** Alta  
**Pré-condição:** Tela de login aberta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Preencher CPF com `123.456.789-00` (dígitos verificadores errados) | CPF inserido |
| 2 | Preencher Senha com `123456` | Senha inserida |
| 3 | Clicar em "ENTRAR" | Nenhuma requisição ao backend |
| 4 | Observar feedback | Toast de erro: *"CPF inválido."* com cor `danger` |
| 5 | Verificar URL | Usuário permanece em `/login` |

**Resultado:** ✅ / ❌

---

### CT-06 — Login com CPF de dígitos repetidos

**Tipo:** Validação negativa  
**Prioridade:** Média  
**Pré-condição:** Tela de login aberta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Preencher CPF com `111.111.111-11` | CPF inserido |
| 2 | Preencher Senha com `123456` | Senha inserida |
| 3 | Clicar em "ENTRAR" | Nenhuma requisição ao backend |
| 4 | Observar feedback | Toast de erro: *"CPF inválido."* |

**Resultado:** ✅ / ❌

---

### CT-07 — Login com credenciais inválidas (usuário não existe)

**Tipo:** Validação negativa / Integração  
**Prioridade:** Alta  
**Pré-condição:** Backend rodando em `http://localhost:4000`; CPF não cadastrado

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Preencher CPF com um CPF válido porém não cadastrado (ex: `529.982.247-25`) | CPF inserido |
| 2 | Preencher Senha com `senhaerrada` | Senha inserida |
| 3 | Clicar em "ENTRAR" | Loader *"Entrando..."* exibido brevemente |
| 4 | Backend retorna erro 401/404 | Loader fecha |
| 5 | Observar feedback | Toast de erro com a mensagem retornada pelo backend |
| 6 | Verificar URL | Usuário permanece em `/login` |

**Resultado:** ✅ / ❌

---

### CT-08 — Login com credenciais válidas (sucesso)

**Tipo:** Funcional positivo / Integração  
**Prioridade:** Alta  
**Pré-condição:** Backend rodando; usuário cadastrado com CPF `529.982.247-25` e senha `senha123`

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Preencher CPF com `529.982.247-25` | CPF inserido |
| 2 | Preencher Senha com `senha123` | Senha inserida |
| 3 | Clicar em "ENTRAR" | Loader *"Entrando..."* exibido |
| 4 | Backend retorna token e dados do usuário | Loader fecha |
| 5 | Observar feedback | Toast de sucesso exibido |
| 6 | Verificar URL | Redirecionamento para `/home` |
| 7 | Verificar localStorage | `auth_token` e `usuario_data` salvos |

**Resultado:** ✅ / ❌

---

### CT-09 — Navegação para tela de cadastro

**Tipo:** Navegação  
**Prioridade:** Média  
**Pré-condição:** Tela de login aberta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Localizar texto "Clique aqui" | Elemento visível na tela |
| 2 | Clicar em "Clique aqui" | Navegação disparada |
| 3 | Verificar URL | Redirecionamento para `/cadastro` |
| 4 | Verificar tela exibida | Tela de cadastro renderizada corretamente |

**Resultado:** ✅ / ❌

---

### CT-10 — Visibilidade da senha (campo mascarado)

**Tipo:** Funcional  
**Prioridade:** Baixa  
**Pré-condição:** Tela de login aberta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Clicar no campo Senha | Campo recebe foco |
| 2 | Digitar `minha_senha_123` | Caracteres aparecem mascarados (•••) |
| 3 | Inspecionar atributo `type` do input | Valor = `"password"` |

**Resultado:** ✅ / ❌

---

### CT-11 — Loader exibido durante requisição

**Tipo:** Funcional / UX  
**Prioridade:** Média  
**Pré-condição:** Backend com delay simulado ou conexão lenta

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Preencher CPF e Senha válidos | Campos preenchidos |
| 2 | Clicar em "ENTRAR" | Loader com mensagem *"Entrando..."* aparece imediatamente |
| 3 | Aguardar resposta | Loader fecha após resposta do backend |

**Resultado:** ✅ / ❌

---

### CT-12 — Redirecionamento automático se já autenticado

**Tipo:** Segurança / Navegação  
**Prioridade:** Alta  
**Pré-condição:** `auth_token` válido presente no `localStorage`

| Passo | Ação | Resultado Esperado |
|-------|------|--------------------|
| 1 | Inserir token válido no `localStorage` manualmente | Token inserido |
| 2 | Navegar para `/home` diretamente | AuthGuard valida o token |
| 3 | Verificar comportamento | Usuário acessa `/home` sem passar pelo login |

**Resultado:** ✅ / ❌
