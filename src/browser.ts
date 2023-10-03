import {join} from "path";
import {launch, Browser} from "puppeteer";

const url = "https://trending.bid"
const dir = join(__dirname, '../data/screenshots')

export async function getToken({login, password}: { login: string, password: string }) {
    const browser = await launch({
                                     channel: "chrome",
                                     headless: false,
                                     // userDataDir: join(__dirname, '../../userData'),
                                     executablePath: "/usr/bin/google-chrome-stable"
                                 })
    const page = await browser.newPage()
    try {

        await page.goto("https://trending.bid/login", {
            waitUntil: [
                "domcontentloaded",
                "networkidle0",
                "networkidle2",
                "load",

            ],
            timeout: 5 * 60 * 1e3,
        })
        const title = await page.title()
        if (title != "Log in on Trending.bid") {
            await page.screenshot({path: `${dir}/${(new Date()).getTime()}.png`, fullPage: true})
            throw new Error()
        }
        await page.type('#username', login)
        await page.type('#password', password,{delay: 170})
        await page.click('#btn-submit')
        const response = await page.waitForResponse('https://trending.bid/advertiser/news')
        if (!response.ok()) {
            throw new Error()
        }
        const cookies = await page.cookies();
        const [token,] = cookies
            .filter(cookie => cookie.domain == 'trending.bid' && cookie.name == "PHPSESSID")
            .map(cookie => cookie.value)
        if (token === undefined) {
            throw new Error()
        }
        return token
    } catch (e) {
        console.log(e)
        return false
    } finally {
        await page.close()
        await browser.close()
    }


}

import axios from 'axios';
import * as querystring from "querystring";
export namespace Response{
    export interface getProfile {
        code: number;
        data: Data;
    }

    export interface Data {
        id:                   string;
        login:                string;
        role:                 string;
        advertiser_tz:        null;
        balance:              number;
        emailConfirmed:       boolean;
        isBetaTester:         boolean;
        isAdminLoggedAsUser:  boolean;
        payAllowed:           boolean;
        email:                string;
        skype:                string;
        messenger:            string;
        personalAccount:      number;
        firstName:            string;
        secondName:           string;
        country:              string;
        city:                 string;
        address:              string;
        vatNumber:            string;
        useVat:               string;
        referrerPercent:      string;
        oldPassword:          null;
        newPassword:          null;
        newPassword2:         null;
        notificationSettings: NotificationSetting[];
        roundPrecision:       string;
        moneyPrecision:       string;
        manager:              Manager[];
        currency:             string;
        langs:                Langs;
    }

    export interface Langs {
        list: string[];
        key:  string;
    }

    export interface Manager {
        userId:   null;
        name:     string;
        email:    string;
        skype:    string;
        telegram: string;
    }

    export interface NotificationSetting {
        id:      number;
        name:    string;
        enabled: boolean;
    }

}
export async function getBalance(token: string) {
    const response = await axios.get<Response.getProfile>("https://trending.bid/api/user/getprofile", {
        adapter: "http",
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            "User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            'Cache': "no-cache",
            'Cookie': `PHPSESSID=${token}`
        },
        responseType: "json",
        withCredentials: true,
        timeout: 15e3
    })

    if(response.status === 200){
        const  {balance,currency} = response.data.data
        return {
            balance,
            currency
        }
    }else{
        throw new Error()
    }


}

export async function getBalance2(token: string) {
    const browser = await launch({
                                     channel: "chrome",
                                     headless: true,
                                     executablePath: "/usr/bin/google-chrome-stable"
                                 })
    const page = await browser.newPage()
    try {
        await page.setCookie({
                                 domain: url,
                                 name: 'PHPSESSID',
                                 path: '/',
                                 value: token
                             });

        await page.goto("https://trending.bid/", {
            waitUntil: [
                "domcontentloaded",
                "networkidle0",
                "networkidle2",
                "load",

            ],
            timeout: 5 * 60 * 1e3,
        })
        return await page.waitForFunction(() => {
            const block = window.document.querySelector('#root > div > header > nav > div > ul > li.user-balance-wrapper > a.nav-link.hovered-bg.ellipsis.active > span > span')
            if (block === null) {
                return null
            }
            const result = /(\d+|\d+\.\d+)($|₽)/gm.exec(block.textContent as string)
            if (result == null) {
                return null
            }
            const [, balance, money] = result
            return {
                balance: (typeof balance === "string")
                    ? parseInt(balance)
                    : 0,
                money
            }
        })
    } catch (e) {
        const file = `${(new Date()).getTime()}.png`
        await page.screenshot({path: `${dir}/${file}`, fullPage: true})
        console.log(e, file)
        return false
    } finally {
        await page.close()
        await browser.close()
    }
}
