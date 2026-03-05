const { Builder, Browser, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL   = 'http://localhost:8100';
const LOGIN_URL  = `${BASE_URL}/login`;
const TIMEOUT    = 10_000;

const CPF_VALIDO_CADASTRADO     = '529.982.247-25';
const SENHA_VALIDA               = 'senha123';
const CPF_VALIDO_NAO_CADASTRADO = '012.345.678-90';

async function esperar(driver, seletor, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(By.css(seletor)), timeout);
}

async function esperarTexto(driver, texto, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),'${texto}')]`)), timeout);
}

async function digitarNoIonInput(driver, placeholder, valor) {
  const seletor = `ion-input[placeholder="${placeholder}"] input, input[placeholder="${placeholder}"]`;
  const campo = await esperar(driver, seletor);
  await campo.clear();
  await campo.sendKeys(valor);
  return campo;
}

async function clicarBotao(driver, texto) {
  const botao = await esperar(driver, 'ion-button');
  await botao.click();
}

async function lerToast(driver, timeout = 5000) {
  try {
    await driver.wait(until.elementLocated(By.css('ion-toast')), timeout);
    const toast = await driver.findElement(By.css('ion-toast'));
    await driver.sleep(500);
    const msg = await toast.getAttribute('message');
    return msg || '';
  } catch {
    return '';
  }
}

async function urlAtual(driver) {
  return driver.getCurrentUrl();
}

async function criarDriver(headless = false) {
  const opts = new chrome.Options();
  if (headless) opts.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
  return new Builder().forBrowser(Browser.CHROME).setChromeOptions(opts).build();
}

const resultados = [];

function registrar(id, descricao, passou, erro = null) {
  const status = passou ? '✅ PASSOU' : '❌ FALHOU';
  resultados.push({ id, descricao, passou, erro });
  console.log(`\n[${id}] ${descricao}`);
  console.log(`  → ${status}${erro ? ' | Erro: ' + erro : ''}`);
}

/**
 * CT-01 — Verifica se todos os elementos essenciais da tela de login
 * estão presentes e visíveis: campo CPF, campo Senha, botão ENTRAR
 * e o link de navegação para o cadastro.
 */
async function ct01_renderizacao(driver) {
  const id = 'CT-01';
  const desc = 'Renderização da tela de login';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    const campoCPF = await esperar(driver, 'ion-input[placeholder="CPF"] input, input[placeholder="CPF"]');
    if (!campoCPF) throw new Error('Campo CPF não encontrado');

    const campoSenha = await esperar(driver, 'ion-input[placeholder="Senha"] input, input[placeholder="Senha"]');
    if (!campoSenha) throw new Error('Campo Senha não encontrado');

    const botao = await esperar(driver, 'ion-button');
    if (!botao) throw new Error('Botão ENTRAR não encontrado');

    const link = await esperarTexto(driver, 'Clique aqui');
    if (!link) throw new Error('Link "Clique aqui" não encontrado');

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-02 — Garante que clicar em ENTRAR sem preencher nenhum campo
 * exibe o toast de aviso "Preencha CPF e Senha!" e mantém
 * o usuário na tela de login, sem chamar o backend.
 */
async function ct02_camposVazios(driver) {
  const id = 'CT-02';
  const desc = 'Login com campos vazios';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await clicarBotao(driver, 'ENTRAR');
    await driver.sleep(1000);

    const toast = await lerToast(driver);
    if (!toast.includes('Preencha CPF e Senha')) {
      throw new Error(`Toast inesperado: "${toast}"`);
    }

    const url = await urlAtual(driver);
    if (!url.includes('/login')) throw new Error('Redirecionou indevidamente: ' + url);

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-03 — Garante que preencher somente o CPF e clicar em ENTRAR
 * ainda exibe o toast de aviso, pois a senha é obrigatória.
 */
async function ct03_apenasCPF(driver) {
  const id = 'CT-03';
  const desc = 'Login com apenas CPF preenchido';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await digitarNoIonInput(driver, 'CPF', '000.000.000-00');
    await clicarBotao(driver, 'ENTRAR');
    await driver.sleep(1000);

    const toast = await lerToast(driver);
    if (!toast.includes('Preencha CPF e Senha')) {
      throw new Error(`Toast inesperado: "${toast}"`);
    }

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-04 — Garante que preencher somente a senha e clicar em ENTRAR
 * ainda exibe o toast de aviso, pois o CPF é obrigatório.
 */
async function ct04_apenasSenha(driver) {
  const id = 'CT-04';
  const desc = 'Login com apenas Senha preenchida';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await digitarNoIonInput(driver, 'Senha', '123456');
    await clicarBotao(driver, 'ENTRAR');
    await driver.sleep(1000);

    const toast = await lerToast(driver);
    if (!toast.includes('Preencha CPF e Senha')) {
      throw new Error(`Toast inesperado: "${toast}"`);
    }

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-05 — Verifica que um CPF com dígitos verificadores incorretos
 * é rejeitado pela validação do componente antes de qualquer
 * chamada ao backend, exibindo o toast "CPF inválido."
 */
async function ct05_cpfInvalido(driver) {
  const id = 'CT-05';
  const desc = 'Login com CPF inválido (dígitos verificadores errados)';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await digitarNoIonInput(driver, 'CPF', '123.456.789-00');
    await digitarNoIonInput(driver, 'Senha', '123456');
    await clicarBotao(driver, 'ENTRAR');
    await driver.sleep(1000);

    const toast = await lerToast(driver);
    if (!toast.includes('CPF inválido')) {
      throw new Error(`Toast inesperado: "${toast}"`);
    }

    const url = await urlAtual(driver);
    if (!url.includes('/login')) throw new Error('Redirecionou indevidamente: ' + url);

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-06 — Verifica que CPFs formados por dígitos repetidos (ex: 111.111.111-11),
 * que são matematicamente inválidos, também são rejeitados pela
 * validação do componente com o toast "CPF inválido."
 */
async function ct06_cpfDigitosRepetidos(driver) {
  const id = 'CT-06';
  const desc = 'Login com CPF de dígitos repetidos';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await digitarNoIonInput(driver, 'CPF', '111.111.111-11');
    await digitarNoIonInput(driver, 'Senha', '123456');
    await clicarBotao(driver, 'ENTRAR');
    await driver.sleep(1000);

    const toast = await lerToast(driver);
    if (!toast.includes('CPF inválido')) {
      throw new Error(`Toast inesperado: "${toast}"`);
    }

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-07 — Testa o fluxo de erro de integração com o backend:
 * um CPF matematicamente válido mas não cadastrado é enviado ao servidor,
 * que retorna erro. O teste confirma que o usuário permanece em /login
 * e que nenhum redirecionamento indevido ocorre.
 * Requer o backend rodando em localhost:4000.
 */
async function ct07_credenciaisInvalidas(driver) {
  const id = 'CT-07';
  const desc = 'Login com credenciais inválidas (usuário não cadastrado)';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await digitarNoIonInput(driver, 'CPF', CPF_VALIDO_NAO_CADASTRADO);
    await digitarNoIonInput(driver, 'Senha', 'senhaerrada');
    await clicarBotao(driver, 'ENTRAR');
    await driver.sleep(4000);

    const url = await urlAtual(driver);
    if (!url.includes('/login')) {
      throw new Error('Redirecionou indevidamente para: ' + url);
    }

    const toast = await lerToast(driver, 6000);
    if (!toast) {
      console.log('  ℹ️  Toast não capturado (pode ter sumido), mas URL ainda é /login');
    }

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-08 — Testa o fluxo completo de login bem-sucedido:
 * preenche CPF e senha de um usuário cadastrado, confirma que
 * o redirecionamento para /home ocorre e que o token de autenticação
 * foi salvo no localStorage.
 * Requer o backend rodando e o usuário cadastrado no banco.
 */
async function ct08_loginSucesso(driver) {
  const id = 'CT-08';
  const desc = 'Login com credenciais válidas (sucesso e redirecionamento)';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    await digitarNoIonInput(driver, 'CPF', CPF_VALIDO_CADASTRADO);
    await digitarNoIonInput(driver, 'Senha', SENHA_VALIDA);
    await clicarBotao(driver, 'ENTRAR');

    await driver.wait(until.urlContains('/home'), 8000);

    const url = await urlAtual(driver);
    if (!url.includes('/home')) throw new Error('Não redirecionou para /home. URL: ' + url);

    const token = await driver.executeScript("return localStorage.getItem('auth_token')");
    if (!token) throw new Error('Token não salvo no localStorage');

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-09 — Verifica que clicar no link "Clique aqui" na tela de login
 * navega corretamente para a tela de cadastro (/cadastro).
 */
async function ct09_navegacaoCadastro(driver) {
  const id = 'CT-09';
  const desc = 'Clique em "Clique aqui" navega para /cadastro';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    const link = await esperarTexto(driver, 'Clique aqui');
    await link.click();
    await driver.sleep(1500);

    const url = await urlAtual(driver);
    if (!url.includes('/cadastro')) {
      throw new Error('Não redirecionou para /cadastro. URL: ' + url);
    }

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

/**
 * CT-10 — Confirma que o campo de senha está configurado com
 * type="password", garantindo que os caracteres digitados
 * fiquem mascarados e não visíveis ao usuário.
 */
async function ct10_senhaOculta(driver) {
  const id = 'CT-10';
  const desc = 'Campo Senha renderizado com type="password"';
  try {
    await driver.get(LOGIN_URL);
    await driver.sleep(1500);

    const campoSenha = await esperar(driver, 'ion-input[placeholder="Senha"] input, input[placeholder="Senha"]');
    const tipo = await campoSenha.getAttribute('type');

    if (tipo !== 'password') {
      throw new Error(`Campo Senha com type="${tipo}" em vez de "password"`);
    }

    registrar(id, desc, true);
  } catch (e) {
    registrar(id, desc, false, e.message);
  }
}

async function executarTestes() {
  console.log('══════════════════════════════════════════════');
  console.log('   TESTES DE UI — TELA DE LOGIN — BusTap     ');
  console.log('══════════════════════════════════════════════');
  console.log(`Base URL: ${LOGIN_URL}`);
  console.log('----------------------------------------------\n');

  const driver = await criarDriver(false);

  try {
    await ct01_renderizacao(driver);
    await ct02_camposVazios(driver);
    await ct03_apenasCPF(driver);
    await ct04_apenasSenha(driver);
    await ct05_cpfInvalido(driver);
    await ct06_cpfDigitosRepetidos(driver);
    await ct07_credenciaisInvalidas(driver);
    await ct08_loginSucesso(driver);
    await ct09_navegacaoCadastro(driver);
    await ct10_senhaOculta(driver);
  } finally {
    await driver.quit();
  }

  const passou = resultados.filter(r => r.passou).length;
  const falhou = resultados.filter(r => !r.passou).length;

  console.log('\n══════════════════════════════════════════════');
  console.log('                  RESULTADO FINAL             ');
  console.log('══════════════════════════════════════════════');
  resultados.forEach(r => {
    console.log(`  ${r.passou ? '✅' : '❌'} [${r.id}] ${r.descricao}`);
    if (r.erro) console.log(`       ↳ ${r.erro}`);
  });
  console.log('----------------------------------------------');
  console.log(`  Total: ${resultados.length} | ✅ Passou: ${passou} | ❌ Falhou: ${falhou}`);
  console.log('══════════════════════════════════════════════\n');

  process.exit(falhou > 0 ? 1 : 0);
}

executarTestes().catch(err => {
  console.error('Erro fatal nos testes:', err);
  process.exit(1);
});