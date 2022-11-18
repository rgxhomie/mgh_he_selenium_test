const { WebElement, until } = require("selenium-webdriver");
const { By,Key,Builder } = require("selenium-webdriver");
require("chromedriver");

const API_STORE_PATH_URL = "https://em.mcgrawhill-staging.api.onereach.ai/http/ed5398e8-cee9-40de-acd2-b41149f00632/mgh-path-collector";
const BOT_URL = "https://chat.mcgrawhill-staging.onereach.ai/7VOY6M7pQN6s0rQRSfAGMg/0ynr4kd?loader=light";
const INPUT_AREA_XPATH = "//*[@id=\"app\"]/div/div[4]/div/div/div[2]/textarea";
const BUTTON_MENU_XPATH = "//button[@class=\"menu-option\"]";
const BUTTON_ACTION_XPATH = "//button[@class=\"rwc-button rwc-button--outlined rwc-button--primary\"]";
const BUTTON_END_XPATH = "//button[@class=\"rwc-button rwc-button--filled rwc-button--primary\"]";

let runTest = 0;
let testId = 0;
let bot_path_taken;
let nextWaitingTime = 20000;

async function main(iterationsToMake) {
    while(runTest < iterationsToMake) {
        runTest++;
        bot_path_taken = [];
        testId = Math.floor(Math.random() * 9999) + 1;
        await startCurrentTest();
        console.log('current path', bot_path_taken);
    }
}

async function startCurrentTest() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get(BOT_URL);
        
        await driver.wait(until.elementLocated(By.xpath(INPUT_AREA_XPATH)), nextWaitingTime);
        nextWaitingTime = 10000;
        let currentElement = await driver.findElement(By.xpath(INPUT_AREA_XPATH));
        await currentElement.sendKeys(`SELENIUM_TEST_${testId}`, Key.ENTER);

        let lastMenuReached = false;
        while(!lastMenuReached) {
            let currentMenuType = await checkButtonsType(driver);
            if(currentMenuType == 'menu') {
                await interactWithMenu(driver, BUTTON_MENU_XPATH);
            } else if (currentMenuType == 'action') {
                await interactWithMenu(driver, BUTTON_ACTION_XPATH);
            } else if (currentMenuType == 'close') {
                await interactWithMenu(driver, BUTTON_END_XPATH);
            } else {
                lastMenuReached = true;
                continue;
            }
            
            await sleep(nextWaitingTime);
        }
    }
    finally {
        let bodyData = new FormData();
        bodyData.append('testID', `SELENIUM_TEST_${testId}`);
        bodyData.append('takenPath', bot_path_taken);

        fetch(API_STORE_PATH_URL, {
            method: 'POST',
            body: bodyData
          })
          .catch(err => {
            console.log('Error occured on trying to fetch API', err);
          });

        await driver.quit();
    }
}

async function checkButtonsType(driver) {
    try {
        await driver.wait(until.elementLocated(By.xpath(BUTTON_MENU_XPATH)), nextWaitingTime);
        return 'menu';
    }
    catch {
        try {
            await driver.wait(until.elementLocated(By.xpath(BUTTON_END_XPATH)), nextWaitingTime);
            return 'close';
        }
        catch {
            try {
                await driver.wait(until.elementLocated(By.xpath(BUTTON_ACTION_XPATH)), 1000);
                return 'action';
            }
            catch {
                return 'end';
            }
        }
    }
}

async function interactWithMenu(driver, xpath) {
    let currentButtons = await driver.findElements(By.xpath(xpath));
    let buttonsQuantity = currentButtons.length;
    let chosenButton = Math.floor(Math.random() * buttonsQuantity);
    let i = 0;
    for(let button of currentButtons) {
        if(i == chosenButton) {
            bot_path_taken.push(await button.getText());
            await button.click();
            nextWaitingTime = 5000;
            break;
        }
        i++;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


main(10);