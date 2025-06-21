require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

describe('Testes de Usabilidade (E2E) - Fluxos do Utilizador', () => {
    let driver;

    jest.setTimeout(40000);

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().setTimeouts({ implicit: 10000 });
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    const loginUser = async (email, password) => {
        await driver.get('http://localhost:5173/login');
        await driver.findElement(By.id('login-email')).sendKeys(email);
        await driver.findElement(By.id('login-password')).sendKeys(password);
        await driver.findElement(By.css('button[type="submit"]')).click();
        await driver.wait(until.elementLocated(By.xpath("//p[contains(., 'Welcome')]")), 10000);
    };

    it('Deve permitir que um novo utilizador se registe com sucesso', async () => {
        await driver.get('http://localhost:5173/login');

        // Gera um email único para garantir que o teste não falha por email duplicado
        const uniqueEmail = `testuser_${Date.now()}@example.com`;

        await driver.findElement(By.xpath("//button[contains(., 'Register')]")).click();
        // NOTA: Os seletores 'register-username', 'register-email', etc.,
        // devem corresponder aos IDs ou nomes dos seus campos no formulário de registo.
        await driver.findElement(By.id('register-username')).sendKeys('Test User Selenium');
        await driver.findElement(By.id('register-email')).sendKeys(uniqueEmail);
        await driver.findElement(By.id('register-password')).sendKeys('password123');
        await driver.findElement(By.id('register-confirm')).sendKeys('password123');
        const submitButton = await driver.findElement(By.xpath("//button[contains(., 'Create account')]"));
        await submitButton.click();

        await driver.wait(until.urlIs('http://localhost:5173/login'), 10000);
        const loginForm = await driver.findElement(By.id('login-email'));
        expect(loginForm).not.toBeNull();
    });

    it('Deve permitir que um utilizador autenticado adicione um comentário a um evento', async () => {
        await loginUser('mario@mario.com', 'mario');
        await driver.get('http://localhost:5173/event/12');

        const commentInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Your comment..."]')), 10000);
        const submitButton = await driver.findElement(By.xpath("//button[contains(., 'Post Comment')]"));

        const testComment = `Comentário Selenium! ${new Date().toLocaleTimeString()}`;
        await commentInput.sendKeys(testComment);
        await submitButton.click();

        const newCommentElement = await driver.wait(
            until.elementLocated(By.xpath(`//*[contains(text(), "${testComment}")]`)),
            10000,
            'O novo comentário não foi encontrado na página.'
        );
        expect(newCommentElement).not.toBeNull();
    });

    it('Deve permitir que um utilizador autenticado faça logout', async () => {
        await loginUser('mario@mario.com', 'mario');

        const profileMenuButton = await driver.wait(until.elementLocated(By.xpath('//*[@id="app"]/div[2]/nav/div[3]/div[2]/button')), 10000);
        await profileMenuButton.click();

        const logoutButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Logout')]")), 5000);
        await logoutButton.click();

        await driver.wait(until.urlIs('http://localhost:5173/login'), 10000);
        const emailInput = await driver.findElement(By.id('login-email'));
        expect(emailInput).not.toBeNull();
    });
});