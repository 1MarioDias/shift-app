require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

describe('Testes de Usabilidade (E2E) com Selenium', () => {
    let driver;

    // timeout de 30s
    jest.setTimeout(30000);

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().setTimeouts({ implicit: 10000 });
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it('Deve permitir que um utilizador faça login com sucesso e seja redirecionado', async () => {
        await driver.get('http://localhost:5173/login');

        const emailInput = await driver.findElement(By.id('login-email'));
        const passwordInput = await driver.findElement(By.id('login-password'));
        const submitButton = await driver.findElement(By.css('button[type="submit"]'));

        await emailInput.sendKeys('mario@mario.com');
        await passwordInput.sendKeys('mario');
        await submitButton.click();

        await driver.wait(until.urlIs('http://localhost:5173/user'), 10000);

        // Verifica se o link do perfil existe, confirmando o login
        const profileLink = await driver.findElement(By.css('a[href="/user"]'));
        expect(profileLink).not.toBeNull();
    });
});