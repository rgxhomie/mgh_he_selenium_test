const { WebElement, until } = require("selenium-webdriver");
const { By,Key,Builder } = require("selenium-webdriver");
require("chromedriver");

const BOT_URL = "https://chat.mcgrawhill-staging.onereach.ai/7VOY6M7pQN6s0rQRSfAGMg/0ynr4kd?loader=light";
const INPUT_AREA_XPATH = "//*[@id=\"app\"]/div/div[4]/div/div/div[2]/textarea";
const BUTTON_MENU_XPATH = "//button[@class=\"menu-option\"]";
const BUTTON_ACTION_XPATH = "//button[@class=\"rwc-button rwc-button--outlined rwc-button--primary\"]";
let runTest = true;
let bot_path_taken;

async function main() {
    while(runTest) {
        bot_path_taken = [];
        await startCurrentTest();
        console.log('current path', bot_path_taken);
    }
}

async function startCurrentTest() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get(BOT_URL);
        
        await driver.wait(until.elementLocated(By.xpath(INPUT_AREA_XPATH)), 30000);
        let currentElement = await driver.findElement(By.xpath(INPUT_AREA_XPATH));
        await currentElement.sendKeys("SELENIUM_TEST", Key.ENTER);

        let lastMenuReached = false;
        while(!lastMenuReached) {
            let currentMenuType = await checkButtonsType(driver);
            if(currentMenuType == 'menu') {
                await interactWithMenu(driver, BUTTON_MENU_XPATH);
            } else if (currentMenuType == 'action') {
                await interactWithMenu(driver, BUTTON_ACTION_XPATH);
            } else {
                lastMenuReached = true;
                continue;
            }
            
            await sleep(10000);
        }
    }
    finally {
        //todo: fetch api
        await driver.quit();
    }
}

async function checkButtonsType(driver) {
    let type;
    try {
        await driver.wait(until.elementLocated(By.xpath(BUTTON_MENU_XPATH)), 10000);
        type = 'menu'
    }
    catch {
        try {
            await driver.wait(until.elementLocated(By.xpath(BUTTON_ACTION_XPATH)), 10000);
            type = 'action';
        }
        catch {
            type = 'end';
        }
    }
    return type;
}

async function interactWithMenu(driver, xpath) {
    await driver.wait(until.elementLocated(By.xpath(xpath)), 5000);
    let currentButtons = await driver.findElements(By.xpath(xpath));
    let buttonsQuantity = currentButtons.length - 1;
    let chosenButton = Math.floor(Math.random() * buttonsQuantity);
    if (buttonsQuantity == 1) chosenButton = 1;
    let i = 0;
    for(let button of currentButtons) {
        if(i == chosenButton) {
            bot_path_taken.push(await button.getText());
            await button.click();
            break;
        }
        i++;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


main();